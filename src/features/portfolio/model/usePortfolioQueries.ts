import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import { portfolioApi } from "../api/portfolioApi";

export function usePortfolio() {
  return useQuery({
    queryKey: queryKeys.portfolio.all,
    queryFn: () => portfolioApi.get(),
    staleTime: 30 * 1000,
  });
}
