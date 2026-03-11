"use server";

import { z } from "zod";
import { prisma, auth } from "@/shared/api/serverApi";

const tradeSchema = z.object({
  symbol: z.string().min(1),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.number().positive("수량은 0보다 커야 합니다"),
  price: z.number().positive("가격은 0보다 커야 합니다"),
});

type TradeResult =
  | { success: true; transaction: { id: string; symbol: string; side: string; quantity: number; price: number; total: number } }
  | { success: false; error: string };

export async function executeTrade(params: {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
}): Promise<TradeResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "인증이 필요합니다" };
  }

  try {
    const { symbol, side, quantity, price } = tradeSchema.parse(params);
    const totalUSDT = quantity * price;
    const USDT_TO_KRW = 1350;
    const totalKRW = totalUSDT * USDT_TO_KRW;
    const userId = session.user.id;

    if (side === "BUY") {
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId },
        });

        if (user.balance < totalKRW) {
          throw new Error("잔고가 부족합니다");
        }

        await tx.user.update({
          where: { id: userId },
          data: { balance: { decrement: totalKRW } },
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
          data: { userId, symbol, side: "BUY", quantity, price, total: totalKRW },
        });
      });

      return {
        success: true,
        transaction: {
          id: result.id,
          symbol: result.symbol,
          side: result.side,
          quantity: result.quantity,
          price: result.price,
          total: result.total,
        },
      };
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
          data: { balance: { increment: totalKRW } },
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
          data: { userId, symbol, side: "SELL", quantity, price, total: totalKRW },
        });
      });

      return {
        success: true,
        transaction: {
          id: result.id,
          symbol: result.symbol,
          side: result.side,
          quantity: result.quantity,
          price: result.price,
          total: result.total,
        },
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    const message =
      error instanceof Error ? error.message : "거래 처리에 실패했습니다";
    return { success: false, error: message };
  }
}
