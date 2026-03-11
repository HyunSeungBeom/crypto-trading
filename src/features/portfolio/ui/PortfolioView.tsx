"use client";

import Link from "next/link";
import { usePriceStore } from "@/shared/model/priceStore";
import { formatKRW, formatUSD, formatPercent } from "@/shared/lib/format";
import { HoldingRow } from "@/entities/holding";
import type { PortfolioData } from "@/entities/holding";
import { usePortfolio } from "../model/usePortfolioQueries";

interface PortfolioViewProps {
  initialData?: PortfolioData;
}

function SummaryCard({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-sm text-muted">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold font-mono ${valueColor || ""}`}
      >
        {value}
      </p>
    </div>
  );
}

export function PortfolioView({ initialData }: PortfolioViewProps) {
  const { data, isLoading } = usePortfolio({ initialData });
  const prices = usePriceStore((s) => s.prices);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        포트폴리오를 불러오는 중...
      </div>
    );
  }

  if (!data) return null;

  const holdingsWithValue = data.holdings.map((h) => {
    const live = prices[h.symbol];
    const currentPrice = live ? parseFloat(live.price) : h.avgPrice;
    const currentValue = h.quantity * currentPrice;
    const investedValue = h.quantity * h.avgPrice;
    const pnl = currentValue - investedValue;
    const pnlPercent =
      investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    return {
      ...h,
      currentPrice,
      currentValue,
      investedValue,
      pnl,
      pnlPercent,
    };
  });

  const totalHoldingsValue = holdingsWithValue.reduce(
    (sum, h) => sum + h.currentValue,
    0,
  );
  const totalInvested = holdingsWithValue.reduce(
    (sum, h) => sum + h.investedValue,
    0,
  );
  const totalPnl = totalHoldingsValue - totalInvested;
  const usdtToKrw = 1350;
  const totalAssetKRW = data.balance + totalHoldingsValue * usdtToKrw;
  const initialBalance = 10_000_000;
  const totalReturn =
    ((totalAssetKRW - initialBalance) / initialBalance) * 100;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="총 자산 (추정)"
          value={formatKRW(totalAssetKRW)}
        />
        <SummaryCard label="보유 현금" value={formatKRW(data.balance)} />
        <SummaryCard
          label="코인 평가액 (USDT)"
          value={formatUSD(totalHoldingsValue)}
        />
        <SummaryCard
          label="총 수익률"
          value={formatPercent(totalReturn)}
          valueColor={totalReturn >= 0 ? "text-success" : "text-danger"}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-semibold">보유 코인</h2>
        </div>
        {holdingsWithValue.length === 0 ? (
          <div className="p-8 text-center text-muted">
            보유 중인 코인이 없습니다.{" "}
            <Link
              href="/dashboard"
              className="text-primary hover:underline"
            >
              거래 시작하기
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 text-left font-medium">코인</th>
                  <th className="px-4 py-3 text-right font-medium">수량</th>
                  <th className="px-4 py-3 text-right font-medium">
                    평균단가
                  </th>
                  <th className="px-4 py-3 text-right font-medium">현재가</th>
                  <th className="px-4 py-3 text-right font-medium">평가금</th>
                  <th className="px-4 py-3 text-right font-medium">손익</th>
                </tr>
              </thead>
              <tbody>
                {holdingsWithValue.map((h) => (
                  <HoldingRow key={h.id} {...h} />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-border font-medium">
                  <td className="px-4 py-3">합계</td>
                  <td />
                  <td />
                  <td />
                  <td className="px-4 py-3 text-right font-mono">
                    {formatUSD(totalHoldingsValue)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      totalPnl >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatUSD(totalPnl)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
