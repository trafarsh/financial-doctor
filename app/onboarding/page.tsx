"use client";

import React from "react";
import Link from "next/link";
import { UploadCloud, Sparkles, Database, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8 text-center">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-card border border-hairline-dark text-xs font-semibold text-primary">
          <span>Step 1: Choose Your Starting Point</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">How would you like to begin?</h1>
        <p className="text-sm text-muted-strong max-w-lg mx-auto">
          Whether you have an existing portfolio spreadsheet or want to estimate your finances from scratch, Financial Doctor will guide you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left pt-4">
        {/* Choice 1: Guided Wizard */}
        <Link
          href="/networth"
          className="double-bezel p-6 hover:border-primary transition-all group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
              Start from Zero (Guided Wizard)
            </h3>
            <p className="text-xs text-muted-strong leading-relaxed">
              Answer 6 plain-language questions (savings, stocks, gold, property, loans). Rough estimates are welcome.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <span>Launch 3-Minute Wizard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Choice 2: File / Manual Importer */}
        <Link
          href="/import"
          className="double-bezel p-6 hover:border-primary transition-all group flex flex-col justify-between space-y-6"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-trading-up/15 border border-trading-up/30 flex items-center justify-center group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6 text-trading-up" />
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
              Import Existing File (CSV / Excel)
            </h3>
            <p className="text-xs text-muted-strong leading-relaxed">
              Upload a .csv or .xlsx file, or enter asset and liability line items manually with instant net worth tally.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-trading-up">
            <span>Open Importer</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Choice 3: Quick Demo */}
      <div className="p-4 rounded-lg bg-ink border border-hairline-dark flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <Database className="w-5 h-5 text-muted" />
          <div>
            <h4 className="text-xs font-bold text-white">Just exploring?</h4>
            <p className="text-[11px] text-muted">Load pre-configured Indian market demo data immediately.</p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="bg-surface-elevated hover:bg-[#3B424C] text-xs font-semibold text-white px-4 py-2 rounded-md transition-colors shrink-0"
        >
          View Demo Dashboard
        </Link>
      </div>
    </div>
  );
}
