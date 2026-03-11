import { fetchTransactions } from "@/features/transaction/api/transactionActions";
import { TransactionList } from "@/features/transaction";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  let data = null;
  try {
    data = await fetchTransactions({ page: 1 });
  } catch {
    // DB 연결 실패 등 — 클라이언트에서 재시도
  }

  return <TransactionList initialData={data ?? undefined} />;
}
