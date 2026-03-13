"use client";

import { useState } from "react";
import { usePriceStore } from "@/shared/model/priceStore";
import { SYMBOL_NAMES } from "@/entities/coin";
import { formatUSD, formatPercent } from "@/shared/lib/format";
import { useCoins } from "../model/useCoinQueries";

interface Props {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export function CoinSelector({ selectedSymbol, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const { data: tickers, isError, error } = useCoins();
  const prices = usePriceStore((s) => s.prices);

  const filtered = tickers?.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.symbol.toLowerCase().includes(q) ||
      (SYMBOL_NAMES[t.symbol] || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card">
      <div className="border-b border-border p-3">
        <input
          type="text"
          placeholder="코인 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {isError && (
          <div className="p-3 text-sm text-danger">
            코인 목록 로딩 실패: {error?.message || "알 수 없는 오류"}
          </div>
        )}
        {filtered?.map((ticker) => {
          const live = prices[ticker.symbol];
          const currentPrice = live
            ? parseFloat(live.price)
            : parseFloat(ticker.price);
          const changePercent = live
            ? parseFloat(live.priceChangePercent)
            : parseFloat(ticker.priceChangePercent);
          const isSelected = ticker.symbol === selectedSymbol;

          return (
            <button
              key={ticker.symbol}
              onClick={() => onSelect(ticker.symbol)}
              className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/10 ${
                isSelected
                  ? "bg-primary/10 border-l-2 border-primary"
                  : "border-l-2 border-transparent"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">
                    {ticker.symbol.replace("USDT", "")}
                  </span>
                  <span className="truncate text-xs text-muted">
                    {SYMBOL_NAMES[ticker.symbol]}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs">
                    {formatUSD(currentPrice)}
                  </span>
                  <span
                    className={`text-xs font-mono ${
                      changePercent >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {changePercent >= 0 ? "▲" : "▼"} {formatPercent(changePercent)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
