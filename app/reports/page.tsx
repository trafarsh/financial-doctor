"use client";

import React, { useEffect, useState } from "react";
import { Printer, CheckCircle2 } from "lucide-react";
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
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8 md:py-8 w-full max-w-4xl">
      {/* Topbar */}
      <div className="flex items-center gap-4 pb-4 border-b-2 border-divider">
        <div className="kicker">Portfolio report</div>
        <div className="ml-auto flex gap-2">
          <button onClick={handlePrint} className="btn btn-secondary">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            Export PDF →
          </button>
        </div>
      </div>

      {loading && <div className="kicker">Loading report…</div>}

      {report && (
        <div className="bg-neutral-200 border-2 border-divider px-6 py-8 sm:px-8">
          <div className="max-w-[860px] mx-auto bg-bg border-2 border-divider px-4 py-8 sm:px-16 sm:py-14">
            {/* Report header */}
            <div className="kicker-accent mb-3">finX Portfolio report</div>
            <h1 className="text-4xl font-heading font-extrabold tracking-tight text-ink mb-2">
              Financial health summary
            </h1>
            <div className="flex gap-4 py-2.5 border-t-2 border-b-2 border-divider text-[11px] font-heading font-semibold tracking-wide uppercase text-muted mb-7">
              <span>Report Reference: {report.id}</span>
              <span>{new Date(report.generatedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
              <span>Auto-generated</span>
            </div>

            {/* Section 1: Balance sheet */}
            <h2 className="text-xl font-heading font-bold text-ink mb-3">1. Balance sheet summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 border-2 border-ink mb-6">
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-divider">
                <div className="text-[10px] tracking-wider uppercase text-muted font-semibold mb-1.5">Total assets</div>
                <div className="font-heading font-extrabold text-xl">₹{report.portfolioSummary.totalAssets.toLocaleString("en-IN")}</div>
              </div>
              <div className="p-4 border-b sm:border-b-0 sm:border-r border-divider">
                <div className="text-[10px] tracking-wider uppercase text-muted font-semibold mb-1.5">Total liabilities</div>
                <div className="font-heading font-extrabold text-xl">₹{report.portfolioSummary.totalLiabilities.toLocaleString("en-IN")}</div>
              </div>
              <div className="p-4">
                <div className="text-[10px] tracking-wider uppercase text-muted font-semibold mb-1.5">Net worth</div>
                <div className="font-heading font-extrabold text-xl">₹{report.portfolioSummary.netWorth.toLocaleString("en-IN")}</div>
              </div>
            </div>

            {/* Section: Asset allocation */}
            <h2 className="text-xl font-heading font-bold text-ink mb-3">2. Asset class allocation</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {report.assetAllocation.map((item, idx) => (
                <div key={idx} className="p-3 border border-divider flex justify-between items-center text-xs">
                  <span className="text-muted">{item.type}</span>
                  <span className="font-heading font-bold text-ink">
                    {item.pct}% (₹{item.value.toLocaleString("en-IN")})
                  </span>
                </div>
              ))}
            </div>

            {/* Section 2: Risk & diversification */}
            <h2 className="text-xl font-heading font-bold text-ink mb-3">3. Risk &amp; diversification</h2>
            <p className="text-sm leading-relaxed mb-3">
              Your portfolio risk score is <strong>{report.riskOverview.riskScore}/100</strong> ({report.riskOverview.band}).
              Diversification score: <strong>{report.riskOverview.diversificationScore}/100</strong>.
            </p>
            <div className="border-l-[3px] border-accent bg-accent-100 px-4 py-2 my-4">
              <div className="kicker-accent mb-1">AI insight</div>
              {report.aiInsights.length > 0 ? (
                <div className="space-y-1.5">
                  {report.aiInsights.map((insight, i) => (
                    <p key={i} className="text-[13px] leading-relaxed flex items-start gap-2 m-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] leading-relaxed m-0">No AI insights available for this report.</p>
              )}
            </div>

            {/* Section 3: Holdings inventory */}
            <h2 className="text-xl font-heading font-bold text-ink mt-6 mb-3">4. Holdings inventory</h2>
            <div className="overflow-x-auto mb-6">
              <table className="table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th style={{ textAlign: "right" }}>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {report.holdingsSnapshot.map((h, i) => (
                    <tr key={i}>
                      <td className="font-semibold text-ink">{h.name}</td>
                      <td className="text-muted capitalize">
                        {h.type === "mutual_fund" ? "HFUND" : h.type.replace("_", " ")}
                      </td>
                      <td className="text-right font-heading">₹{h.value.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Disclaimer */}
            <div className="border-t-2 border-divider pt-4 text-[11px] text-muted leading-relaxed">
              <strong className="block mb-1 text-[10px] tracking-wider uppercase text-muted">Disclaimer</strong>
              This report is auto-generated by α-finX for informational purposes only. It does not constitute
              investment advice. AI-generated insights are based on publicly available data and user-provided
              portfolio information. Always consult a SEBI-registered advisor before making investment decisions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
