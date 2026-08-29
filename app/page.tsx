"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  Cpu,
  ShieldCheck,
  Sliders,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Lock,
} from "lucide-react";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { VerdictBadge } from "@/components/ui/VerdictBadge";

export default function LandingPage() {
  return (
    <div className="space-y-24 py-8">
      {/* 1. Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-card border border-hairline-dark text-xs font-semibold text-primary">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>AI Decision-Support Copilot for Retail Investors</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Invest with more insight.
          <br />
          <span className="text-primary">Understand your true risk.</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-strong max-w-2xl mx-auto leading-relaxed">
          An AI-powered financial intelligence copilot that analyzes your portfolio, market signals, financial news, and potential investment scams with explainable, source-backed insights.
        </p>

        {/* Primary Action Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/onboarding"
            className="w-full sm:w-auto bg-primary hover:bg-primary-active active:scale-95 text-primary-foreground font-bold text-sm px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <span>Analyze My Portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-surface-card hover:bg-surface-elevated border border-hairline-dark hover:border-primary text-white font-semibold text-sm px-8 py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all"
          >
            <span>Explore Live Demo</span>
          </Link>
        </div>

        <p className="text-xs text-muted tracking-wide">
          100% Free · No bank logins required · Deterministic mathematics · SEBI & RBI grounded
        </p>
      </section>

      {/* 2. Interactive Feature Matrix Preview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Risk Engine */}
        <div className="double-bezel p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white">Deterministic Risk Modeling</h3>
            <p className="text-xs text-muted-strong mt-1 leading-relaxed">
              Herfindahl-Hirschman concentration scoring, debt-to-asset stress tests, and liquidity analytics in pure TypeScript.
            </p>
          </div>
          <div className="pt-2">
            <ScoreGauge score={54} title="Sample Portfolio Risk" subtitle="40% concentration + 40% debt + 20% liquidity" />
          </div>
        </div>

        {/* Card 2: Scam Detector */}
        <div className="double-bezel p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-trading-down/10 border border-trading-down/20 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5 text-trading-down" />
            </div>
            <h3 className="text-lg font-bold text-white">Scam & Misinformation Check</h3>
            <p className="text-xs text-muted-strong mt-1 leading-relaxed">
              Ground suspicious financial tips against official SEBI and RBI regulatory orders with zero hallucinated sources.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <div className="p-3 bg-ink rounded-lg border border-hairline-dark text-xs">
              <p className="text-muted-strong italic">"Guaranteed 30% monthly return from algorithmic forex bot..."</p>
            </div>
            <VerdictBadge verdict="likely_scam" />
          </div>
        </div>

        {/* Card 3: Grounded AI Copilot */}
        <div className="double-bezel p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-trading-up/10 border border-trading-up/20 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5 text-trading-up" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Research Copilot</h3>
            <p className="text-xs text-muted-strong mt-1 leading-relaxed">
              Context-aware research assistant fusing your asset allocations, live Indian market indices, and regulatory knowledge.
            </p>
          </div>
          <div className="p-3 bg-ink rounded-lg border border-hairline-dark space-y-2 pt-2">
            <span className="text-[10px] font-mono text-primary uppercase font-bold">Verified Citation Attached</span>
            <p className="text-xs text-body line-clamp-2">
              "SEBI regulations explicitly prohibit investment advisers from promising fixed returns on market-linked products."
            </p>
          </div>
        </div>
      </section>

      {/* 3. What This Is vs. What This Isn't */}
      <section className="double-bezel p-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">Clear Boundaries & Regulatory Compliance</h2>
          <p className="text-xs text-muted-strong">
            Built with strict safety guardrails to empower financial literacy rather than replacing licensed advisory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* What This Is */}
          <div className="p-5 rounded-xl bg-ink border border-trading-up/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-trading-up uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>What Financial Doctor Is</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-strong">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trading-up shrink-0 mt-0.5" />
                <span>An educational decision-support copilot for understanding personal risk exposure.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trading-up shrink-0 mt-0.5" />
                <span>Deterministic mathematical portfolio health and HHI diversification scoring.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trading-up shrink-0 mt-0.5" />
                <span>Source-grounded scam verification citing official SEBI, RBI, and AMFI guidelines.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-trading-up shrink-0 mt-0.5" />
                <span>What-if scenario stress testing and compound growth projections.</span>
              </li>
            </ul>
          </div>

          {/* What This Isn't */}
          <div className="p-5 rounded-xl bg-ink border border-trading-down/30 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-trading-down uppercase tracking-wider">
              <XCircle className="w-4 h-4" />
              <span>What Financial Doctor Is Not</span>
            </div>
            <ul className="space-y-2 text-xs text-muted-strong">
              <li className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-trading-down shrink-0 mt-0.5" />
                <span>NOT a registered investment adviser or asset management company.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-trading-down shrink-0 mt-0.5" />
                <span>NEVER issues personalized buy, sell, hold, or allocation directives.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-trading-down shrink-0 mt-0.5" />
                <span>NOT an automated broker or trade execution platform.</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-3.5 h-3.5 text-trading-down shrink-0 mt-0.5" />
                <span>Never collects or stores bank credentials, PINs, or private API keys.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Complete Module Grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white text-center">Comprehensive Platform Capabilities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "CSV & Excel Ingestion",
              desc: "Import .csv or .xlsx with row-by-row Zod validation & client-side export.",
              icon: FileSpreadsheet,
              href: "/import",
            },
            {
              title: "Live Market Intelligence",
              desc: "Track Nifty 50, Sensex, Gold, Bond yields, and company fundamentals.",
              icon: TrendingUp,
              href: "/markets/overview",
            },
            {
              title: "Stress-Test Simulator",
              desc: "Simulate market crashes (-20%), inflation drag, and monthly compounding.",
              icon: Sliders,
              href: "/simulator",
            },
            {
              title: "Transparent AI Audit Log",
              desc: "Every AI interaction is hashed, cited, and logged for regulatory auditing.",
              icon: Lock,
              href: "/audit",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={idx}
                href={item.href}
                className="double-bezel p-5 hover:border-primary/50 transition-all group block space-y-2"
              >
                <Icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-muted-strong leading-relaxed">{item.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. Call to Action Banner */}
      <section className="double-bezel p-10 text-center space-y-6 bg-gradient-to-b from-surface-card to-canvas-dark">
        <h2 className="text-3xl font-extrabold text-white">Ready to inspect your financial health?</h2>
        <p className="text-sm text-muted-strong max-w-xl mx-auto">
          Start from zero with our guided wizard or import existing holdings in under 60 seconds.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/onboarding"
            className="bg-primary hover:bg-primary-active text-primary-foreground font-bold text-sm px-8 py-3 rounded-lg shadow-md transition-all"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
