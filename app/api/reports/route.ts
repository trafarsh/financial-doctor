export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { reportsService } from "@/services/reports";
import { DEMO_USER_ID } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const userId = DEMO_USER_ID;
    const report = await reportsService.generatePortfolioReport(userId);
    return NextResponse.json({ report });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate report" }, { status: 500 });
  }
}