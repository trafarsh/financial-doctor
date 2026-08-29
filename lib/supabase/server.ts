import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

/**
 * Session-aware server client (anon key + caller's cookies). Respects RLS.
 * Use in API routes / server components for all normal reads/writes.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component render; middleware refreshes the session instead
          }
        },
      },
    }
  );
}

/**
 * Service-role client. BYPASSES RLS — server code only, never import client-side.
 * Still explicitly filter by the session userId in every query; service-role is
 * for writes the anon policy can't express (e.g. audit log inserts), not a
 * license to skip scoping.
 */
export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

/**
 * Resolves the authenticated user's id from the server-side session.
 * NEVER accept userId from a request body/query param instead of this.
 * Throws if there is no session — callers should catch and return 401.
 */
export async function requireUserId(): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user.id;
}
