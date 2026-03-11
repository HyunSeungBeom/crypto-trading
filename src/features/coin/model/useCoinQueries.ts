import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import { coinApi } from "../api/coinApi";

export function useCoins() {
  return useQuery({
    queryKey: queryKeys.coins.all,
    queryFn: () => coinApi.getTickers(),
    staleTime: 10 * 1000,
  });
}

export function useKlines(symbol: string, interval: string, limit: number = 500) {
  return useQuery({
    queryKey: queryKeys.coins.klines(symbol, interval),
    queryFn: () => coinApi.getKlines(symbol, interval, limit),
    enabled: !!symbol,
  });
}

export function useOrderBook(symbol: string) {
  return useQuery({
    queryKey: queryKeys.coins.orderbook(symbol),
    queryFn: () => coinApi.getOrderBook(symbol),
    enabled: !!symbol,
    refetchInterval: 3000,
  });
}
