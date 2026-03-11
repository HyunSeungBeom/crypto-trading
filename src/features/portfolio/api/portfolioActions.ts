"use server";

import { prisma, auth } from "@/shared/api/serverApi";
import type { PortfolioData } from "@/entities/holding";

export async function fetchPortfolio(): Promise<PortfolioData | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

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

  return {
    balance: user.balance,
    holdings: holdings.map((h) => ({
      id: h.id,
      symbol: h.symbol,
      quantity: h.quantity,
      avgPrice: h.avgPrice,
    })),
  };
}
