// ============================================================
// FINANCIAL DOCTOR (finX) — Unified Supabase Access Entrypoint
// ============================================================

export { createClient as createBrowserClient } from "./supabase/client";
export { createClient as createServerClient, createServiceClient } from "./supabase/server";
