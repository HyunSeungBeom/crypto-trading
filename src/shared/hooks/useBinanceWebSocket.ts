"use client";

import { useEffect, useRef } from "react";
import { SUPPORTED_SYMBOLS } from "@/entities/coin";
import { usePriceStore } from "@/shared/model/priceStore";

export function useBinanceWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const updatePriceRef = useRef(usePriceStore.getState().updatePrice);

  useEffect(() => {
    updatePriceRef.current = usePriceStore.getState().updatePrice;
  });

  useEffect(() => {
    function connect() {
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
          updatePriceRef.current(data.s, {
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
    }

    connect();
    return () => {
      clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, []);
}
