"use client";

import { useEffect, useRef, useCallback } from "react";
import { SUPPORTED_SYMBOLS } from "@/entities/coin";
import { usePriceStore } from "@/shared/model/priceStore";

export function useBinanceWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const updatePrice = usePriceStore((s) => s.updatePrice);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const streams = SUPPORTED_SYMBOLS.map(
      (s) => `${s.toLowerCase()}@miniTicker`,
    ).join("/");

    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${streams}`,
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.s) {
        updatePrice(data.s, {
          symbol: data.s,
          price: data.c,
          priceChangePercent: (
            ((parseFloat(data.c) - parseFloat(data.o)) /
              parseFloat(data.o)) *
            100
          ).toFixed(2),
        });
      }
    };

    ws.onclose = () => {
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [updatePrice]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);
}
