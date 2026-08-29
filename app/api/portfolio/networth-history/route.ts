export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { portfolioService } from "@/services/portfolio";
import { DEMO_USER_ID } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const userId = DEMO_USER_ID;
    const snapshots = await portfolioService.getSnapshotHistory(userId);
    return NextResponse.json({ snapshots });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch snapshot history" }, { status: 500 });
  }
}