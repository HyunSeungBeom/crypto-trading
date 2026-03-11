export const queryKeys = {
  coins: {
    all: ["coins"] as const,
    klines: (symbol: string, interval: string) =>
      ["coins", "klines", symbol, interval] as const,
  },
  portfolio: {
    all: ["portfolio"] as const,
  },
  transactions: {
    list: (params: { page: number; side?: string }) =>
      ["transactions", params] as const,
  },
  alerts: {
    all: ["alerts"] as const,
  },
  leaderboard: {
    all: ["leaderboard"] as const,
  },
} as const;
