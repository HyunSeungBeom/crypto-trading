import { create } from "zustand";
import type { TickerUpdate } from "@/entities/coin";

interface PriceState {
  prices: Record<string, TickerUpdate>;
  updatePrice: (symbol: string, data: TickerUpdate) => void;
  setPrices: (prices: Record<string, TickerUpdate>) => void;
}

export const usePriceStore = create<PriceState>((set) => ({
  prices: {},
  updatePrice: (symbol, data) =>
    set((state) => ({ prices: { ...state.prices, [symbol]: data } })),
  setPrices: (prices) => set({ prices }),
}));
