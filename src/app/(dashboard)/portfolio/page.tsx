"use client";

import { PortfolioView } from "@/features/portfolio";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">포트폴리오</h1>
      <PortfolioView />
    </div>
  );
}
