"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ArrowUpRight,
  Sparkles,
  PieChart,
  PlusCircle,
  Cpu,
  RefreshCw,
  Info,
  Sliders,
  ShieldCheck,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ScoreGauge } from "@/components/ui/ScoreGauge";
import { AnomalyChip } from "@/components/ui/AnomalyChip";
import { Asset, Liability, NetWorthSnapshot, RiskAnalysis, MarketIndex } from "@/lib/types";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [netWorth, setNetWorth] = useState<{ totalAssets: number; totalLiabilities: number; netWorth: number }>({
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0,
  });
  const [snapshots, setSnapshots] = useState<NetWorthSnapshot[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [showBasisModal, setShowBasisModal] = useState(false);
  const [activeCategoryDetail, setActiveCategoryDetail] = useState<"liquid" | "fixed" | null>(null);

  const liquidAssets = assets.filter(
    (a) => a.type === "bank" || a.type === "stock" || a.type === "etf" || a.type === "mutual_fund" || a.type === "gold"
  );
  const fixedAssets = assets.filter(
    (a) => a.type === "real_estate" || a.type === "other"
  );
  const liquidValue = liquidAssets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const fixedValue = fixedAssets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [holdingsRes, historyRes, riskRes, marketRes] = await Promise.all([
        fetch("/api/portfolio").then((r) => r.json()),
        fetch("/api/portfolio/networth-history").then((r) => r.json()),
        fetch("/api/risk/analyze").then((r) => r.json()),
        fetch("/api/market/overview").then((r) => r.json()),
      ]);

      if (holdingsRes.assets) {
        setAssets(holdingsRes.assets);
        setLiabilities(holdingsRes.liabilities);
        setNetWorth(holdingsRes.netWorthSummary);
      }
      if (historyRes.snapshots) {
        setSnapshots(historyRes.snapshots);
      }
      if (riskRes.analysis) {
        setRiskAnalysis(riskRes.analysis);
      }
      if (marketRes.indices) {
        setIndices(marketRes.indices);
      }
    } catch (err) {
      console.warn("[Dashboard] Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Format chart data
  const chartData = snapshots.map((s, idx) => ({
    name: new Date(s.computedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    netWorth: s.netWorth,
    totalAssets: s.totalAssets,
    totalLiabilities: s.totalLiabilities,
  }));

  return (
    <div className="flex flex-col gap-6 px-8 py-8 w-full">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-divider pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-heading font-800 text-ink">Financial Health Dashboard</h1>
            <span className="text-[10px] font-heading font-800 bg-ink text-bg px-2 py-0.5 tracking-wider">
              LIVE DATA
            </span>
          </div>
          <p className="text-xs text-ink/60 mt-0.5">
            Holistic net worth, deterministic risk evaluation, and AI-grounded educational intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="btn btn-secondary btn-icon"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-accent" : ""}`} />
          </button>
          <Link href="/import" className="btn btn-primary">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Update Holdings</span>
          </Link>
        </div>
      </div>

      {/* Empty State: No holdings tracked yet */}
      {!loading && assets.length === 0 && liabilities.length === 0 && (
        <div className="bg-surface border-2 border-divider p-8 text-center space-y-3">
          <PieChart className="w-8 h-8 text-ink/45 mx-auto" />
          <h3 className="text-sm font-heading font-800 text-ink">No holdings tracked yet</h3>
          <p className="text-xs text-ink/60 max-w-md mx-auto">
            Import your portfolio via CSV/Excel or add holdings manually to see your net worth, risk score, and diversification analysis.
          </p>
          <Link href="/import" className="btn btn-primary inline-flex">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Import Portfolio</span>
          </Link>
        </div>
      )}

      {/* 1. Net Worth & Balance Sheet KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-5 border-t-2 border-b-2 border-divider">
        <div className="p-5 border-b sm:border-b-0 sm:border-r border-divider">
          <div className="kicker mb-2 flex items-center justify-between">
            <span>Total Net Worth</span>
            <span className="text-accent font-heading font-800">₹ INR</span>
          </div>
          <div className="font-heading font-800 text-3xl tracking-tight text-ink leading-none">
            ₹{netWorth.netWorth.toLocaleString("en-IN")}
          </div>
          <div className="text-xs mt-2 flex items-center gap-2 flex-wrap">
            <span className="text-up font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Assets: ₹{netWorth.totalAssets.toLocaleString("en-IN")}
            </span>
            <span className="text-ink/40">·</span>
            <span className="text-accent font-semibold flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> Debt: ₹{netWorth.totalLiabilities.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div 
          onClick={() => setActiveCategoryDetail("liquid")}
          className="p-5 border-b sm:border-b-0 sm:border-r border-divider cursor-pointer hover:bg-neutral-200 transition-colors"
        >
          <div className="kicker mb-2 flex items-center justify-between">
            <span>Liquid Assets</span>
            <span className="tag tag-neutral">{liquidAssets.length} Holdings</span>
          </div>
          <div className="font-heading font-800 text-2xl tracking-tight text-up leading-none">
            ₹{liquidValue.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-ink/55 mt-2">
            Equity, HFUNDs, bank deposits, gold. Click for list.
          </p>
        </div>

        <div 
          onClick={() => setActiveCategoryDetail("fixed")}
          className="p-5 border-b sm:border-b-0 sm:border-r border-divider cursor-pointer hover:bg-neutral-200 transition-colors"
        >
          <div className="kicker mb-2 flex items-center justify-between">
            <span>Fixed Assets</span>
            <span className="tag tag-neutral">{fixedAssets.length} Holdings</span>
          </div>
          <div className="font-heading font-800 text-2xl tracking-tight text-ink leading-none">
            ₹{fixedValue.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-ink/55 mt-2">
            Real estate, property, land. Click for list.
          </p>
        </div>

        <div className="p-5 border-b sm:border-b-0 sm:border-r border-divider">
          <div className="kicker mb-2 flex items-center justify-between">
            <span>Total Liabilities / Debt</span>
            <span className="tag tag-accent">{liabilities.length} Debts</span>
          </div>
          <div className="font-heading font-800 text-2xl tracking-tight text-accent leading-none">
            ₹{netWorth.totalLiabilities.toLocaleString("en-IN")}
          </div>
          <p className="text-xs text-ink/55 mt-2">
            Debt ratio: {((netWorth.totalLiabilities / (netWorth.totalAssets || 1)) * 100).toFixed(1)}% of assets.
          </p>
        </div>

        <div className="p-5">
          <div className="kicker mb-2">Risk Score</div>
          <div className="font-heading font-800 text-2xl tracking-tight text-ink leading-none">
            {riskAnalysis?.riskScore ?? 0}
            <span className="text-base opacity-45"> / 100</span>
          </div>
          <div className="h-1.5 bg-neutral-300 mt-3 relative">
            <div
              className="absolute inset-y-0 left-0 bg-accent"
              style={{ width: `${Math.min(100, Math.max(0, riskAnalysis?.riskScore ?? 0))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Gauges & Trend Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk & Diversification Score Gauges */}
        <div className="space-y-4">
          <ScoreGauge
            score={riskAnalysis?.riskScore ?? 0}
            title="Financial Risk Indicator"
            subtitle="40% Concentration + 40% Debt + 20% Liquidity (Deterministic)"
            type="risk"
          />
          <ScoreGauge
            score={riskAnalysis?.diversificationScore ?? 0}
            title="Diversification Index (HHI)"
            subtitle="Herfindahl-Hirschman spread across 6 canonical asset types"
            type="diversification"
          />
        </div>

        {/* Historical Net Worth Trend Line Chart */}
        <div className="bg-surface lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
            <div>
              <h3 className="text-base font-heading font-800 text-ink">Net Worth Progression Time-Series</h3>
              <p className="text-xs text-ink/55">Append-only audit snapshots recorded on each portfolio import</p>
            </div>
            <span className="text-[11px] font-heading font-600 text-ink/55 bg-bg px-2 py-1 border border-divider">
              {snapshots.length} Historical Snapshots
            </span>
          </div>

          <div className="w-full h-64 p-5">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d7d3d3" />
                  <XAxis dataKey="name" stroke="#7d7979" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#7d7979" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#eae9e9", borderColor: "#201e1d", borderRadius: "0px", fontSize: "12px" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                  />
                  <Line type="monotone" dataKey="netWorth" name="Net Worth" stroke="#ec3013" strokeWidth={3} dot={{ fill: "#ec3013", r: 4 }} />
                  <Line type="monotone" dataKey="totalLiabilities" name="Liabilities" stroke="#201e1d" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink/45">
                Import holdings to view historical net-worth trend curve.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. AI Plain-Language Explanation & Anomaly Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Educational Analysis Card */}
        <div className="bg-accent-100 border-l-[3px] border-accent lg:col-span-2 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="kicker-accent">AI risk summary</span>
            </div>
            <button
              onClick={() => setShowBasisModal(true)}
              className="btn btn-ghost text-xs"
            >
              <Info className="w-3.5 h-3.5" />
              <span>How this is computed</span>
            </button>
          </div>

          <p className="text-sm text-ink leading-relaxed">
            {riskAnalysis?.explanation ||
              (assets.length === 0 && liabilities.length === 0
                ? "Import your portfolio to generate a personalized risk and diversification analysis."
                : "Analyzing your holdings...")}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="kicker">Quick Actions:</span>
            <Link href="/copilot" className="btn btn-secondary text-xs">
              <Cpu className="w-3.5 h-3.5 text-accent" />
              <span>Ask Copilot about this</span>
            </Link>
            <Link href="/simulator" className="btn btn-secondary text-xs">
              <Sliders className="w-3.5 h-3.5 text-up" />
              <span>Run Stress Simulator</span>
            </Link>
            <Link href="/scam-detector" className="btn btn-secondary text-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-accent" />
              <span>Check Tip / Claim</span>
            </Link>
          </div>
        </div>

        {/* Right: Anomaly & Risk Flags */}
        <div className="bg-surface">
          <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
            <h3 className="text-base font-heading font-800 text-ink flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-accent" />
              <span>Anomaly flags</span>
            </h3>
            <span className="tag tag-accent">{riskAnalysis?.flags.length || 0} new</span>
          </div>

          <div className="p-5 space-y-2">
            {riskAnalysis?.flags && riskAnalysis.flags.length > 0 ? (
              riskAnalysis.flags.map((flag, idx) => <AnomalyChip key={idx} flag={flag} />)
            ) : (
              <div className="p-4 border border-divider text-xs text-ink/45 text-center">
                No acute anomaly flags triggered.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Market Benchmark Snapshot */}
      <div className="bg-surface">
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
          <h3 className="text-base font-heading font-800 text-ink flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-up" />
            <span>Market Context &amp; Benchmark Indices</span>
          </h3>
          <Link href="/markets/overview" className="text-xs text-accent hover:underline flex items-center gap-1 font-heading font-600">
            <span>Full Market Overview</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 p-5 sm:gap-4">
          {indices.map((idx) => (
            <div key={idx.symbol} className="p-3 border border-divider space-y-1">
              <span className="text-xs font-semibold text-ink/55 block truncate">{idx.name}</span>
              <div className="text-sm font-heading font-800 text-ink">
                {idx.value.toLocaleString("en-IN")}
              </div>
              <span
                className={`text-xs font-heading font-700 flex items-center ${
                  idx.changePct >= 0 ? "text-up" : "text-accent"
                }`}
              >
                {idx.changePct >= 0 ? "+" : ""}
                {idx.changePct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Basis / Computation Modal */}
      {showBasisModal && (
        <div className="dialog-backdrop">
          <div className="dialog max-w-lg w-full">
            <div className="flex items-center justify-between border-b-2 border-divider pb-3">
              <h3 className="dialog-title text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-accent" />
                <span>Deterministic Math &amp; Scoring Basis</span>
              </h3>
              <button
                onClick={() => setShowBasisModal(false)}
                className="btn btn-secondary text-xs"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-ink/70 leading-relaxed">
              <p>
                <strong className="text-ink">Risk Score (0–100):</strong> Computed as a weighted sum in pure TypeScript:
                <br />
                <code className="text-accent block bg-bg p-2 border border-divider mt-1 font-mono">
                  Risk = 0.40 × Concentration(HHI) + 0.40 × DebtRatio + 0.20 × LiquidityRisk
                </code>
              </p>
              <p>
                <strong className="text-ink">Diversification Score (0–100):</strong> Uses the Herfindahl-Hirschman Index across 6 canonical asset categories:
                <br />
                <code className="text-accent block bg-bg p-2 border border-divider mt-1 font-mono">
                  Score = round( (1 - HHI) / (1 - 1/6) × 100 )
                </code>
              </p>
              <p className="text-[11px] text-ink/50">
                The AI model never computes these numbers — it receives the verified TypeScript output and translates it into educational, plain-language guidance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Liquid / Fixed Asset Category Details Modal */}
      {activeCategoryDetail && (
        <div className="dialog-backdrop" onClick={() => setActiveCategoryDetail(null)}>
          <div className="dialog max-w-xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b-2 border-divider pb-3">
              <h3 className="dialog-title text-base capitalize flex items-center gap-2">
                <PieChart className="w-4.5 h-4.5 text-accent" />
                <span>{activeCategoryDetail} Assets List</span>
              </h3>
              <button
                onClick={() => setActiveCategoryDetail(null)}
                className="btn btn-secondary text-xs"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto my-4 max-h-96 overflow-y-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Asset Name</th>
                    <th>Type</th>
                    <th className="text-right">Value (₹)</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeCategoryDetail === "liquid" ? liquidAssets : fixedAssets).map((asset) => (
                    <tr key={asset.id}>
                      <td className="font-semibold text-ink">{asset.name}</td>
                      <td className="text-ink/60 capitalize text-xs">
                        {asset.type === "mutual_fund" ? "HFUND" : asset.type.replace("_", " ")}
                      </td>
                      <td className="text-right font-heading font-600 text-ink">
                        ₹{asset.value.toLocaleString("en-IN")}
                      </td>
                      <td className="text-right">
                        <Link
                          href={`/simulator?holdingId=${asset.id}`}
                          className="btn btn-secondary text-[10px] px-2 py-1 inline-flex"
                        >
                          Simulate
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {((activeCategoryDetail === "liquid" ? liquidAssets : fixedAssets).length === 0) && (
                    <tr>
                      <td colSpan={4} className="text-center text-ink/45 py-6">
                        No assets found in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t-2 border-divider pt-3 flex justify-between items-center text-xs">
              <span className="font-semibold text-ink">Total {activeCategoryDetail} Assets:</span>
              <span className="font-heading font-800 text-ink text-sm">
                ₹{(activeCategoryDetail === "liquid" ? liquidValue : fixedValue).toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
