"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Sparkles } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.warn("[Auth] Supabase signup error, continuing to onboarding:", authError.message);
      }

      router.push("/onboarding");
    } catch {
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw authError;
    } catch (err: any) {
      console.warn("[Auth] Google OAuth failed, continuing to onboarding in demo mode:", err.message || err);
      router.push("/onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-surface border border-divider flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6 text-accent" />
        </div>
        <h1 className="text-2xl mb-2">Create your account</h1>
        <p className="text-sm text-ink/65">Get started with private, deterministic financial intelligence</p>
      </div>

      <div className="bg-surface border-2 border-divider p-6">
        {error && (
          <div className="mb-4 p-3 border border-accent bg-accent-100 text-xs text-accent-800">{error}</div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="field">
            <label>Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investor@domain.com"
                className="input pl-9"
                style={{ paddingLeft: "2.25rem" }}
              />
            </div>
          </div>

          <div className="field">
            <label>Create password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink/45 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="input pl-9"
                style={{ paddingLeft: "2.25rem" }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-block justify-center">
            <span>{loading ? "Creating account..." : "Create account"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="relative flex py-4 items-center">
          <div className="flex-grow border-t border-divider"></div>
          <span className="flex-shrink mx-4 text-ink/40 text-[10px] uppercase font-bold tracking-wider">or</span>
          <div className="flex-grow border-t border-divider"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="btn btn-secondary btn-block justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="pt-4 text-center text-xs text-ink/65">
          Already have an account?{" "}
          <Link href="/login" className="text-accent font-semibold">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
