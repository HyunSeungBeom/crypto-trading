"use client";

import { createContext, useContext } from "react";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";

interface TickerUpdate {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

const PriceContext = createContext<Record<string, TickerUpdate>>({});

export function PriceProvider({ children }: { children: React.ReactNode }) {
  const prices = useBinanceWebSocket();
  return (
    <PriceContext.Provider value={prices}>{children}</PriceContext.Provider>
  );
}

export function usePrices() {
  return useContext(PriceContext);
}
