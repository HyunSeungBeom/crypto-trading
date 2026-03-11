import { apiClient } from "@/shared/api";
import type { TickerData, KlineData } from "@/entities/coin";

export const coinApi = {
  getTickers(): Promise<TickerData[]> {
    return apiClient.get("api/coins").json();
  },

  getKlines(
    symbol: string,
    interval: string,
    limit: number = 200,
  ): Promise<KlineData[]> {
    return apiClient
      .get(`api/coins/${symbol}/klines`, {
        searchParams: { interval, limit },
      })
      .json();
  },
};
