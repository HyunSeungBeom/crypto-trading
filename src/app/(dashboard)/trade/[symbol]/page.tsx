"use client";

import { use } from "react";
import Link from "next/link";
import { usePriceStore } from "@/shared/model/priceStore";
import { SYMBOL_NAMES } from "@/entities/coin";
import { formatUSD, formatPercent } from "@/shared/lib/format";
import { usePortfolio } from "@/features/portfolio";
import { TradeForm, CandlestickChart } from "@/features/trade";

export default function TradePage({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = use(params);
  const upperSymbol = symbol.toUpperCase();
  const prices = usePriceStore((s) => s.prices);
  const { data: portfolio } = usePortfolio();

  const live = prices[upperSymbol];
  const currentPrice = live ? parseFloat(live.price) : 0;
  const changePercent = live ? parseFloat(live.priceChangePercent) : 0;
  const holding = portfolio?.holdings.find((h) => h.symbol === upperSymbol);

  return (
    <div className="space-y-4">
      {/* 상단 헤더 바 */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
        <Link
          href="/dashboard"
          className="text-muted hover:text-foreground transition-colors"
        >
          &larr;
        </Link>
        <h1 className="text-lg font-bold">
          {upperSymbol.replace("USDT", "")}/USDT
        </h1>
        <span className="text-sm text-muted">
          {SYMBOL_NAMES[upperSymbol] || upperSymbol}
        </span>
        {currentPrice > 0 && (
          <div className="ml-auto flex items-center gap-4">
            <span className="text-xl font-mono font-bold">
              {formatUSD(currentPrice)}
            </span>
            <span
              className={`text-sm font-mono ${
                changePercent >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {formatPercent(changePercent)}
            </span>
          </div>
        )}
      </div>

      {/* 본문: 차트 + 매수/매도 패널 */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <CandlestickChart symbol={upperSymbol} height={560} />
        </div>
        <div className="w-full lg:w-80 shrink-0">
          <TradeForm
            symbol={upperSymbol}
            balance={portfolio?.balance ?? 0}
            holdingQuantity={holding?.quantity ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
