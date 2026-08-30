"use client";

import React from "react";
import Link from "next/link";
import { UploadCloud, Sparkles, Database, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="kicker-accent mb-3">Step 1: Choose your starting point</div>
        <h1 className="text-3xl sm:text-4xl mb-3">How would you like to begin?</h1>
        <p className="text-sm text-ink/65 max-w-lg mx-auto">
          Whether you have an existing portfolio spreadsheet or want to estimate your finances from scratch, finX
          will guide you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 border-2 border-divider mb-6">
        {/* Choice 1: Guided Wizard */}
        <Link
          href="/networth"
          className="group flex flex-col justify-between gap-6 p-6 border-b md:border-b-0 md:border-r border-divider hover:bg-surface transition-colors"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-accent-100 border border-accent-300 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-lg group-hover:text-accent transition-colors">Start from zero (guided wizard)</h3>
            <p className="text-xs text-ink/65 leading-relaxed">
              Answer 6 plain-language questions (savings, stocks, gold, property, loans). Rough estimates are
              welcome.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-accent">
            <span>Launch 3-minute wizard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Choice 2: File / Manual Importer */}
        <Link
          href="/import"
          className="group flex flex-col justify-between gap-6 p-6 hover:bg-surface transition-colors"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 bg-surface border border-divider flex items-center justify-center">
              <UploadCloud className="w-6 h-6 text-up" />
            </div>
            <h3 className="text-lg group-hover:text-accent transition-colors">Import existing file (CSV / Excel)</h3>
            <p className="text-xs text-ink/65 leading-relaxed">
              Upload a .csv or .xlsx file, or enter asset and liability line items manually with instant net worth
              tally.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-up">
            <span>Open importer</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Choice 3: Quick Demo */}
      <div className="p-5 bg-surface border-2 border-divider flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <Database className="w-5 h-5 text-ink/55" />
          <div>
            <h4 className="text-xs font-semibold">Just exploring?</h4>
            <p className="text-[11px] text-ink/55">Load pre-configured Indian market demo data immediately.</p>
          </div>
        </div>
        <Link href="/dashboard" className="btn btn-secondary shrink-0">
          View demo dashboard
        </Link>
      </div>
    </div>
  );
}
