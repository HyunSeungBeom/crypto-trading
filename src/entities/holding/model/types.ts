export interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
}

export interface PortfolioData {
  balance: number;
  holdings: Holding[];
}
