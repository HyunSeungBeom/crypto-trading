"use client";

import { useState } from "react";
import { usePriceStore } from "@/shared/model/priceStore";
import { SYMBOL_NAMES, SUPPORTED_SYMBOLS } from "@/entities/coin";
import { formatUSD, formatPercent } from "@/shared/lib/format";
import { usePortfolio } from "@/features/portfolio";
import { CoinSelector } from "@/features/coin";
import { TradeForm, CandlestickChart, OrderBook } from "@/features/trade";

export default function DashboardPage() {
  const [selected, setSelected] = useState<string>("BTCUSDT");
  const prices = usePriceStore((s) => s.prices);
  const { data: portfolio } = usePortfolio();

  const live = prices[selected];
  const currentPrice = live ? parseFloat(live.price) : 0;
  const changePercent = live ? parseFloat(live.priceChangePercent) : 0;
  const holding = portfolio?.holdings.find((h) => h.symbol === selected);

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-80px)]">
      {/* 좌측 메인 영역 */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        {/* 모바일 코인 드롭다운 */}
        <div className="lg:hidden">
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm font-medium outline-none focus:border-primary"
          >
            {SUPPORTED_SYMBOLS.map((sym) => (
              <option key={sym} value={sym}>
                {sym.replace("USDT", "")}/USDT — {SYMBOL_NAMES[sym]}
              </option>
            ))}
          </select>
        </div>

        {/* 심볼 헤더 바 */}
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
          <h1 className="text-lg font-bold">
            {selected.replace("USDT", "")}/USDT
          </h1>
          <span className="text-sm text-muted">
            {SYMBOL_NAMES[selected] || selected}
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

        {/* 차트 */}
        <CandlestickChart symbol={selected} height={400} />

        {/* 하단: 호가창 + 매수매도 */}
        <div className="flex flex-col lg:flex-row gap-4 pb-4">
          <div className="flex-1">
            <OrderBook symbol={selected} />
          </div>
          <div className="w-full lg:w-80 shrink-0">
            <TradeForm
              symbol={selected}
              balance={portfolio?.balance ?? 0}
              holdingQuantity={holding?.quantity ?? 0}
            />
          </div>
        </div>
      </div>

      {/* 우측 사이드바 (데스크톱) */}
      <div className="hidden lg:block w-72 shrink-0">
        <CoinSelector selectedSymbol={selected} onSelect={setSelected} />
      </div>
    </div>
  );
}
