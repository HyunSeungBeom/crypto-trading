import { NextResponse } from "next/server";
import { fetchKlines } from "@/lib/binance";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get("interval") || "1h";
    const limit = parseInt(searchParams.get("limit") || "100");

    const klines = await fetchKlines(symbol.toUpperCase(), interval, limit);
    return NextResponse.json(klines);
  } catch {
    return NextResponse.json(
      { error: "차트 데이터 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
