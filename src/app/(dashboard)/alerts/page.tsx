"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { usePrices } from "@/components/PriceProvider";
import { SUPPORTED_SYMBOLS, SYMBOL_NAMES } from "@/lib/binance";
import { formatUSD } from "@/lib/format";

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "ABOVE" | "BELOW";
  triggered: boolean;
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState<string>(SUPPORTED_SYMBOLS[0]);
  const [targetPrice, setTargetPrice] = useState("");
  const [condition, setCondition] = useState<"ABOVE" | "BELOW">("ABOVE");
  const prices = usePrices();
  const triggeredRef = useRef<Set<string>>(new Set());

  function fetchAlerts() {
    fetch("/api/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  // 실시간 가격 비교 → 알림
  useEffect(() => {
    alerts.forEach((alert) => {
      if (alert.triggered || triggeredRef.current.has(alert.id)) return;
      const live = prices[alert.symbol];
      if (!live) return;

      const currentPrice = parseFloat(live.price);
      const shouldTrigger =
        (alert.condition === "ABOVE" && currentPrice >= alert.targetPrice) ||
        (alert.condition === "BELOW" && currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        triggeredRef.current.add(alert.id);
        toast.info(
          `${alert.symbol.replace("USDT", "")} 가격이 ${formatUSD(alert.targetPrice)} ${
            alert.condition === "ABOVE" ? "이상" : "이하"
          }입니다! (현재: ${formatUSD(currentPrice)})`,
          { duration: 10000 }
        );
      }
    });
  }, [prices, alerts]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          targetPrice: parseFloat(targetPrice),
          condition,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      toast.success("알림이 설정되었습니다");
      setTargetPrice("");
      fetchAlerts();
    } catch {
      toast.error("알림 생성에 실패했습니다");
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success("알림이 삭제되었습니다");
    } catch {
      toast.error("삭제에 실패했습니다");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">가격 알림</h1>

      {/* 알림 생성 폼 */}
      <form
        onSubmit={handleCreate}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div>
          <label className="mb-1 block text-sm text-muted">코인</label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
          >
            {SUPPORTED_SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s.replace("USDT", "")} - {SYMBOL_NAMES[s]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">조건</label>
          <select
            value={condition}
            onChange={(e) =>
              setCondition(e.target.value as "ABOVE" | "BELOW")
            }
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
          >
            <option value="ABOVE">이상</option>
            <option value="BELOW">이하</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">목표가 (USD)</label>
          <input
            type="number"
            step="any"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            placeholder="0.00"
            required
            className="w-40 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
        >
          알림 추가
        </button>
      </form>

      {/* 알림 목록 */}
      <div className="rounded-xl border border-border bg-card">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-muted">
            불러오는 중...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-muted">
            설정된 알림이 없습니다
          </div>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map((alert) => {
              const live = prices[alert.symbol];
              const currentPrice = live ? parseFloat(live.price) : null;

              return (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="font-medium">
                        {alert.symbol.replace("USDT", "")}
                      </span>
                      <span className="ml-2 text-sm text-muted">
                        {alert.condition === "ABOVE" ? "이상" : "이하"}{" "}
                        {formatUSD(alert.targetPrice)}
                      </span>
                    </div>
                    {currentPrice && (
                      <span className="text-sm text-muted">
                        현재: {formatUSD(currentPrice)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="text-sm text-muted hover:text-danger transition-colors"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
