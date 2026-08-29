// ============================================================
// FINANCIAL DOCTOR (finX) — Alerts & Notification Service
// Real CRUD against Supabase. Alerts are generated from actual
// computed risk analysis flags — never canned/mock content.
// ============================================================

import { Alert, AnomalyFlag, RiskAnalysis } from "@/lib/types";
import { createServiceClient } from "@/lib/supabase/server";

function mapAlertRow(r: any): Alert {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    message: r.message,
    type: r.type,
    severity: r.severity,
    read: r.read,
    dismissed: r.dismissed,
    createdAt: r.created_at,
  };
}

function severityFromFlag(flag: AnomalyFlag): Alert["severity"] {
  if (flag.severity === "high") return "high";
  if (flag.severity === "medium") return "medium";
  return "low";
}

function alertTypeFromFlag(flag: AnomalyFlag): Alert["type"] {
  if (flag.type === "concentration") return "concentration_alert";
  if (flag.type === "high_debt_ratio" || flag.type === "low_liquidity") return "risk_change";
  return "info";
}

function titleFromFlag(flag: AnomalyFlag): string {
  switch (flag.type) {
    case "concentration":
      return "Concentration Risk Detected";
    case "high_debt_ratio":
      return "High Debt Ratio Detected";
    case "low_liquidity":
      return "Low Liquidity Buffer Detected";
    default:
      return "Portfolio Anomaly Detected";
  }
}

export class AlertsService {
  /**
   * Retrieves active (non-dismissed) alerts for the user, newest first.
   */
  async getAlerts(userId: string): Promise<Alert[]> {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("user_id", userId)
      .eq("dismissed", false)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Failed to load alerts: ${error.message}`);
    return (data || []).map(mapAlertRow);
  }

  async markAsRead(userId: string, alertId: string): Promise<void> {
    const supabase = createServiceClient();
    const { error } = await supabase.from("alerts").update({ read: true }).eq("id", alertId).eq("user_id", userId);
    if (error) throw new Error(`Failed to mark alert as read: ${error.message}`);
  }

  async dismissAlert(userId: string, alertId: string): Promise<void> {
    const supabase = createServiceClient();
    const { error } = await supabase.from("alerts").update({ dismissed: true }).eq("id", alertId).eq("user_id", userId);
    if (error) throw new Error(`Failed to dismiss alert: ${error.message}`);
  }

  /**
   * Generates real alerts from the user's current computed risk analysis
   * flags. A partial unique index (user_id, type, message) where
   * dismissed = false enforces dedup at the DB level — it lets a dismissed
   * alert recur later, but cannot be targeted by ON CONFLICT (Postgres does
   * not match partial indexes there). So each alert is inserted individually
   * and unique-violation errors (code 23505) are treated as "already exists".
   * This stays correct under concurrent calls, unlike a select-then-insert.
   */
  async syncAlertsFromRiskAnalysis(userId: string, riskAnalysis: RiskAnalysis): Promise<void> {
    if (riskAnalysis.flags.length === 0) return;

    const supabase = createServiceClient();

    await Promise.all(
      riskAnalysis.flags.map(async (flag) => {
        const { error } = await supabase.from("alerts").insert({
          user_id: userId,
          title: titleFromFlag(flag),
          message: flag.message,
          type: alertTypeFromFlag(flag),
          severity: severityFromFlag(flag),
          read: false,
          dismissed: false,
        });

        // 23505 = unique_violation: an identical active alert already exists.
        if (error && error.code !== "23505") {
          throw new Error(`Failed to sync alerts: ${error.message}`);
        }
      })
    );
  }
}

export const alertsService = new AlertsService();
