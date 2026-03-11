import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import type { PortfolioData } from "@/entities/holding";
import { fetchPortfolio } from "../api/portfolioActions";

export function usePortfolio(options?: { initialData?: PortfolioData }) {
  return useQuery({
    queryKey: queryKeys.portfolio.all,
    queryFn: () => fetchPortfolio(),
    initialData: options?.initialData ?? undefined,
    staleTime: 30_000,
  });
}
