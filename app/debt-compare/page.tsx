"use client";

import React, { useState } from "react";
import { Scale, RefreshCw, TrendingDown, Sprout } from "lucide-react";
import { DebtComparisonResult, InformalRepaymentUnit } from "@/lib/types";
import { postWithOfflineFallback } from "@/lib/offlineQueue";

const UNIT_LABELS: Record<InformalRepaymentUnit, string> = {
  per_month: "extra ₹ per month",
  per_week: "extra ₹ per week",
  lump_sum: "total extra ₹ for the whole term",
};

export default function DebtComparePage() {
  const [principal, setPrincipal] = useState(50000);
  const [informalCharge, setInformalCharge] = useState(500);
  const [chargeUnit, setChargeUnit] = useState<InformalRepaymentUnit>("per_month");
  const [termMonths, setTermMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebtComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queuedOffline, setQueuedOffline] = useState(false);

  const runComparison = async () => {
    setLoading(true);
    setError(null);
    setQueuedOffline(false);
    try {
      const res = await postWithOfflineFallback("/api/debt/compare", {
        principal,
        informalCharge,
        chargeUnit,
        termMonths,
      });
      if (res.offline) {
        setQueuedOffline(true);
      } else if (res.data?.result) {
        setResult(res.data.result);
      } else {
        setError(res.data?.error || "Comparison failed");
      }
    } catch (err) {
      setError("Could not reach the comparison service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-8 py-8 w-full">
      <div className="border-b-2 border-divider pb-4">
        <h1 className="text-3xl font-heading font-800 text-ink m-0 flex items-center gap-2.5">
          <Sprout className="w-7 h-7 text-accent" />
          Debt Comparison Tool
        </h1>
        <p className="text-xs text-ink/60 mt-1 max-w-2xl">
          Compare the true yearly cost of an informal loan against typical formal lending options
          (Kisan Credit Card, cooperative bank, SHG group lending) for the same amount and term.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-2 border-ink bg-surface/40">
        <div className="p-4.5 border-r-0 lg:border-r border-b lg:border-b-0 border-divider">
          <div className="kicker mb-2">Loan amount</div>
          <div className="font-heading font-800 text-2xl mb-2.5">₹{principal.toLocaleString("en-IN")}</div>
          <input
            type="range"
            min="1000"
            max="500000"
            step="1000"
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-ink/45 mt-1">
            <span>₹1K</span>
            <span>₹5L</span>
          </div>
        </div>

        <div className="p-4.5 border-r-0 lg:border-r border-b lg:border-b-0 border-divider">
          <div className="kicker mb-2">Informal charge</div>
          <div className="font-heading font-800 text-2xl mb-2.5">₹{informalCharge.toLocaleString("en-IN")}</div>
          <input
            type="range"
            min="0"
            max="10000"
            step="50"
            value={informalCharge}
            onChange={(e) => setInformalCharge(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
          <select
            value={chargeUnit}
            onChange={(e) => setChargeUnit(e.target.value as InformalRepaymentUnit)}
            className="input text-xs mt-2 font-semibold"
          >
            {Object.entries(UNIT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4.5 border-r-0 lg:border-r border-b lg:border-b-0 border-divider">
          <div className="kicker mb-2">Repayment term</div>
          <div className="font-heading font-800 text-2xl mb-2.5">
            {termMonths}
            <span className="text-sm opacity-50"> months</span>
          </div>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={termMonths}
            onChange={(e) => setTermMonths(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-ink/45 mt-1">
            <span>1mo</span>
            <span>60mo</span>
          </div>
        </div>

        <div className="p-4.5 flex flex-col justify-center">
          <button onClick={runComparison} disabled={loading} className="btn btn-primary w-full justify-center">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Comparing..." : "Compare cost"}
          </button>
          <span className="text-[10px] text-ink/45 mt-2 leading-normal">
            Example: a lender who takes ₹500 extra per ₹5,000 borrowed each month.
          </span>
        </div>
      </div>

      {error && (
        <div className="border-l-[3px] border-accent px-5 py-4 bg-accent-100 text-sm text-accent">{error}</div>
      )}

      {queuedOffline && (
        <div className="border-l-[3px] border-accent px-5 py-4 bg-accent-100 text-sm text-ink">
          You're offline — this comparison is saved on your device and will run automatically once you're back online.
        </div>
      )}

      {result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 border-2 border-ink">
            <div className="p-5 border-r-0 sm:border-r border-b sm:border-b-0 border-divider bg-accent text-bg">
              <div className="text-[10px] tracking-[0.14em] uppercase font-600 mb-1.5 opacity-80 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Effective annual rate
              </div>
              <div className="font-heading font-800 text-[34px] tracking-tight">
                {result.effectiveAnnualRatePct}%
              </div>
              <div className="text-xs opacity-80 mt-1">
                Total cost: ₹{result.totalInformalCost.toLocaleString("en-IN")} over {termMonths} months
              </div>
            </div>
            <div className="p-5 bg-surface">
              <div className="kicker mb-1.5">Cheapest formal option</div>
              {(() => {
                const cheapest = result.benchmarks.reduce(
                  (best, b) => (b.savingsVsInformal > best.savingsVsInformal ? b : best),
                  result.benchmarks[0]
                );
                return cheapest ? (
                  <>
                    <div className="font-heading font-800 text-xl">{cheapest.name}</div>
                    <div className="text-xs text-ink/60 mt-1">{cheapest.annualRatePct}% per year</div>
                    <div className={`text-sm font-700 mt-2 flex items-center gap-1 ${cheapest.savingsVsInformal >= 0 ? "text-up" : "text-accent"}`}>
                      <TrendingDown className="w-4 h-4" />
                      {cheapest.savingsVsInformal >= 0 ? "Could save" : "Costs more by"} ₹
                      {Math.abs(cheapest.savingsVsInformal).toLocaleString("en-IN")}
                    </div>
                  </>
                ) : (
                  <span className="text-xs text-ink/50">No benchmark available.</span>
                );
              })()}
            </div>
          </div>

          <div className="bg-surface border border-divider">
            <div className="px-4.5 py-3.5 border-b-2 border-divider bg-neutral-200">
              <h3 className="m-0 text-base">Formal lending benchmarks compared</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table text-xs">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th className="text-right">Annual rate</th>
                    <th className="text-right">Total cost (same term)</th>
                    <th className="text-right">Vs. informal</th>
                  </tr>
                </thead>
                <tbody>
                  {result.benchmarks.map((b) => (
                    <tr key={b.name}>
                      <td>
                        {b.name}
                        <div className="text-[10px] text-ink/45">{b.sourceNote}</div>
                      </td>
                      <td className="text-right">{b.annualRatePct}%</td>
                      <td className="text-right font-heading font-700">₹{b.totalFormalCost.toLocaleString("en-IN")}</td>
                      <td className={`text-right font-heading font-800 ${b.savingsVsInformal >= 0 ? "text-up" : "text-accent"}`}>
                        {b.savingsVsInformal >= 0 ? "-" : "+"}₹{Math.abs(b.savingsVsInformal).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-l-[3px] border-accent px-5 py-4 bg-accent-100">
            <div className="kicker-accent mb-1.5">Illustrative commentary</div>
            <p className="text-[13.5px] leading-relaxed m-0 whitespace-pre-line">{result.explanation}</p>
          </div>
        </>
      )}
    </div>
  );
}
