"use client";

import { useState } from "react";
import { usePriceStore } from "@/shared/model/priceStore";
import { formatKRW, formatPercent, formatUSD } from "@/shared/lib/format";
import { useSession } from "next-auth/react";
import { SYMBOL_NAMES } from "@/entities/coin";
import type { LeaderboardUser } from "@/entities/user";
import { useLeaderboard } from "../model/useLeaderboardQueries";
import { Modal } from "@/shared/ui/Modal";

const INITIAL_BALANCE = 10_000_000;
const USDT_TO_KRW = 1350;

interface RankedUser extends LeaderboardUser {
  totalAssetKRW: number;
  returnRate: number;
}

interface LeaderboardViewProps {
  initialData?: LeaderboardUser[];
}

export function LeaderboardView({ initialData }: LeaderboardViewProps) {
  const { data: users, isLoading } = useLeaderboard({ initialData });
  const { data: session } = useSession();
  const prices = usePriceStore((s) => s.prices);
  const [selectedUser, setSelectedUser] = useState<RankedUser | null>(null);

  const rankedUsers = (users ?? [])
    .map((user) => {
      const holdingsValue = user.holdings.reduce((sum, h) => {
        const live = prices[h.symbol];
        const price = live ? parseFloat(live.price) : h.avgPrice;
        return sum + h.quantity * price;
      }, 0);

      const totalAssetKRW = user.balance + holdingsValue * USDT_TO_KRW;
      const returnRate =
        ((totalAssetKRW - INITIAL_BALANCE) / INITIAL_BALANCE) * 100;

      return { ...user, totalAssetKRW, returnRate };
    })
    .sort((a, b) => b.totalAssetKRW - a.totalAssetKRW)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted">
        랭킹을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">수익률 랭킹</h1>
        <p className="mt-1 text-sm text-muted">
          전체 유저 중 자산 기준 순위 (초기 자금: 1,000만원) · 클릭하여 포트폴리오 보기
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {rankedUsers.length === 0 ? (
          <div className="p-8 text-center text-muted">
            등록된 유저가 없습니다
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted">
                  <th className="px-4 py-3 text-center font-medium w-16">
                    순위
                  </th>
                  <th className="px-4 py-3 text-left font-medium">이름</th>
                  <th className="px-4 py-3 text-right font-medium">
                    총 자산
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    수익률
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankedUsers.map((user) => {
                  const isMe = session?.user?.id === user.id;
                  return (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`border-b border-border last:border-0 cursor-pointer ${
                        isMe ? "bg-primary/5" : "hover:bg-card-hover"
                      }`}
                    >
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            user.rank === 1
                              ? "bg-warning/20 text-warning"
                              : user.rank === 2
                                ? "bg-gray-300/20 text-gray-300"
                                : user.rank === 3
                                  ? "bg-orange-400/20 text-orange-400"
                                  : "text-muted"
                          }`}
                        >
                          {user.rank}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {user.name}
                        {isMe && (
                          <span className="ml-2 text-xs text-primary">
                            (나)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {formatKRW(user.totalAssetKRW)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-medium ${
                          user.returnRate >= 0
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {formatPercent(user.returnRate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title={`${selectedUser?.name}의 포트폴리오`}
      >
        {selectedUser && (
          <PortfolioDetail user={selectedUser} prices={prices} />
        )}
      </Modal>
    </div>
  );
}

function PortfolioDetail({
  user,
  prices,
}: {
  user: RankedUser;
  prices: Record<string, { price: string; priceChangePercent: string }>;
}) {
  return (
    <div className="space-y-4">
      {/* 요약 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-muted">총 자산</p>
          <p className="mt-1 font-mono font-bold">
            {formatKRW(user.totalAssetKRW)}
          </p>
        </div>
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-muted">수익률</p>
          <p
            className={`mt-1 font-mono font-bold ${
              user.returnRate >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {formatPercent(user.returnRate)}
          </p>
        </div>
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-muted">보유 현금</p>
          <p className="mt-1 font-mono font-bold">
            {formatKRW(user.balance)}
          </p>
        </div>
        <div className="rounded-lg bg-background p-3">
          <p className="text-xs text-muted">투자 종목</p>
          <p className="mt-1 font-mono font-bold">
            {user.holdings.length}개
          </p>
        </div>
      </div>

      {/* 보유 종목 리스트 */}
      {user.holdings.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">
          보유 중인 종목이 없습니다
        </p>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted">
                <th className="pb-2 text-left font-medium">종목</th>
                <th className="pb-2 text-right font-medium">수량</th>
                <th className="pb-2 text-right font-medium">현재가</th>
                <th className="pb-2 text-right font-medium">평가 손익</th>
              </tr>
            </thead>
            <tbody>
              {user.holdings.map((h) => {
                const live = prices[h.symbol];
                const currentPrice = live
                  ? parseFloat(live.price)
                  : h.avgPrice;
                const pnl =
                  (currentPrice - h.avgPrice) * h.quantity * USDT_TO_KRW;
                const pnlRate =
                  h.avgPrice > 0
                    ? ((currentPrice - h.avgPrice) / h.avgPrice) * 100
                    : 0;

                return (
                  <tr
                    key={h.symbol}
                    className="border-b border-border last:border-0"
                  >
                    <td className="py-2.5">
                      <p className="font-medium">
                        {SYMBOL_NAMES[h.symbol] || h.symbol}
                      </p>
                      <p className="text-xs text-muted">
                        {h.symbol.replace("USDT", "")}
                      </p>
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs">
                      {h.quantity.toFixed(4)}
                    </td>
                    <td className="py-2.5 text-right font-mono text-xs">
                      {formatUSD(currentPrice)}
                    </td>
                    <td
                      className={`py-2.5 text-right font-mono text-xs font-medium ${
                        pnl >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      <p>{formatKRW(pnl)}</p>
                      <p>{formatPercent(pnlRate)}</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
