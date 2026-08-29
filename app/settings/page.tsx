"use client";

import React, { useState } from "react";
import { Settings, Shield, User, RefreshCw, LogOut, Trash2 } from "lucide-react";
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="border-b border-hairline-dark pb-4">
        <h1 className="text-2xl font-extrabold text-white">Application Settings</h1>
        <p className="text-xs text-muted-strong mt-0.5">
          Platform preferences, compliance disclaimers, and demo state management.
        </p>
      </div>

      {/* Demo Controls */}
      <div className="double-bezel p-6 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary" />
          <span>Demo Data Management</span>
        </h3>
        <p className="text-xs text-muted-strong leading-relaxed">
          Reset all local holdings, historical snapshots, and risk scores to the standard Indian benchmark test portfolio (Total Assets: ₹10,00,000 | Liabilities: ₹5,00,000 | Net Worth: ₹5,00,000).
        </p>
        <button
          onClick={handleResetDemo}
          className="bg-surface-card hover:bg-surface-elevated border border-hairline-dark hover:border-primary text-xs font-semibold text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>{resetSuccess ? "Demo Data Reset Completed!" : "Reset to Benchmark Indian Portfolio"}</span>
        </button>
      </div>

      {/* Regulatory Disclaimers */}
      <div className="double-bezel p-6 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-trading-up" />
          <span>Regulatory Compliance Posture</span>
        </h3>
        <div className="p-4 bg-ink rounded-lg border border-hairline-dark text-xs text-muted-strong leading-relaxed space-y-2">
          <p>
            <strong className="text-white font-semibold">Statutory Posture:</strong> {APP_CONFIG.disclaimer.persistent}
          </p>
          <p>
            <strong className="text-white font-semibold">Grounding Requirement:</strong> Every market evaluation is grounded in official SEBI/RBI regulations. Claims without verifiable sources are strictly marked as Unverifiable.
          </p>
        </div>
      </div>
    </div>
  );
}
