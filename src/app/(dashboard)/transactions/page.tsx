"use client";

import { useEffect, useState } from "react";
import { SYMBOL_NAMES } from "@/lib/binance";
import { formatUSD, formatNumber, formatDate } from "@/lib/format";
import api from "@/lib/api";

interface Transaction {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterSide, setFilterSide] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "20",
    });
    if (filterSide) params.set("side", filterSide);

    api
      .get(`/api/transactions?${params}`)
      .then((data: unknown) => {
        const d = data as { transactions: Transaction[]; pagination: Pagination };
        setTransactions(d.transactions);
        setPagination(d.pagination);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, filterSide]);

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
        {loading ? (
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
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0 hover:bg-card-hover"
                  >
                    <td className="px-4 py-3 text-muted">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">
                        {tx.symbol.replace("USDT", "")}
                      </span>
                      <span className="ml-1 text-xs text-muted">
                        {SYMBOL_NAMES[tx.symbol]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                          tx.side === "BUY"
                            ? "bg-success/10 text-success"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {tx.side === "BUY" ? "매수" : "매도"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatNumber(tx.quantity, 6)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatUSD(tx.price)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {formatUSD(tx.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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
