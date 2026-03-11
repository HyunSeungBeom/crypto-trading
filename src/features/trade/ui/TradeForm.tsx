"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { usePriceStore } from "@/shared/model/priceStore";
import { formatUSD, formatKRW } from "@/shared/lib/format";
import { tradeSchema, type TradeFormValues } from "../model/tradeSchema";
import { useTradeExecute } from "../model/useTradeMutation";

interface Props {
  symbol: string;
  balance: number;
  holdingQuantity: number;
}

export function TradeForm({ symbol, balance, holdingQuantity }: Props) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const prices = usePriceStore((s) => s.prices);
  const tradeMutation = useTradeExecute();

  const currentPrice = prices[symbol] ? parseFloat(prices[symbol].price) : 0;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeSchema),
  });

  const USDT_TO_KRW = 1350;
  const quantity = watch("quantity");
  const totalUSDT = (quantity || 0) * currentPrice;
  const totalKRW = totalUSDT * USDT_TO_KRW;

  function onSubmit(values: TradeFormValues) {
    if (!currentPrice) {
      toast.error("시세를 불러오는 중입니다");
      return;
    }

    tradeMutation.mutate(
      {
        symbol,
        side,
        quantity: values.quantity,
        price: currentPrice,
      },
      {
        onSuccess: () => {
          toast.success(
            `${side === "BUY" ? "매수" : "매도"} 완료: ${values.quantity} ${symbol.replace("USDT", "")}`,
          );
          reset();
        },
        onError: (error) => {
          toast.error(error.message || "거래에 실패했습니다");
        },
      },
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex rounded-lg bg-background p-1">
        <button
          type="button"
          onClick={() => setSide("BUY")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            side === "BUY"
              ? "bg-success text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          매수
        </button>
        <button
          type="button"
          onClick={() => setSide("SELL")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            side === "SELL"
              ? "bg-danger text-white"
              : "text-muted hover:text-foreground"
          }`}
        >
          매도
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted">현재가</span>
            <span className="font-mono">
              {currentPrice ? formatUSD(currentPrice) : "---"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted">
              {side === "BUY" ? "보유 잔고" : "보유 수량"}
            </span>
            <span className="font-mono">
              {side === "BUY"
                ? formatKRW(balance)
                : `${holdingQuantity} ${symbol.replace("USDT", "")}`}
            </span>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-muted">수량</label>
          <input
            type="number"
            step="any"
            min="0"
            {...register("quantity", { valueAsNumber: true })}
            placeholder="0.00"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary"
          />
          {errors.quantity && (
            <p className="mt-1 text-xs text-danger">
              {errors.quantity.message}
            </p>
          )}
        </div>

        {totalUSDT > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted">총 금액</span>
              <span className="font-mono">{formatUSD(totalUSDT)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <span />
              <span className="font-mono">≈ {formatKRW(totalKRW)}</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={tradeMutation.isPending || !currentPrice}
          className={`w-full rounded-lg py-2.5 font-medium text-white disabled:opacity-50 transition-colors ${
            side === "BUY"
              ? "bg-success hover:bg-success/90"
              : "bg-danger hover:bg-danger/90"
          }`}
        >
          {tradeMutation.isPending
            ? "처리 중..."
            : `${side === "BUY" ? "매수" : "매도"} ${symbol.replace("USDT", "")}`}
        </button>
      </form>
    </div>
  );
}
