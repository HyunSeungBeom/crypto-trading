import { NextResponse } from "next/server";
import { fetchTickers } from "@/lib/binance";

export async function GET() {
  try {
    const tickers = await fetchTickers();
    return NextResponse.json(tickers);
  } catch {
    return NextResponse.json(
      { error: "시세 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
