"use server";

import { cache } from "react";
import { prisma } from "@/shared/api/serverApi";
import type { LeaderboardUser } from "@/entities/user";

export const fetchLeaderboard = cache(async (): Promise<LeaderboardUser[]> => {
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

  return users
    .map((user) => {
      const holdingsValue = user.holdings.reduce(
        (sum, h) => sum + h.quantity * h.avgPrice,
        0,
      );

      return {
        id: user.id,
        name: user.name || "익명",
        balance: user.balance,
        holdings: user.holdings,
        totalValue: user.balance + holdingsValue,
        rank: 0,
      };
    })
    .sort((a, b) => b.totalValue - a.totalValue)
    .map((user, index) => ({ ...user, rank: index + 1 }));
});
