export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { getLocalAuditLogs } from "@/lib/audit";
import { createServiceClient } from "@/lib/supabase/server";
import { DEMO_USER_ID } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const userId = DEMO_USER_ID;
    try {
      const supabase = createServiceClient();
      const { data, error } = await supabase
        .from("ai_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        return NextResponse.json({ logs: data });
      }
    } catch {
      // Fallback to local memory logs
    }

    const logs = getLocalAuditLogs(userId);
    return NextResponse.json({ logs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}