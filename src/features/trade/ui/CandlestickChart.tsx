"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
} from "lightweight-charts";
import { useKlines } from "@/features/coin";

const INTERVALS = [
  { label: "1분", value: "1m" },
  { label: "5분", value: "5m" },
  { label: "1시간", value: "1h" },
  { label: "1일", value: "1d" },
];

interface Props {
  symbol: string;
}

export function CandlestickChart({ symbol }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const [interval, setInterval] = useState("1h");

  const { data: klineData, isLoading } = useKlines(symbol, interval);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: "#141414" },
        textColor: "#737373",
      },
      grid: {
        vertLines: { color: "#1a1a1a" },
        horzLines: { color: "#1a1a1a" },
      },
      width: containerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: "#262626",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#262626",
      },
      crosshair: {
        mode: 0,
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderDownColor: "#ef4444",
      borderUpColor: "#22c55e",
      wickDownColor: "#ef4444",
      wickUpColor: "#22c55e",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current && Array.isArray(klineData)) {
      seriesRef.current.setData(klineData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [klineData]);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-3">
        {INTERVALS.map((int) => (
          <button
            key={int.value}
            onClick={() => setInterval(int.value)}
            className={`rounded-md px-3 py-1 text-sm transition-colors ${
              interval === int.value
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {int.label}
          </button>
        ))}
        {isLoading && (
          <span className="ml-auto text-xs text-muted">로딩 중...</span>
        )}
      </div>
      <div ref={containerRef} />
    </div>
  );
}
