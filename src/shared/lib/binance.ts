import {
  SUPPORTED_SYMBOLS,
  type TickerData,
  type KlineData,
  type OrderBookData,
} from "@/entities/coin";

export { SUPPORTED_SYMBOLS };
export type { TickerData, KlineData, OrderBookData };
export type { SupportedSymbol } from "@/entities/coin";

const BINANCE_API = "https://api.binance.com/api/v3";

export async function fetchTickers(): Promise<TickerData[]> {
  const symbols = SUPPORTED_SYMBOLS.map((s) => `"${s}"`).join(",");
  const res = await fetch(
    `${BINANCE_API}/ticker/24hr?symbols=[${symbols}]`,
    { next: { revalidate: 5 } },
  );

  if (!res.ok) throw new Error("Failed to fetch tickers");
  return res.json();
}

export async function fetchKlines(
  symbol: string,
  interval: string = "1h",
  limit: number = 100,
  endTime?: number,
): Promise<KlineData[]> {
  const params = new URLSearchParams({
    symbol,
    interval,
    limit: String(limit),
  });
  if (endTime) params.set("endTime", String(endTime));

  const res = await fetch(`${BINANCE_API}/klines?${params}`);

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

export async function fetchOrderBook(
  symbol: string,
  limit: number = 20,
): Promise<OrderBookData> {
  const res = await fetch(
    `${BINANCE_API}/depth?symbol=${symbol}&limit=${limit}`,
  );

  if (!res.ok) throw new Error("Failed to fetch order book");

  const data = await res.json();
  return {
    bids: data.bids.map((b: string[]) => ({ price: b[0], quantity: b[1] })),
    asks: data.asks.map((a: string[]) => ({ price: a[0], quantity: a[1] })),
  };
}
