export type SupportedSymbol = (typeof SUPPORTED_SYMBOLS)[number];

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
  "LINKUSDT",
  "UNIUSDT",
  "LTCUSDT",
  "ATOMUSDT",
  "ETCUSDT",
  "XLMUSDT",
  "NEARUSDT",
  "APTUSDT",
  "FILUSDT",
  "ARBUSDT",
  "OPUSDT",
  "ICPUSDT",
  "VETUSDT",
  "HBARUSDT",
  "MKRUSDT",
  "AAVEUSDT",
  "GRTUSDT",
  "ALGOUSDT",
  "FTMUSDT",
  "SANDUSDT",
  "MANAUSDT",
  "AXSUSDT",
  "THETAUSDT",
  "EOSUSDT",
  "XTZUSDT",
  "SNXUSDT",
  "CRVUSDT",
  "LDOUSDT",
  "INJUSDT",
  "SUIUSDT",
  "SEIUSDT",
  "TIAUSDT",
  "RUNEUSDT",
  "PENDLEUSDT",
  "WLDUSDT",
  "STXUSDT",
  "IMXUSDT",
  "RENDERUSDT",
  "FETUSDT",
  "ONDOUSDT",
] as const;

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
  LINKUSDT: "Chainlink",
  UNIUSDT: "Uniswap",
  LTCUSDT: "Litecoin",
  ATOMUSDT: "Cosmos",
  ETCUSDT: "Ethereum Classic",
  XLMUSDT: "Stellar",
  NEARUSDT: "NEAR Protocol",
  APTUSDT: "Aptos",
  FILUSDT: "Filecoin",
  ARBUSDT: "Arbitrum",
  OPUSDT: "Optimism",
  ICPUSDT: "Internet Computer",
  VETUSDT: "VeChain",
  HBARUSDT: "Hedera",
  MKRUSDT: "Maker",
  AAVEUSDT: "Aave",
  GRTUSDT: "The Graph",
  ALGOUSDT: "Algorand",
  FTMUSDT: "Fantom",
  SANDUSDT: "The Sandbox",
  MANAUSDT: "Decentraland",
  AXSUSDT: "Axie Infinity",
  THETAUSDT: "Theta Network",
  EOSUSDT: "EOS",
  XTZUSDT: "Tezos",
  SNXUSDT: "Synthetix",
  CRVUSDT: "Curve DAO",
  LDOUSDT: "Lido DAO",
  INJUSDT: "Injective",
  SUIUSDT: "Sui",
  SEIUSDT: "Sei",
  TIAUSDT: "Celestia",
  RUNEUSDT: "THORChain",
  PENDLEUSDT: "Pendle",
  WLDUSDT: "Worldcoin",
  STXUSDT: "Stacks",
  IMXUSDT: "Immutable",
  RENDERUSDT: "Render",
  FETUSDT: "Fetch.ai",
  ONDOUSDT: "Ondo Finance",
};

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

export interface TickerUpdate {
  symbol: string;
  price: string;
  priceChangePercent: string;
}

export interface OrderBookEntry {
  price: string;
  quantity: string;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}
