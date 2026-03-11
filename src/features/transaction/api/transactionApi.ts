import { apiClient } from "@/shared/api";
import type { TransactionsResponse } from "@/entities/transaction";

export const transactionApi = {
  list(params: {
    page: number;
    limit?: number;
    side?: string;
  }): Promise<TransactionsResponse> {
    const searchParams: Record<string, string> = {
      page: params.page.toString(),
      limit: (params.limit ?? 20).toString(),
    };
    if (params.side) searchParams.side = params.side;

    return apiClient.get("api/transactions", { searchParams }).json();
  },
};
