"use server";

import { prisma, auth } from "@/shared/api/serverApi";
import type { TransactionsResponse } from "@/entities/transaction";

export async function fetchTransactions(params: {
  page: number;
  limit?: number;
  side?: string;
}): Promise<TransactionsResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return { transactions: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
  }

  const page = params.page;
  const limit = params.limit ?? 20;

  const where = {
    userId: session.user.id,
    ...(params.side && { side: params.side as "BUY" | "SELL" }),
  };

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions: transactions.map((tx) => ({
      id: tx.id,
      symbol: tx.symbol,
      side: tx.side as "BUY" | "SELL",
      quantity: tx.quantity,
      price: tx.price,
      total: tx.total,
      createdAt: tx.createdAt.toISOString(),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
