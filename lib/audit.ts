import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Source } from "@/lib/types";

export interface AuditLogEntry {
  userId: string | null;
  route: string;
  model: string;
  prompt: string;
  response: string;
  sources?: Source[];
}

/**
 * Writes one ai_audit_log row. Called for EVERY LLM call, BEFORE the result is
 * returned to the client (docs/00_MASTER_PROMPT.md compliance rule #3). Uses the
 * service-role client because inserts must succeed regardless of the anon RLS
 * write policy, but the row is still scoped to the caller's own userId.
 */
export async function writeAuditLog(entry: AuditLogEntry): Promise<void> {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.from("ai_audit_log").insert({
    user_id: entry.userId,
    route: entry.route,
    model: entry.model,
    prompt: entry.prompt,
    response: entry.response,
    sources: entry.sources ?? [],
  });
  if (error) {
    // Audit logging must never silently vanish - surface it, but don't let a
    // logging failure block the user from getting their (already-computed) result.
    console.error("[ai_audit_log write failed]", error);
  }
}
