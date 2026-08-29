"use client";

import React, { useEffect, useState } from "react";
import { FileText, Download, Printer, ShieldAlert, Sparkles, CheckCircle2, BookOpen } from "lucide-react";
import { ComprehensiveReport } from "@/lib/types";

export default function ReportsPage() {
  const [report, setReport] = useState<ComprehensiveReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        if (data.report) setReport(data.report);
      })
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-hairline-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/15 border border-accent-blue/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent-blue" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Portfolio Intelligence Report</h1>
          </div>
          <p className="text-xs text-muted-strong mt-0.5">
            Structured 12-section financial health & regulatory compliance audit summary.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="bg-surface-card hover:bg-surface-elevated border border-hairline-dark hover:border-primary text-xs font-semibold text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-primary" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {report && (
        <div className="double-bezel p-8 space-y-8 bg-canvas-dark border border-hairline-dark">
          {/* Section 1: Executive Overview */}
          <div className="border-b border-hairline-dark pb-6 space-y-3">
            <div className="flex justify-between text-xs text-muted">
              <span>Report Reference: {report.id}</span>
              <span>Generated: {new Date(report.generatedAt).toLocaleString("en-IN")}</span>
            </div>
            <h2 className="text-xl font-bold text-white">1. Executive Balance Sheet Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-ink rounded-lg border border-hairline-dark">
                <span className="text-[10px] text-muted-strong uppercase tracking-wider block">Net Worth</span>
                <span className="text-xl font-bold font-mono text-primary">
                  ₹{report.portfolioSummary.netWorth.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-4 bg-ink rounded-lg border border-hairline-dark">
                <span className="text-[10px] text-muted-strong uppercase tracking-wider block">Gross Assets</span>
                <span className="text-xl font-bold font-mono text-trading-up">
                  ₹{report.portfolioSummary.totalAssets.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="p-4 bg-ink rounded-lg border border-hairline-dark">
                <span className="text-[10px] text-muted-strong uppercase tracking-wider block">Gross Liabilities</span>
                <span className="text-xl font-bold font-mono text-trading-down">
                  ₹{report.portfolioSummary.totalLiabilities.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Asset Allocation */}
          <div className="border-b border-hairline-dark pb-6 space-y-3">
            <h2 className="text-lg font-bold text-white">2. Asset Class Allocation</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {report.assetAllocation.map((item, idx) => (
                <div key={idx} className="p-3 bg-ink rounded-lg border border-hairline-dark flex justify-between items-center text-xs">
                  <span className="text-muted-strong">{item.type}</span>
                  <span className="font-mono font-bold text-white">
                    {item.pct}% (₹{item.value.toLocaleString("en-IN")})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Risk & Diversification Assessment */}
          <div className="border-b border-hairline-dark pb-6 space-y-3">
            <h2 className="text-lg font-bold text-white">3. Deterministic Risk Evaluation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-ink rounded-lg border border-hairline-dark space-y-1">
                <span className="text-xs text-muted-strong">Financial Risk Indicator</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {report.riskOverview.riskScore}/100 ({report.riskOverview.band})
                </div>
              </div>
              <div className="p-4 bg-ink rounded-lg border border-hairline-dark space-y-1">
                <span className="text-xs text-muted-strong">Diversification Index (HHI)</span>
                <div className="text-2xl font-bold font-mono text-trading-up">
                  {report.riskOverview.diversificationScore}/100
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Holdings Snapshot */}
          <div className="border-b border-hairline-dark pb-6 space-y-3">
            <h2 className="text-lg font-bold text-white">4. Holdings Inventory</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-ink text-muted-strong uppercase text-[10px]">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Type</th>
                    <th className="p-2 text-right">Value (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline-dark">
                  {report.holdingsSnapshot.map((h, i) => (
                    <tr key={i}>
                      <td className="p-2 font-semibold text-white">{h.name}</td>
                      <td className="p-2 text-muted-strong capitalize">{h.type}</td>
                      <td className="p-2 font-mono text-right text-white">₹{h.value.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: AI Insights & Regulatory Disclaimers */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">5. Educational Insights & Citations</h2>
            <div className="p-4 bg-ink rounded-lg border border-hairline-dark space-y-2 text-xs text-body">
              {report.aiInsights.map((insight, i) => (
                <p key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </p>
              ))}
            </div>
            <div className="pt-2 text-[11px] text-muted italic">
              *Disclaimer: This report is generated for financial literacy and decision-support only. Financial Doctor is not a SEBI-registered investment adviser.*
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
