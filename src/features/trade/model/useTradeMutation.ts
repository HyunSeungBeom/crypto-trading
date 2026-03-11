import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import { executeTrade } from "../api/tradeActions";

interface TradeParams {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
}

export function useTradeExecute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: TradeParams) => {
      const result = await executeTrade(params);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
