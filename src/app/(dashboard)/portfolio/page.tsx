import { fetchPortfolio } from "@/features/portfolio/api/portfolioActions";
import { PortfolioView } from "@/features/portfolio";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  let portfolio = null;
  try {
    portfolio = await fetchPortfolio();
  } catch {
    // DB 연결 실패 등 — 클라이언트에서 재시도
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">포트폴리오</h1>
      <PortfolioView initialData={portfolio ?? undefined} />
    </div>
  );
}
