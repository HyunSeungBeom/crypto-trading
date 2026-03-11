import { apiClient } from "@/shared/api";

interface TradeParams {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
}

export const tradeApi = {
  execute(params: TradeParams) {
    return apiClient.post("api/trade", { json: params }).json();
  },
};
