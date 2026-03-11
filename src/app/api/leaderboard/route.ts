import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";

interface LeaderboardEntry {
  id: string;
  name: string | null;
  balance: number;
  holdingsValue: number;
  holdings: { symbol: string; quantity: number; avgPrice: number }[];
  totalValue: number;
  rank: number;
}

let cache: { data: LeaderboardEntry[]; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 60초

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        balance: true,
        holdings: {
          select: { symbol: true, quantity: true, avgPrice: true },
        },
      },
    });

    const leaderboard: LeaderboardEntry[] = users
      .map((user: { id: string; name: string | null; balance: number; holdings: { symbol: string; quantity: number; avgPrice: number }[] }) => {
        const holdingsValue = user.holdings.reduce(
          (sum: number, h: { quantity: number; avgPrice: number }) => sum + h.quantity * h.avgPrice,
          0
        );

        return {
          id: user.id,
          name: user.name || "익명",
          balance: user.balance,
          holdingsValue,
          holdings: user.holdings,
          totalValue: user.balance + holdingsValue,
          rank: 0,
        };
      })
      .sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.totalValue - a.totalValue)
      .map((user: LeaderboardEntry, index: number) => ({ ...user, rank: index + 1 }));

    cache = { data: leaderboard, timestamp: Date.now() };
    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json(
      { error: "랭킹 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
