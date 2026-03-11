import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import { tradeApi } from "../api/tradeApi";

interface TradeParams {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
}

export function useTradeExecute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: TradeParams) => tradeApi.execute(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio.all });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
