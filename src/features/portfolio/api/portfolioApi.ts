import { apiClient } from "@/shared/api";
import type { PortfolioData } from "@/entities/holding";

export const portfolioApi = {
  get(): Promise<PortfolioData> {
    return apiClient.get("api/portfolio").json();
  },
};
