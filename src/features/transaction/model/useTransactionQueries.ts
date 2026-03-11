import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import { transactionApi } from "../api/transactionApi";

export function useTransactions(page: number, side?: string) {
  return useQuery({
    queryKey: queryKeys.transactions.list({ page, side }),
    queryFn: () => transactionApi.list({ page, side }),
    placeholderData: keepPreviousData,
  });
}
