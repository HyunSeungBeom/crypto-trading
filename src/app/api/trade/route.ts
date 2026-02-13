import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const tradeSchema = z.object({
  symbol: z.string().min(1),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.number().positive("수량은 0보다 커야 합니다"),
  price: z.number().positive("가격은 0보다 커야 합니다"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { symbol, side, quantity, price } = tradeSchema.parse(body);
    const total = quantity * price;
    const userId = session.user.id;

    if (side === "BUY") {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
        });

        if (user.balance < total) {
          throw new Error("잔고가 부족합니다");
        }

        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: total } },
        });

        const existing = await tx.holding.findUnique({
          where: { userId_symbol: { userId, symbol } },
        });

        if (existing) {
          const newQuantity = existing.quantity + quantity;
          const newAvgPrice =
            (existing.avgPrice * existing.quantity + price * quantity) /
            newQuantity;

          await tx.holding.update({
            where: { id: existing.id },
            data: { quantity: newQuantity, avgPrice: newAvgPrice },
          });
        } else {
          await tx.holding.create({
            data: { userId, symbol, quantity, avgPrice: price },
          });
        }

        return tx.transaction.create({
          data: { userId, symbol, side: "BUY", quantity, price, total },
        });
      });

      return NextResponse.json(result, { status: 201 });
    } else {
      const result = await prisma.$transaction(async (tx) => {
        const holding = await tx.holding.findUnique({
          where: { userId_symbol: { userId, symbol } },
        });

        if (!holding || holding.quantity < quantity) {
          throw new Error("보유량이 부족합니다");
        }

        await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: total } },
        });

        const remainingQuantity = holding.quantity - quantity;
        if (remainingQuantity <= 0) {
          await tx.holding.delete({ where: { id: holding.id } });
        } else {
          await tx.holding.update({
            where: { id: holding.id },
            data: { quantity: remainingQuantity },
          });
        }

        return tx.transaction.create({
          data: { userId, symbol, side: "SELL", quantity, price, total },
        });
      });

      return NextResponse.json(result, { status: 201 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    const message =
      error instanceof Error ? error.message : "거래 처리에 실패했습니다";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
