"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Send, Sparkles, CheckCircle2, BookOpen } from "lucide-react";
import { VerdictBadge } from "@/components/ui/VerdictBadge";
import { SourceList } from "@/components/ui/SourceList";
import { ScamCheckResult } from "@/lib/types";

const SAMPLE_CLAIMS = [
  "Guaranteed 30% monthly return from automated crypto arbitrage bot with zero capital risk.",
  "Join our VIP Telegram group to double your money in 21 days with insider operator tips.",
  "Our proprietary algorithmic trading strategy gives 100% assured profit on Bank Nifty options.",
  "Public bank fixed deposits currently offer guaranteed interest rates backed by DICGC up to ₹5 Lakhs.",
];

export default function ScamDetectorPage() {
  const [claimText, setClaimText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEvaluate = async (textToUse?: string) => {
    const text = (textToUse || claimText).trim();
    if (!text || loading) return;

    if (textToUse) setClaimText(textToUse);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/scam-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimText: text }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Scam evaluation failed");
      }

      const json = await res.json();
      if (json.result) {
        setResult(json.result);
      }
    } catch (err: any) {
      setError(err.message || "Failed to evaluate claim");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-hairline-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-trading-down/15 border border-trading-down/30 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-trading-down" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Scam & Misinformation Detector</h1>
          </div>
          <p className="text-xs text-muted-strong mt-0.5">
            Cross-check suspicious financial promises, finfluencer tips, and return guarantees against official SEBI & RBI regulations.
          </p>
        </div>

        <div className="text-[10px] font-mono text-trading-up bg-ink px-3 py-1.5 rounded-lg border border-hairline-dark">
          SEBI / RBI GROUNDED
        </div>
      </div>

      {/* Input Area */}
      <div className="double-bezel p-6 space-y-4">
        <label className="text-xs font-bold text-white uppercase tracking-wider block">
          Paste Financial Tip, Claim, or Social Message:
        </label>
        <textarea
          rows={3}
          value={claimText}
          onChange={(e) => setClaimText(e.target.value)}
          placeholder="e.g. 'Invest in our exclusive fund and get guaranteed 25% monthly returns with zero risk...'"
          className="w-full bg-ink border border-hairline-dark focus:border-primary rounded-xl p-3.5 text-xs text-white placeholder-muted outline-none transition-colors leading-relaxed"
        />

        {/* Quick Sample Prompts */}
        <div className="space-y-2">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            <span>Try a Sample Claim:</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_CLAIMS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleEvaluate(sample)}
                className="text-[11px] bg-ink hover:bg-surface-elevated border border-hairline-dark hover:border-primary/40 text-muted-strong hover:text-white px-2.5 py-1 rounded text-left transition-colors"
              >
                "{sample.substring(0, 50)}..."
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleEvaluate()}
            disabled={loading || !claimText.trim()}
            className="bg-primary hover:bg-primary-active disabled:opacity-40 text-primary-foreground font-bold text-xs px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <span>{loading ? "Cross-Checking Regulations..." : "Check Claim Credibility"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-trading-down/15 border border-trading-down/40 rounded-lg text-xs text-trading-down">
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="double-bezel p-6 space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline-dark pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                Official Credibility Verdict
              </span>
              <div className="pt-1.5">
                <VerdictBadge verdict={result.verdict} />
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted tracking-wider block">
                Risk Classification
              </span>
              <div className="text-sm font-extrabold font-mono text-white mt-1">
                {result.riskLevel} RISK ({result.riskScore}/100)
              </div>
            </div>
          </div>

          {/* Detected Signals */}
          {result.detectedSignals && result.detectedSignals.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-primary" />
                <span>Detected Suspicious Indicators:</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {result.detectedSignals.map((sig, i) => (
                  <span
                    key={i}
                    className="text-xs bg-trading-down/15 border border-trading-down/30 text-trading-down px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{sig}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Explanation */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Educational Breakdown:
            </span>
            <div className="p-4 bg-ink rounded-xl border border-hairline-dark text-xs text-body leading-relaxed whitespace-pre-line">
              {result.explanation}
            </div>
          </div>

          {/* Grounding Sources */}
          <div className="pt-2">
            <SourceList sources={result.sources} title="Official Regulatory References Cited" />
          </div>
        </div>
      )}
    </div>
  );
}
