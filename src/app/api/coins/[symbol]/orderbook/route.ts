import { NextResponse } from "next/server";
import { fetchOrderBook } from "@/shared/lib/binance";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");

    const orderbook = await fetchOrderBook(symbol.toUpperCase(), limit);
    return NextResponse.json(orderbook);
  } catch {
    return NextResponse.json(
      { error: "호가 데이터 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
