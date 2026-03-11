import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/shared/lib/auth";
import { prisma } from "@/shared/lib/prisma";

const alertSchema = z.object({
  symbol: z.string().min(1),
  targetPrice: z.number().positive(),
  condition: z.enum(["ABOVE", "BELOW"]),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alerts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = alertSchema.parse(body);

    const alert = await prisma.priceAlert.create({
      data: { ...data, userId: session.user.id },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "알림 생성에 실패했습니다" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "알림 ID가 필요합니다" }, { status: 400 });
  }

  // 본인의 알림만 삭제 가능
  const alert = await prisma.priceAlert.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!alert) {
    return NextResponse.json(
      { error: "알림을 찾을 수 없습니다" },
      { status: 404 }
    );
  }

  await prisma.priceAlert.delete({ where: { id } });
  return NextResponse.json({ message: "알림이 삭제되었습니다" });
}
