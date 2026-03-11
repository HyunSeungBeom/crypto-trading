export interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  balance: number;
  holdings: { symbol: string; quantity: number; avgPrice: number }[];
  totalValue: number;
}
