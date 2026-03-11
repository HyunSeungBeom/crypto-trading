import { apiClient } from "@/shared/api";
import type { PriceAlert } from "@/entities/alert";

export const alertApi = {
  list(): Promise<PriceAlert[]> {
    return apiClient.get("api/alerts").json();
  },

  create(params: {
    symbol: string;
    targetPrice: number;
    condition: "ABOVE" | "BELOW";
  }): Promise<PriceAlert> {
    return apiClient.post("api/alerts", { json: params }).json();
  },

  delete(id: string): Promise<void> {
    return apiClient.delete("api/alerts", { searchParams: { id } }).json();
  },
};
