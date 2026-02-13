"use client";

import { useState } from "react";
import { toast } from "sonner";
import { usePrices } from "@/components/PriceProvider";
import { formatUSD, formatKRW } from "@/lib/format";

interface TradeFormProps {
  symbol: string;
  balance: number;
  holdingQuantity: number;
  onTradeComplete: () => void;
}

export default function TradeForm({
  symbol,
  balance,
  holdingQuantity,
  onTradeComplete,
}: TradeFormProps) {
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const prices = usePrices();

  const currentPrice = prices[symbol]
    ? parseFloat(prices[symbol].price)
    : 0;
  const total = parseFloat(quantity || "0") * currentPrice;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPrice) {
      toast.error("시세를 불러오는 중입니다");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          side,
          quantity: parseFloat(quantity),
          price: currentPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
      } else {
        toast.success(
          `${side === "BUY" ? "매수" : "매도"} 완료: ${quantity} ${symbol.replace("USDT", "")}`
        );
        setQuantity("");
        onTradeComplete();
      }
    } catch {
      toast.error("거래 처리 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0.00"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 font-mono text-sm outline-none focus:border-primary"
          />
        </div>

        {total > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted">총 금액</span>
            <span className="font-mono">{formatUSD(total)}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !currentPrice || !quantity}
          className={`w-full rounded-lg py-2.5 font-medium text-white disabled:opacity-50 transition-colors ${
            side === "BUY"
              ? "bg-success hover:bg-success/90"
              : "bg-danger hover:bg-danger/90"
          }`}
        >
          {loading
            ? "처리 중..."
            : `${side === "BUY" ? "매수" : "매도"} ${symbol.replace("USDT", "")}`}
        </button>
      </form>
    </div>
  );
}
