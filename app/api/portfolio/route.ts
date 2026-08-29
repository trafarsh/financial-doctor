export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { portfolioService } from "@/services/portfolio";
import { DEMO_USER_ID } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const userId = DEMO_USER_ID;
    const holdings = await portfolioService.getHoldings(userId);
    return NextResponse.json(holdings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch portfolio" }, { status: 500 });
  }
}
