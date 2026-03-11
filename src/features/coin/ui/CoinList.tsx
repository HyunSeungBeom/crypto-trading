"use client";

import { usePriceStore } from "@/shared/model/priceStore";
import { CoinCard } from "@/entities/coin";
import { useCoins } from "../model/useCoinQueries";

export function CoinList() {
  const { data: tickers, isLoading } = useCoins();
  const prices = usePriceStore((s) => s.prices);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        시세를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {tickers?.map((ticker) => {
        const live = prices[ticker.symbol];
        const currentPrice = live
          ? parseFloat(live.price)
          : parseFloat(ticker.price);
        const changePercent = live
          ? parseFloat(live.priceChangePercent)
          : parseFloat(ticker.priceChangePercent);

        return (
          <CoinCard
            key={ticker.symbol}
            symbol={ticker.symbol}
            currentPrice={currentPrice}
            changePercent={changePercent}
          />
        );
      })}
    </div>
  );
}
