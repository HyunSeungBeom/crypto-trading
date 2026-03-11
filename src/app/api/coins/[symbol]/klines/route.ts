import { NextResponse } from "next/server";
import { fetchKlines } from "@/shared/lib/binance";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get("interval") || "1h";
    const limit = parseInt(searchParams.get("limit") || "500");
    const endTime = searchParams.get("endTime");

    const klines = await fetchKlines(
      symbol.toUpperCase(),
      interval,
      limit,
      endTime ? parseInt(endTime) : undefined,
    );
    return NextResponse.json(klines);
  } catch {
    return NextResponse.json(
      { error: "차트 데이터 조회에 실패했습니다" },
      { status: 500 }
    );
  }
}
