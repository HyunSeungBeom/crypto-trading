import { apiClient } from "@/shared/api";
import type { TickerData, KlineData, OrderBookData } from "@/entities/coin";

export const coinApi = {
  getTickers(): Promise<TickerData[]> {
    return apiClient.get("api/coins").json();
  },

  getKlines(
    symbol: string,
    interval: string,
    limit: number = 500,
    endTime?: number,
  ): Promise<KlineData[]> {
    const searchParams: Record<string, string | number> = { interval, limit };
    if (endTime) searchParams.endTime = endTime;
    return apiClient
      .get(`api/coins/${symbol}/klines`, { searchParams })
      .json();
  },

  getOrderBook(symbol: string, limit: number = 20): Promise<OrderBookData> {
    return apiClient
      .get(`api/coins/${symbol}/orderbook`, {
        searchParams: { limit },
      })
      .json();
  },
};
