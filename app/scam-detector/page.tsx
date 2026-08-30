"use client";

import React, { useState } from "react";
import { ShieldAlert, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
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
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8 md:py-8 w-full max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-[32px] tracking-tight m-0 mb-2">Scam detector</h1>
        <p className="text-sm text-ink/65 m-0">
          Paste a financial claim or tip and get an AI-powered risk assessment with cited regulatory sources.
        </p>
      </div>

      {/* Input area */}
      <div className="border-2 border-ink p-5 flex flex-col gap-3">
        <label className="kicker">Paste financial tip, claim, or social message</label>
        <textarea
          rows={3}
          value={claimText}
          onChange={(e) => setClaimText(e.target.value)}
          placeholder="e.g. 'Invest in our exclusive fund and get guaranteed 25% monthly returns with zero risk...'"
          className="input"
        />

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-1">
          <div className="flex gap-2 flex-wrap items-center">
            <span className="kicker flex items-center gap-1.5 mr-1">
              <Sparkles className="w-3 h-3 text-accent" />
            </span>
            {SAMPLE_CLAIMS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => handleEvaluate(sample)}
                className="text-[11px] px-3 py-1.5 border border-divider font-heading font-600 cursor-pointer text-ink hover:border-accent transition-colors"
              >
                Try: {sample.substring(0, 28)}...
              </button>
            ))}
          </div>

          <button
            onClick={() => handleEvaluate()}
            disabled={loading || !claimText.trim()}
            className="btn btn-primary self-start sm:self-auto"
          >
            {loading ? "Analyzing..." : "Analyze claim"} <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-accent bg-accent-100 text-xs text-accent-800">{error}</div>
      )}

      {/* Result */}
      {result && (
        <div className="border-2 border-accent">
          {/* Verdict banner */}
          <div className="bg-accent text-bg px-6 py-5 flex items-center gap-5 flex-wrap">
            <div>
              <div className="text-[10px] tracking-[0.14em] uppercase opacity-80 font-600 mb-2">Verdict</div>
              <VerdictBadge verdict={result.verdict} />
            </div>
            <div className="ml-auto text-right">
              <div className="text-[10px] tracking-[0.14em] uppercase opacity-80 font-600 mb-1">Risk score</div>
              <div className="font-heading font-800 text-[28px] tracking-tight">
                {result.riskScore}/100 &middot; {result.riskLevel}
              </div>
            </div>
          </div>

          {/* Signals */}
          <div className="p-6">
            {result.detectedSignals && result.detectedSignals.length > 0 && (
              <>
                <div className="font-heading font-800 text-sm mb-3.5 tracking-[0.04em] uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                  Suspicious signals detected
                </div>
                <div className="flex gap-2 flex-wrap mb-5">
                  {result.detectedSignals.map((sig, i) => (
                    <span key={i} className="tag tag-accent text-xs px-3 py-1.5">
                      {sig}
                    </span>
                  ))}
                </div>
              </>
            )}

            <div className="border-t-2 border-divider pt-5">
              <div className="font-heading font-800 text-sm mb-2.5">Analysis</div>
              <p className="text-sm leading-relaxed whitespace-pre-line m-0 mb-4">{result.explanation}</p>

              <SourceList sources={result.sources} title="Sources cited" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
