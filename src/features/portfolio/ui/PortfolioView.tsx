"use client";

import Link from "next/link";
import { usePriceStore } from "@/shared/model/priceStore";
import { formatKRW, formatPercent } from "@/shared/lib/format";
import { HoldingRow } from "@/entities/holding";
import type { PortfolioData } from "@/entities/holding";
import { usePortfolio } from "../model/usePortfolioQueries";

const USDT_TO_KRW = 1350;
const INITIAL_BALANCE = 10_000_000;

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

  const holdingsKRW = totalHoldingsUSDT * USDT_TO_KRW;
  const totalAssetKRW = data.balance + holdingsKRW;
  const totalReturn =
    ((totalAssetKRW - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;

  return (
    <div className="space-y-6">
      {/* 총 자산 요약 */}
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
            (초기자금 {formatKRW(INITIAL_BALANCE)} 대비)
          </span>
        </div>
      </div>

      {/* 자산 구성 카드 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">보유 현금</p>
          <p className="mt-1 text-lg font-bold font-mono">
            {formatKRW(data.balance)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {totalAssetKRW > 0
              ? `${((data.balance / totalAssetKRW) * 100).toFixed(1)}%`
              : "0%"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">코인 평가액</p>
          <p className="mt-1 text-lg font-bold font-mono">
            {formatKRW(holdingsKRW)}
          </p>
          <p className="mt-1 text-xs text-muted">
            {totalAssetKRW > 0
              ? `${((holdingsKRW / totalAssetKRW) * 100).toFixed(1)}%`
              : "0%"}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted">코인 총 손익</p>
          <p
            className={`mt-1 text-lg font-bold font-mono ${
              totalPnlUSDT >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatKRW(totalPnlUSDT * USDT_TO_KRW)}
          </p>
          <p className="mt-1 text-xs text-muted">
            ≈ {totalPnlUSDT >= 0 ? "+" : ""}
            {totalPnlUSDT.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}{" "}
            USDT
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
                    {formatKRW(holdingsKRW)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono ${
                      totalPnlUSDT >= 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatKRW(totalPnlUSDT * USDT_TO_KRW)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-muted text-right">
        * 환율 기준: 1 USDT = {USDT_TO_KRW.toLocaleString()}원 (고정)
      </p>
    </div>
  );
}
