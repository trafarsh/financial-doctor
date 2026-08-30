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
