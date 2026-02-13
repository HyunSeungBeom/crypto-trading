const BINANCE_API = "https://api.binance.com/api/v3";

// 거래할 심볼 목록
export const SUPPORTED_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "XRPUSDT",
  "SOLUSDT",
  "ADAUSDT",
  "DOGEUSDT",
  "DOTUSDT",
  "MATICUSDT",
  "AVAXUSDT",
] as const;

export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

export interface TickerData {
  symbol: string;
  price: string;
  priceChangePercent: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
}

export interface KlineData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchTickers(): Promise<TickerData[]> {
  const symbols = SUPPORTED_SYMBOLS.map((s) => `"${s}"`).join(",");
  const res = await fetch(
    `${BINANCE_API}/ticker/24hr?symbols=[${symbols}]`,
    { next: { revalidate: 5 } }
  );

  if (!res.ok) throw new Error("Failed to fetch tickers");
  return res.json();
}

export async function fetchKlines(
  symbol: string,
  interval: string = "1h",
  limit: number = 100
): Promise<KlineData[]> {
  const res = await fetch(
    `${BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );

  if (!res.ok) throw new Error("Failed to fetch klines");

  const data = await res.json();
  return data.map((k: (string | number)[]) => ({
    time: Math.floor((k[0] as number) / 1000),
    open: parseFloat(k[1] as string),
    high: parseFloat(k[2] as string),
    low: parseFloat(k[3] as string),
    close: parseFloat(k[4] as string),
    volume: parseFloat(k[5] as string),
  }));
}

// 심볼 이름 매핑
export const SYMBOL_NAMES: Record<string, string> = {
  BTCUSDT: "Bitcoin",
  ETHUSDT: "Ethereum",
  BNBUSDT: "BNB",
  XRPUSDT: "XRP",
  SOLUSDT: "Solana",
  ADAUSDT: "Cardano",
  DOGEUSDT: "Dogecoin",
  DOTUSDT: "Polkadot",
  MATICUSDT: "Polygon",
  AVAXUSDT: "Avalanche",
};
