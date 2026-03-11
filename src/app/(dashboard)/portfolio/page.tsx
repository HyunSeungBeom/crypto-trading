import { fetchPortfolio } from "@/features/portfolio/api/portfolioActions";
import { PortfolioView } from "@/features/portfolio";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const portfolio = await fetchPortfolio();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">포트폴리오</h1>
      <PortfolioView initialData={portfolio ?? undefined} />
    </div>
  );
}
