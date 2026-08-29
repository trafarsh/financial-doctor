export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { marketProvider } from "@/services/market";
import { fundamentalsService } from "@/services/fundamentals";

export async function GET(req: NextRequest) {
  try {
    const symbol = req.nextUrl.searchParams.get("symbol");
    if (symbol) {
      const quote = await marketProvider.getQuote(symbol);
      const fundamental = await fundamentalsService.getFundamentals(symbol);
      return NextResponse.json({ quote, fundamental });
    }

    const quotes = await marketProvider.getAllQuotes();
    return NextResponse.json({ stocks: quotes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch stocks" }, { status: 500 });
  }
}