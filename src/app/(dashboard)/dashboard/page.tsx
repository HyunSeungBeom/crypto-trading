"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePrices } from "@/components/PriceProvider";
import { SYMBOL_NAMES, type TickerData } from "@/lib/binance";
import { formatUSD, formatPercent } from "@/lib/format";

export default function DashboardPage() {
  const [tickers, setTickers] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const prices = usePrices();

  useEffect(() => {
    fetch("/api/coins")
      .then((res) => res.json())
      .then((data) => {
        setTickers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        시세를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">시세 현황</h1>
        <p className="mt-1 text-sm text-muted">
          실시간 암호화폐 시세 (USDT 기준)
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tickers.map((ticker) => {
          const live = prices[ticker.symbol];
          const currentPrice = live
            ? parseFloat(live.price)
            : parseFloat(ticker.price);
          const changePercent = live
            ? parseFloat(live.priceChangePercent)
            : parseFloat(ticker.priceChangePercent);
          const isPositive = changePercent >= 0;

          return (
            <Link
              key={ticker.symbol}
              href={`/trade/${ticker.symbol}`}
              className="rounded-xl border border-border bg-card p-4 hover:bg-card-hover transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    {ticker.symbol.replace("USDT", "")}
                  </p>
                  <p className="text-xs text-muted">
                    {SYMBOL_NAMES[ticker.symbol] || ticker.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold">
                    {formatUSD(currentPrice)}
                  </p>
                  <p
                    className={`text-sm font-mono ${
                      isPositive ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatPercent(changePercent)}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
