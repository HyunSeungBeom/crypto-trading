"use client";

import { useMemo } from "react";
import { useOrderBook } from "@/features/coin";
import { usePriceStore } from "@/shared/model/priceStore";
import { formatUSD } from "@/shared/lib/format";

interface Props {
  symbol: string;
}

export function OrderBook({ symbol }: Props) {
  const { data, isLoading, isError, error } = useOrderBook(symbol);
  const prices = usePriceStore((s) => s.prices);
  const currentPrice = prices[symbol] ? parseFloat(prices[symbol].price) : 0;

  const { asks, bids, maxTotal } = useMemo(() => {
    if (!data) return { asks: [], bids: [], maxTotal: 0 };

    const asksWithTotal = data.asks
      .slice(0, 15)
      .map((entry) => {
        const qty = parseFloat(entry.quantity);
        return { price: parseFloat(entry.price), quantity: qty, total: 0 };
      })
      .sort((a, b) => a.price - b.price);

    // Cumulative total for asks (from bottom to top)
    for (let i = asksWithTotal.length - 1; i >= 0; i--) {
      asksWithTotal[i].total =
        asksWithTotal[i].quantity +
        (i < asksWithTotal.length - 1 ? asksWithTotal[i + 1].total : 0);
    }

    const bidsWithTotal = data.bids.slice(0, 15).map((entry) => {
      const qty = parseFloat(entry.quantity);
      return { price: parseFloat(entry.price), quantity: qty, total: 0 };
    });

    // Cumulative total for bids (from top to bottom)
    for (let i = 0; i < bidsWithTotal.length; i++) {
      bidsWithTotal[i].total =
        bidsWithTotal[i].quantity +
        (i > 0 ? bidsWithTotal[i - 1].total : 0);
    }

    const max = Math.max(
      asksWithTotal[0]?.total ?? 0,
      bidsWithTotal[bidsWithTotal.length - 1]?.total ?? 0,
    );

    return { asks: asksWithTotal, bids: bidsWithTotal, maxTotal: max };
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center h-[350px]">
        <span className="text-sm text-muted">호가 로딩 중...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-center h-[350px]">
        <span className="text-sm text-danger">호가 로딩 실패: {error?.message || "알 수 없는 오류"}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card flex flex-col">
      <div className="border-b border-border px-4 py-2">
        <h3 className="text-sm font-medium">호가창</h3>
      </div>

      <div className="max-h-[350px] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 grid grid-cols-3 gap-2 bg-card px-4 py-1.5 text-xs text-muted border-b border-border">
          <span>가격(USDT)</span>
          <span className="text-right">수량</span>
          <span className="text-right">누적</span>
        </div>

        {/* Asks (sell orders) - lowest price at bottom */}
        <div className="flex flex-col">
          {asks.map((row) => (
            <div
              key={`ask-${row.price}`}
              className="relative grid grid-cols-3 gap-2 px-4 py-0.5 text-xs"
            >
              <div
                className="absolute inset-y-0 right-0 bg-danger/10"
                style={{ width: `${(row.total / maxTotal) * 100}%` }}
              />
              <span className="relative font-mono text-danger">
                {formatUSD(row.price)}
              </span>
              <span className="relative text-right font-mono">
                {row.quantity.toFixed(4)}
              </span>
              <span className="relative text-right font-mono text-muted">
                {row.total.toFixed(4)}
              </span>
            </div>
          ))}
        </div>

        {/* Current price */}
        <div className="border-y border-border px-4 py-2 text-center">
          <span className="font-mono text-sm font-bold">
            {currentPrice > 0 ? formatUSD(currentPrice) : "---"}
          </span>
        </div>

        {/* Bids (buy orders) - highest price at top */}
        <div className="flex flex-col">
          {bids.map((row) => (
            <div
              key={`bid-${row.price}`}
              className="relative grid grid-cols-3 gap-2 px-4 py-0.5 text-xs"
            >
              <div
                className="absolute inset-y-0 right-0 bg-success/10"
                style={{ width: `${(row.total / maxTotal) * 100}%` }}
              />
              <span className="relative font-mono text-success">
                {formatUSD(row.price)}
              </span>
              <span className="relative text-right font-mono">
                {row.quantity.toFixed(4)}
              </span>
              <span className="relative text-right font-mono text-muted">
                {row.total.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
