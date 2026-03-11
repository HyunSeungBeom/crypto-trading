import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/shared/api";
import type { TransactionsResponse } from "@/entities/transaction";
import { fetchTransactions } from "../api/transactionActions";

export function useTransactions(
  page: number,
  side?: string,
  options?: { initialData?: TransactionsResponse },
) {
  return useQuery({
    queryKey: queryKeys.transactions.list({ page, side }),
    queryFn: () => fetchTransactions({ page, side }),
    placeholderData: keepPreviousData,
    initialData: options?.initialData,
  });
}
