"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { SUPPORTED_SYMBOLS } from "@/lib/binance";

interface TickerUpdate {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

export function useBinanceWebSocket() {
  const [prices, setPrices] = useState<Record<string, TickerUpdate>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const streams = SUPPORTED_SYMBOLS.map(
      (s) => `${s.toLowerCase()}@miniTicker`
    ).join("/");

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${streams}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s) {
        setPrices((prev) => ({
          ...prev,
          [data.s]: {
            symbol: data.s,
            price: data.c,
            priceChangePercent: (
              ((parseFloat(data.c) - parseFloat(data.o)) /
                parseFloat(data.o)) *
              100
            ).toFixed(2),
          },
        }));
      }
    };

    ws.onclose = () => {
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return prices;
}
