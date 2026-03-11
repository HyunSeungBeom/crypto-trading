"use client";

import { CoinList } from "@/features/coin";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">시세 현황</h1>
        <p className="mt-1 text-sm text-muted">
          실시간 암호화폐 시세 (USDT 기준)
        </p>
      </div>

      <CoinList />
    </div>
  );
}
