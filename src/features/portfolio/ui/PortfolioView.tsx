"use client";

import Link from "next/link";
import { usePriceStore } from "@/shared/model/priceStore";
import { formatUSD, formatKRW, formatPercent, formatNumber } from "@/shared/lib/format";
import { HoldingRow } from "@/entities/holding";
import type { PortfolioData } from "@/entities/holding";
import { usePortfolio } from "../model/usePortfolioQueries";

const USDT_TO_KRW = 1350;
const INITIAL_BALANCE_KRW = 10_000_000;

interface PortfolioViewProps {
  initialData?: PortfolioData;
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

  const totalHoldingsUSDT = holdingsWithValue.reduce(
    (sum, h) => sum + h.currentValue,
    0,
  );
  const totalPnlUSDT = holdingsWithValue.reduce(
    (sum, h) => sum + h.pnl,
    0,
  );

  const balanceKRW = data.balance;
  const holdingsKRW = totalHoldingsUSDT * USDT_TO_KRW;
  const totalAssetKRW = balanceKRW + holdingsKRW;
  const totalReturn =
    ((totalAssetKRW - INITIAL_BALANCE_KRW) / INITIAL_BALANCE_KRW) * 100;

  return (
    <div className="space-y-6">
      {/* 총 자산 */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted">총 자산 (추정)</p>
        <p className="mt-1 text-3xl font-bold font-mono tracking-tight">
          {formatKRW(totalAssetKRW)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`text-sm font-semibold font-mono ${
              totalReturn >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatPercent(totalReturn)}
          </span>
          <span className="text-xs text-muted">
            초기자금 {formatKRW(INITIAL_BALANCE_KRW)} 대비
          </span>
        </div>
      </div>

      {/* 자산 구성 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">보유 현금</p>
          <p className="mt-1 text-lg font-bold font-mono">
            {formatKRW(balanceKRW)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">코인 평가액</p>
          <p className="mt-1 text-lg font-bold font-mono">
            {formatUSD(totalHoldingsUSDT)}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            ≈ {formatKRW(holdingsKRW)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">코인 총 손익</p>
          <p
            className={`mt-1 text-lg font-bold font-mono ${
              totalPnlUSDT >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {totalPnlUSDT >= 0 ? "+" : ""}{formatUSD(totalPnlUSDT)}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            ≈ {formatKRW(totalPnlUSDT * USDT_TO_KRW)}
          </p>
        </div>
      </div>

      {/* 보유 코인 테이블 */}
      <div className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3">
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
                  <th className="px-4 py-3 text-right font-medium">평균단가</th>
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
                    <div>{formatUSD(totalHoldingsUSDT)}</div>
                    <div className="text-xs text-muted font-normal">
                      ≈ {formatKRW(holdingsKRW)}
                    </div>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      totalPnlUSDT >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    <div>{totalPnlUSDT >= 0 ? "+" : ""}{formatUSD(totalPnlUSDT)}</div>
                    <div className="text-xs font-normal">
                      ≈ {formatKRW(totalPnlUSDT * USDT_TO_KRW)}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted text-right">
        * 환율: 1 USDT ≈ {formatNumber(USDT_TO_KRW, 0)}원 (고정)
      </p>
    </div>
  );
}
