import Link from "next/link";
import { formatUSD, formatPercent } from "@/shared/lib/format";
import { SYMBOL_NAMES } from "../model/types";

interface Props {
  symbol: string;
  currentPrice: number;
  changePercent: number;
}

export function CoinCard({ symbol, currentPrice, changePercent }: Props) {
  const isPositive = changePercent >= 0;

  return (
    <Link
      href={`/trade/${symbol}`}
      className="rounded-xl border border-border bg-card p-4 hover:bg-card-hover transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{symbol.replace("USDT", "")}</p>
          <p className="text-xs text-muted">
            {SYMBOL_NAMES[symbol] || symbol}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono font-semibold">{formatUSD(currentPrice)}</p>
          <p
            className={`text-sm font-mono ${
              isPositive ? "text-success" : "text-danger"
            }`}
          >
            {formatPercent(changePercent)}
          </p>
        </div>
      </div>
    </Link>
  );
}
