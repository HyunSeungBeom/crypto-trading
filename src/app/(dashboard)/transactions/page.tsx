import { fetchTransactions } from "@/features/transaction/api/transactionActions";
import { TransactionList } from "@/features/transaction";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
  const data = await fetchTransactions({ page: 1 });

  return <TransactionList initialData={data} />;
}
