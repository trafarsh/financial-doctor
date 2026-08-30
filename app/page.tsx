"use client";

import React from "react";
import Link from "next/link";
import {
  Sliders,
  TrendingUp,
  ArrowRight,
  FileSpreadsheet,
  Lock,
} from "lucide-react";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { VerdictBadge } from "@/components/ui/VerdictBadge";

const MODULES = [
  {
    title: "Import",
    desc: "CSV, XLSX, or manual entry. Validated and mapped instantly.",
    icon: FileSpreadsheet,
    href: "/import",
  },
  {
    title: "Markets",
    desc: "Live indices, equities, fundamentals. Economic calendar built in.",
    icon: TrendingUp,
    href: "/markets/overview",
  },
  {
    title: "Simulator",
    desc: "Project SIP growth, stress-test with market shocks, compare scenarios.",
    icon: Sliders,
    href: "/simulator",
  },
  {
    title: "Audit",
    desc: "Every AI call logged — prompt, response, model, cited sources.",
    icon: Lock,
    href: "/audit",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 pt-20 pb-16 border-b-2 border-divider">
        <div className="kicker-accent mb-3">AI-powered portfolio intelligence</div>
        <h1 className="text-4xl sm:text-6xl leading-[1.05] tracking-tight max-w-3xl mb-4">
          Know your money.
          <br />
          Not just the numbers.
        </h1>
        <p className="text-base sm:text-lg leading-relaxed max-w-xl text-ink/75 mb-8">
          finX reads your portfolio, scans filings, detects anomalies and runs what-if scenarios —
          so you understand risk before it finds you.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/onboarding" className="btn btn-primary text-base px-6 py-3">
            <span>Analyze my portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard" className="btn btn-secondary text-base px-6 py-3">
            Explore demo
          </Link>
        </div>
      </section>

      {/* Feature preview cards */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 border-b-2 border-divider">
        <div className="p-8 border-b md:border-b-0 md:border-r border-divider">
          <div className="kicker-accent mb-3">Risk gauge</div>
          <ScoreGauge score={64} title="Portfolio risk" subtitle="Concentration risk elevated. Single-stock exposure in NVDA exceeds your 20% threshold by 4 points." type="risk" />
        </div>

        <div className="p-8 border-b md:border-b-0 md:border-r border-divider">
          <div className="kicker-accent mb-3">Scam detector</div>
          <div className="p-3.5 bg-bg border border-divider mb-3">
            <p className="text-xs italic text-ink/75 m-0">
              "Guaranteed 40% monthly returns on crypto" — 3 of 4 fraud signals triggered.
              Cross-referenced SEBI advisory database.
            </p>
          </div>
          <VerdictBadge verdict="likely_scam" />
        </div>

        <div className="p-8">
          <div className="kicker-accent mb-3">AI copilot</div>
          <div className="bg-surface p-3.5 mb-2.5 border-l-2 border-accent">
            <p className="text-sm m-0 leading-relaxed">
              "Your real estate allocation is 42% of net worth — significantly above the 25%
              threshold for balanced risk."
            </p>
          </div>
          <div className="flex gap-1.5">
            <span className="tag tag-accent">Cited: SEBI circular</span>
            <span className="tag tag-neutral">Factor: concentration</span>
          </div>
        </div>
      </section>

      {/* Module grid */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b-2 border-divider">
        {MODULES.map((item, idx) => {
          const Icon = item.icon;
          const isLast = idx === MODULES.length - 1;
          return (
            <Link
              key={item.title}
              href={item.href}
              className={`p-7 group ${!isLast ? "border-b lg:border-b-0 lg:border-r border-divider" : ""}`}
            >
              <Icon className="w-5 h-5 text-accent mb-3" />
              <h4 className="text-lg mb-1.5 group-hover:text-accent transition-colors">{item.title}</h4>
              <p className="text-sm text-ink/65 leading-relaxed m-0">{item.desc}</p>
            </Link>
          );
        })}
      </section>

      {/* Compliance disclaimer strip */}
      <section className="max-w-7xl mx-auto px-4 py-5 grid grid-cols-1 md:grid-cols-3 gap-8 border-b-2 border-divider text-[11px] leading-relaxed text-ink/55">
        <div>
          <strong className="block mb-1 text-ink text-[10px] tracking-widest uppercase">Not investment advice</strong>
          finX provides informational analysis only. Always consult a registered advisor before making investment
          decisions.
        </div>
        <div>
          <strong className="block mb-1 text-ink text-[10px] tracking-widest uppercase">Data sources</strong>
          Market data from NSE/BSE via approved feeds. Filings from SEBI EDGAR. All data delayed per exchange rules.
        </div>
        <div>
          <strong className="block mb-1 text-ink text-[10px] tracking-widest uppercase">Privacy</strong>
          Portfolio data is encrypted at rest and in transit. finX never shares or sells your financial data.
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-accent text-bg px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl tracking-tight mb-3 text-bg">Stop guessing. Start knowing.</h2>
          <p className="text-base mb-6 max-w-lg opacity-85">
            Join 12,000+ retail investors using AI to understand their money.
          </p>
          <Link
            href="/signup"
            className="btn btn-secondary text-base px-6 py-3"
            style={{ background: "var(--color-bg)", color: "var(--color-accent)", borderColor: "var(--color-bg)" }}
          >
            <span>Create free account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
