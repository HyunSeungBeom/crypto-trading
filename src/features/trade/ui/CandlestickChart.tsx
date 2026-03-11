"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  CandlestickSeries,
  type IChartApi,
  type LogicalRange,
} from "lightweight-charts";
import { useKlines, coinApi } from "@/features/coin";
import type { KlineData } from "@/entities/coin";

const INTERVALS = [
  { label: "1분", value: "1m" },
  { label: "5분", value: "5m" },
  { label: "15분", value: "15m" },
  { label: "30분", value: "30m" },
  { label: "1시간", value: "1h" },
  { label: "4시간", value: "4h" },
  { label: "1일", value: "1d" },
  { label: "1주", value: "1w" },
];

const INITIAL_LIMIT = 200;
const FETCH_BATCH = 200;

interface Props {
  symbol: string;
  height?: number;
}

export function CandlestickChart({ symbol, height = 500 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);
  const [interval, setInterval] = useState("1h");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const allDataRef = useRef<KlineData[]>([]);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const { data: klineData, isLoading } = useKlines(symbol, interval, INITIAL_LIMIT);

  // Reset accumulated data when symbol or interval changes
  useEffect(() => {
    allDataRef.current = [];
    hasMoreRef.current = true;
  }, [symbol, interval]);

  const loadMoreHistory = useCallback(async () => {
    if (isFetchingRef.current || !hasMoreRef.current || allDataRef.current.length === 0) return;
    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      const oldest = allDataRef.current[0];
      // endTime = oldest candle's open time (in ms) - 1ms to avoid duplicate
      const endTime = (oldest.time as number) * 1000 - 1;

      const olderData = await coinApi.getKlines(symbol, interval, FETCH_BATCH, endTime);

      if (olderData.length === 0) {
        hasMoreRef.current = false;
        return;
      }

      // Prepend older data, deduplicate by time
      const existingTimes = new Set(allDataRef.current.map((d) => d.time));
      const newData = olderData.filter((d) => !existingTimes.has(d.time));

      if (newData.length === 0) {
        hasMoreRef.current = false;
        return;
      }

      allDataRef.current = [...newData, ...allDataRef.current];

      if (seriesRef.current) {
        seriesRef.current.setData(allDataRef.current);
      }

      if (olderData.length < FETCH_BATCH) {
        hasMoreRef.current = false;
      }
    } catch {
      // silently fail, user can scroll again
    } finally {
      isFetchingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [symbol, interval]);

  // Create chart once
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
      height,
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
  }, [height]);

  // Set initial data from react-query
  useEffect(() => {
    if (seriesRef.current && Array.isArray(klineData) && klineData.length > 0) {
      allDataRef.current = klineData;
      hasMoreRef.current = true;
      seriesRef.current.setData(klineData);
      chartRef.current?.timeScale().fitContent();
    }
  }, [klineData]);

  // Subscribe to visible range changes for infinite scroll
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const handleVisibleRangeChange = (logicalRange: LogicalRange | null) => {
      if (!logicalRange) return;
      // When the left edge of the visible area is near the beginning of data
      if (logicalRange.from <= 10) {
        loadMoreHistory();
      }
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);
    };
  }, [loadMoreHistory]);

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
        {(isLoading || isLoadingMore) && (
          <span className="ml-auto text-xs text-muted">로딩 중...</span>
        )}
      </div>
      <div ref={containerRef} />
    </div>
  );
}
