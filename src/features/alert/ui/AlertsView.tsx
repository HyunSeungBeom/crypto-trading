"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePriceStore } from "@/shared/model/priceStore";
import { formatUSD } from "@/shared/lib/format";
import { AlertItem } from "@/entities/alert";
import { useAlerts, useDeleteAlert } from "../model/useAlertQueries";
import { AlertCreateForm } from "./AlertCreateForm";

export function AlertsView() {
  const prices = usePriceStore((s) => s.prices);
  const triggeredRef = useRef<Set<string>>(new Set());

  const { data: alerts = [], isLoading } = useAlerts();
  const deleteAlert = useDeleteAlert();

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
          { duration: 10000 },
        );
      }
    });
  }, [prices, alerts]);

  function handleDelete(id: string) {
    deleteAlert.mutate(id, {
      onSuccess: () => {
        toast.success("알림이 삭제되었습니다");
      },
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">가격 알림</h1>

      <AlertCreateForm />

      <div className="rounded-xl border border-border bg-card">
        {isLoading ? (
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
                <AlertItem
                  key={alert.id}
                  id={alert.id}
                  symbol={alert.symbol}
                  condition={alert.condition}
                  targetPrice={alert.targetPrice}
                  currentPrice={currentPrice}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
