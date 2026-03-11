import { SYMBOL_NAMES } from "@/entities/coin";
import { formatUSD, formatNumber, formatDate } from "@/shared/lib/format";

interface Props {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
}

export function TransactionRow({
  symbol,
  side,
  quantity,
  price,
  total,
  createdAt,
}: Props) {
  return (
    <tr className="border-b border-border last:border-0 hover:bg-card-hover">
      <td className="px-4 py-3 text-muted">{formatDate(createdAt)}</td>
      <td className="px-4 py-3">
        <span className="font-medium">{symbol.replace("USDT", "")}</span>
        <span className="ml-1 text-xs text-muted">{SYMBOL_NAMES[symbol]}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
            side === "BUY"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {side === "BUY" ? "매수" : "매도"}
        </span>
      </td>
      <td className="px-4 py-3 text-right font-mono">
        {formatNumber(quantity, 6)}
      </td>
      <td className="px-4 py-3 text-right font-mono">{formatUSD(price)}</td>
      <td className="px-4 py-3 text-right font-mono">{formatUSD(total)}</td>
    </tr>
  );
}
