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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-muted hover:text-foreground transition-colors"
        >
          &larr;
        </Link>
        <div>
          <h1 className="text-2xl font-bold">
            {upperSymbol.replace("USDT", "")}/USDT
          </h1>
          <p className="text-sm text-muted">
            {SYMBOL_NAMES[upperSymbol] || upperSymbol}
          </p>
        </div>
        {currentPrice > 0 && (
          <div className="ml-auto text-right">
            <p className="text-xl font-mono font-bold">
              {formatUSD(currentPrice)}
            </p>
            <p
              className={`text-sm font-mono ${
                changePercent >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {formatPercent(changePercent)}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <CandlestickChart symbol={upperSymbol} />
        </div>
        <div>
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
