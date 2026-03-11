"use client";

import { useBinanceWebSocket } from "../hooks/useBinanceWebSocket";

export function PriceProvider({ children }: { children: React.ReactNode }) {
  useBinanceWebSocket();
  return <>{children}</>;
}
