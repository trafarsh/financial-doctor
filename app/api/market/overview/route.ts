export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { marketProvider } from "@/services/market";
import { fundamentalsService } from "@/services/fundamentals";

export async function GET(req: NextRequest) {
  try {
    const [indices, quotes, events, fundamentals] = await Promise.all([
      marketProvider.getIndices(),
      marketProvider.getAllQuotes(),
      marketProvider.getMarketEvents(),
      fundamentalsService.getAllFundamentals(),
    ]);

    return NextResponse.json({
      indices,
      quotes,
      events,
      fundamentals,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch market overview" }, { status: 500 });
  }
}