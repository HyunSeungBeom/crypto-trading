import { formatUSD } from "@/shared/lib/format";

interface Props {
  id: string;
  symbol: string;
  condition: "ABOVE" | "BELOW";
  targetPrice: number;
  currentPrice: number | null;
  onDelete: (id: string) => void;
}

export function AlertItem({
  id,
  symbol,
  condition,
  targetPrice,
  currentPrice,
  onDelete,
}: Props) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-4">
        <div>
          <span className="font-medium">{symbol.replace("USDT", "")}</span>
          <span className="ml-2 text-sm text-muted">
            {condition === "ABOVE" ? "이상" : "이하"} {formatUSD(targetPrice)}
          </span>
        </div>
        {currentPrice && (
          <span className="text-sm text-muted">
            현재: {formatUSD(currentPrice)}
          </span>
        )}
      </div>
      <button
        onClick={() => onDelete(id)}
        className="text-sm text-muted hover:text-danger transition-colors"
      >
        삭제
      </button>
    </div>
  );
}
