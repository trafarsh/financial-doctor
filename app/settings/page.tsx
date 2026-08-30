"use client";

import React, { useState } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { APP_CONFIG } from "@/lib/config";

export default function SettingsPage() {
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemo = async () => {
    try {
      await fetch("/api/portfolio/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assets: [
            { type: "bank", name: "HDFC Savings Account", value: 200000 },
            { type: "stock", name: "Reliance Industries", value: 600000, quantity: 200, sector: "Energy" },
            { type: "gold", name: "Sovereign Gold Bonds", value: 200000 },
          ],
          liabilities: [
            { type: "loan", name: "Car Loan (HDFC)", amount: 500000, interestRate: 8.75 },
          ],
        }),
      });
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8 md:py-8 w-full max-w-6xl">
      <div className="pb-4 border-b-2 border-divider mb-8">
        <div className="kicker">Settings</div>
        <h1 className="text-2xl font-heading font-extrabold text-ink mt-1">Application settings</h1>
        <p className="text-xs text-muted mt-1">
          Platform preferences, compliance disclaimers, and demo state management.
        </p>
      </div>

      {/* Demo Controls */}
      <div className="border-2 border-divider p-6 mb-6">
        <h3 className="text-sm font-heading font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-3">
          <RefreshCw className="w-4 h-4 text-accent" />
          <span>Demo data management</span>
        </h3>
        <p className="text-xs text-muted leading-relaxed mb-4">
          Reset all local holdings, historical snapshots, and risk scores to the standard Indian benchmark test
          portfolio (Total Assets: ₹10,00,000 | Liabilities: ₹5,00,000 | Net Worth: ₹5,00,000).
        </p>
        <button onClick={handleResetDemo} className="btn btn-secondary">
          <span>{resetSuccess ? "Demo data reset completed!" : "Reset to benchmark Indian portfolio"}</span>
        </button>
      </div>

      {/* Regulatory Disclaimers */}
      <div className="border-2 border-divider p-6">
        <h3 className="text-sm font-heading font-bold text-ink uppercase tracking-wider flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-up" />
          <span>Regulatory compliance posture</span>
        </h3>
        <div className="p-4 border border-divider text-xs text-muted leading-relaxed space-y-2">
          <p>
            <strong className="text-ink font-semibold">Statutory posture:</strong> {APP_CONFIG.disclaimer.persistent}
          </p>
          <p>
            <strong className="text-ink font-semibold">Grounding requirement:</strong> Every market evaluation is
            grounded in official SEBI/RBI regulations. Claims without verifiable sources are strictly marked as
            Unverifiable.
          </p>
        </div>
      </div>
    </div>
  );
}
