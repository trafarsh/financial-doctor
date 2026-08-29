// ============================================================
// FINANCIAL DOCTOR (finX) — Supabase Browser Client (Anon)
// Safe for client components (respects RLS policies)
// ============================================================

import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

export const createBrowserClient = createClient;
