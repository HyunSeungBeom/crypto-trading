import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  try {
    const [user, holdings] = await Promise.all([
      prisma.user.findUniqueOrThrow({
        where: { id: session.user.id },
        select: { balance: true },
      }),
      prisma.holding.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      balance: user.balance,
      holdings,
    });
  } catch {
    return NextResponse.json(
      { error: "포트폴리오 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
