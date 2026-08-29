// ============================================================
// FINANCIAL DOCTOR (finX) — AI Audit Trail Logger
// Logs every LLM prompt, response, sources, and user identity
// ============================================================

import { createServiceClient } from "./supabase/server";
import { AuditLog, Source } from "./types";

// In-memory fallback ledger for local demo/development without DB connection
const localAuditLogs: AuditLog[] = [];

export async function logAIOperation(params: {
  userId?: string;
  requestId?: string;
  action: string;
  route: string;
  model: string;
  prompt: string;
  response: string;
  sources?: Source[];
}): Promise<AuditLog> {
  const auditRecord: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: params.userId || "anonymous",
    requestId: params.requestId || `req_${Date.now()}`,
    action: params.action,
    route: params.route,
    model: params.model,
    prompt: params.prompt,
    response: params.response,
    sources: params.sources || [],
    createdAt: new Date().toISOString(),
  };

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("ai_audit_log").insert({
      user_id: params.userId && params.userId !== "anonymous" ? params.userId : null,
      request_id: auditRecord.requestId,
      action: params.action,
      route: params.route,
      model: params.model,
      prompt: params.prompt,
      response: params.response,
      sources: params.sources || [],
    });

    if (error) {
      console.warn("[AuditLog] Supabase write failed, falling back to local ledger:", error.message);
      localAuditLogs.unshift(auditRecord);
    }
  } catch (err) {
    console.warn("[AuditLog] Could not connect to Supabase, logged locally:", err);
    localAuditLogs.unshift(auditRecord);
  }

  // Always keep in local ledger for instant client-side inspection
  if (!localAuditLogs.some((l) => l.id === auditRecord.id)) {
    localAuditLogs.unshift(auditRecord);
  }

  return auditRecord;
}

export function getLocalAuditLogs(userId?: string): AuditLog[] {
  if (userId) {
    return localAuditLogs.filter((l) => l.userId === userId || l.userId === "anonymous");
  }
  return localAuditLogs;
}
