export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { alertsService } from "@/services/alerts";
import { DEMO_USER_ID } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const userId = DEMO_USER_ID;
    const alerts = await alertsService.getAlerts(userId);
    return NextResponse.json({ alerts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = DEMO_USER_ID;
    const body = await req.json();
    const { alertId, action } = body;

    if (action === "read") {
      await alertsService.markAsRead(userId, alertId);
    } else if (action === "dismiss") {
      await alertsService.dismissAlert(userId, alertId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update alert" }, { status: 500 });
  }
}