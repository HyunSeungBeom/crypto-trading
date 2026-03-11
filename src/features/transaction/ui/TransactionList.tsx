"use client";

import { useState } from "react";
import { TransactionRow } from "@/entities/transaction";
import type { TransactionsResponse } from "@/entities/transaction";
import { useTransactions } from "../model/useTransactionQueries";

interface TransactionListProps {
  initialData?: TransactionsResponse;
}

export function TransactionList({ initialData }: TransactionListProps) {
  const [page, setPage] = useState(1);
  const [filterSide, setFilterSide] = useState<string>("");

  const { data, isLoading } = useTransactions(
    page,
    filterSide || undefined,
    page === 1 && !filterSide ? { initialData } : undefined,
  );
  const transactions = data?.transactions ?? [];
  const pagination = data?.pagination ?? null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">거래 내역</h1>
        <div className="flex gap-2">
          {["", "BUY", "SELL"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setFilterSide(s);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                filterSide === s
                  ? "bg-primary text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {s === "" ? "전체" : s === "BUY" ? "매수" : "매도"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-muted">
            불러오는 중...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-muted">
            거래 내역이 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 text-left font-medium">일시</th>
                  <th className="px-4 py-3 text-left font-medium">코인</th>
                  <th className="px-4 py-3 text-center font-medium">구분</th>
                  <th className="px-4 py-3 text-right font-medium">수량</th>
                  <th className="px-4 py-3 text-right font-medium">단가</th>
                  <th className="px-4 py-3 text-right font-medium">금액</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <TransactionRow key={tx.id} {...tx} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4">
            <span className="text-sm text-muted">
              전체 {pagination.total}건
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md px-3 py-1.5 text-sm border border-border disabled:opacity-30 hover:bg-card-hover transition-colors"
              >
                이전
              </button>
              <span className="flex items-center px-3 text-sm text-muted">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages}
                className="rounded-md px-3 py-1.5 text-sm border border-border disabled:opacity-30 hover:bg-card-hover transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
