import Link from "next/link";
import { SYMBOL_NAMES } from "@/entities/coin";
import { formatUSD, formatNumber, formatPercent } from "@/shared/lib/format";

interface Props {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
}

export function HoldingRow({
  symbol,
  quantity,
  avgPrice,
  currentPrice,
  currentValue,
  pnl,
  pnlPercent,
}: Props) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-card-hover">
      <td className="px-4 py-3">
        <Link href={`/trade/${symbol}`} className="hover:text-primary">
          <span className="font-medium">{symbol.replace("USDT", "")}</span>
          <span className="ml-2 text-xs text-muted">
            {SYMBOL_NAMES[symbol]}
          </span>
        </Link>
      </td>
      <td className="px-4 py-3 text-right font-mono">
        {formatNumber(quantity, 6)}
      </td>
      <td className="px-4 py-3 text-right font-mono">
        {formatUSD(avgPrice)}
      </td>
      <td className="px-4 py-3 text-right font-mono">
        {formatUSD(currentPrice)}
      </td>
      <td className="px-4 py-3 text-right font-mono">
        {formatUSD(currentValue)}
      </td>
      <td
        className={`px-4 py-3 text-right font-mono ${
          pnl >= 0 ? "text-success" : "text-danger"
        }`}
      >
        <div>{formatUSD(pnl)}</div>
        <div className="text-xs">{formatPercent(pnlPercent)}</div>
      </td>
    </tr>
  );
}
