import Link from "next/link";
import { SYMBOL_NAMES } from "@/entities/coin";
import { formatKRW, formatNumber, formatPercent } from "@/shared/lib/format";

const USDT_TO_KRW = 1350;

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
        <div>{formatKRW(avgPrice * USDT_TO_KRW)}</div>
        <div className="text-xs text-muted">{formatNumber(avgPrice, 2)} USDT</div>
      </td>
      <td className="px-4 py-3 text-right font-mono">
        <div>{formatKRW(currentPrice * USDT_TO_KRW)}</div>
        <div className="text-xs text-muted">{formatNumber(currentPrice, 2)} USDT</div>
      </td>
      <td className="px-4 py-3 text-right font-mono">
        {formatKRW(currentValue * USDT_TO_KRW)}
      </td>
      <td
        className={`px-4 py-3 text-right font-mono ${
          pnl >= 0 ? "text-success" : "text-danger"
        }`}
      >
        <div>{formatKRW(pnl * USDT_TO_KRW)}</div>
        <div className="text-xs">{formatPercent(pnlPercent)}</div>
      </td>
    </tr>
  );
}
