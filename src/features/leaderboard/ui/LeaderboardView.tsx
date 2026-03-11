"use client";

import { usePriceStore } from "@/shared/model/priceStore";
import { formatKRW, formatPercent } from "@/shared/lib/format";
import { useSession } from "next-auth/react";
import { useLeaderboard } from "../model/useLeaderboardQueries";

const INITIAL_BALANCE = 10_000_000;
const USDT_TO_KRW = 1350;

export function LeaderboardView() {
  const { data: users, isLoading } = useLeaderboard();
  const { data: session } = useSession();
  const prices = usePriceStore((s) => s.prices);

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
          전체 유저 중 자산 기준 순위 (초기 자금: 1,000만원)
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
                      className={`border-b border-border last:border-0 ${
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
    </div>
  );
}
