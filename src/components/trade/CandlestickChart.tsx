"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, type IChartApi } from "lightweight-charts";

const INTERVALS = [
  { label: "1분", value: "1m" },
  { label: "5분", value: "5m" },
  { label: "1시간", value: "1h" },
  { label: "1일", value: "1d" },
];

interface CandlestickChartProps {
  symbol: string;
}

export default function CandlestickChart({ symbol }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const [interval, setInterval] = useState("1h");
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    fetch(`/api/coins/${symbol}/klines?interval=${interval}&limit=200`)
      .then((res) => res.json())
      .then((data) => {
        if (seriesRef.current && Array.isArray(data)) {
          seriesRef.current.setData(data);
          chartRef.current?.timeScale().fitContent();
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol, interval]);

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
        {loading && (
          <span className="ml-auto text-xs text-muted">로딩 중...</span>
        )}
      </div>
      <div ref={containerRef} />
    </div>
  );
}
