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
    <div className="space-y-6 pb-12">
      {/* Header & Quick Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline-dark pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">Financial Health Dashboard</h1>
            <span className="text-[10px] font-mono font-bold bg-surface-card border border-hairline-dark text-primary px-2 py-0.5 rounded">
              LIVE DATA
            </span>
          </div>
          <p className="text-xs text-muted-strong mt-0.5">
            Holistic net worth, deterministic risk evaluation, and AI-grounded educational intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboardData}
            className="p-2 bg-surface-card hover:bg-surface-elevated border border-hairline-dark text-muted-strong hover:text-white rounded-lg transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
          <Link
            href="/import"
            className="bg-primary hover:bg-primary-active text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Update Holdings</span>
          </Link>
        </div>
      </div>

      {/* Empty State: No holdings tracked yet */}
      {!loading && assets.length === 0 && liabilities.length === 0 && (
        <div className="double-bezel p-8 text-center space-y-3">
          <PieChart className="w-8 h-8 text-muted mx-auto" />
          <h3 className="text-sm font-bold text-white">No holdings tracked yet</h3>
          <p className="text-xs text-muted-strong max-w-md mx-auto">
            Import your portfolio via CSV/Excel or add holdings manually to see your net worth, risk score, and diversification analysis.
          </p>
          <Link
            href="/import"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-active text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Import Portfolio</span>
          </Link>
        </div>
      )}

      {/* 1. Net Worth & Balance Sheet Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Worth Primary Headline Card */}
        <div className="double-bezel p-5 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-strong uppercase tracking-wider">
            <span>Total Net Worth</span>
            <span className="text-primary font-mono text-[11px]">₹ INR</span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white tracking-tight pt-1">
            ₹{netWorth.netWorth.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-muted flex items-center gap-1.5 pt-1">
            <span className="text-trading-up font-semibold flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" /> Assets: ₹{netWorth.totalAssets.toLocaleString("en-IN")}
            </span>
            <span>·</span>
            <span className="text-trading-down font-semibold flex items-center">
              <TrendingDown className="w-3 h-3 mr-0.5" /> Debt: ₹{netWorth.totalLiabilities.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Total Assets Card */}
        <div className="double-bezel p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-strong uppercase tracking-wider">
            <span>Total Assets Tracked</span>
            <span className="text-[10px] bg-trading-up/15 text-trading-up px-1.5 py-0.2 rounded font-bold">
              {assets.length} Holdings
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-trading-up tracking-tight pt-1">
            ₹{netWorth.totalAssets.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-muted pt-1">
            Equity, mutual funds, liquid bank deposits, gold, and real estate.
          </p>
        </div>

        {/* Total Liabilities Card */}
        <div className="double-bezel p-5 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-strong uppercase tracking-wider">
            <span>Total Liabilities / Debt</span>
            <span className="text-[10px] bg-trading-down/15 text-trading-down px-1.5 py-0.2 rounded font-bold">
              {liabilities.length} Debts
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-trading-down tracking-tight pt-1">
            ₹{netWorth.totalLiabilities.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-muted pt-1">
            Debt ratio: {((netWorth.totalLiabilities / (netWorth.totalAssets || 1)) * 100).toFixed(1)}% of assets.
          </p>
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
        <div className="double-bezel p-5 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Net Worth Progression Time-Series</span>
              </h3>
              <p className="text-xs text-muted">Append-only audit snapshots recorded on each portfolio import</p>
            </div>
            <span className="text-[10px] font-mono text-muted-strong bg-ink px-2 py-1 rounded border border-hairline-dark">
              {snapshots.length} Historical Snapshots
            </span>
          </div>

          <div className="w-full h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
                  <XAxis dataKey="name" stroke="#707A8A" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#707A8A" tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1E2329", borderColor: "#2B3139", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                  />
                  <Line type="monotone" dataKey="netWorth" name="Net Worth" stroke="#FCD535" strokeWidth={3} dot={{ fill: "#FCD535", r: 4 }} />
                  <Line type="monotone" dataKey="totalAssets" name="Assets" stroke="#0ECB81" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line type="monotone" dataKey="totalLiabilities" name="Liabilities" stroke="#F6465D" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted">
                Import holdings to view historical net-worth trend curve.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. AI Plain-Language Explanation & Anomaly Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: AI Educational Analysis Card */}
        <div className="double-bezel p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline-dark pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-bold text-white">AI Educational Literacy Interpretation</h3>
            </div>
            <button
              onClick={() => setShowBasisModal(true)}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <Info className="w-3.5 h-3.5" />
              <span>How this is computed</span>
            </button>
          </div>

          <p className="text-xs text-body leading-relaxed bg-ink p-4 rounded-lg border border-hairline-dark">
            {riskAnalysis?.explanation ||
              (assets.length === 0 && liabilities.length === 0
                ? "Import your portfolio to generate a personalized risk and diversification analysis."
                : "Analyzing your holdings...")}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Quick Actions:</span>
            <Link
              href="/copilot"
              className="text-xs bg-surface-card hover:bg-surface-elevated border border-hairline-dark hover:border-primary px-3 py-1.5 rounded text-white flex items-center gap-1.5 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-primary" />
              <span>Ask Copilot about this</span>
            </Link>
            <Link
              href="/simulator"
              className="text-xs bg-surface-card hover:bg-surface-elevated border border-hairline-dark hover:border-primary px-3 py-1.5 rounded text-white flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-trading-up" />
              <span>Run Stress Simulator</span>
            </Link>
            <Link
              href="/scam-detector"
              className="text-xs bg-surface-card hover:bg-surface-elevated border border-hairline-dark hover:border-primary px-3 py-1.5 rounded text-white flex items-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-trading-down" />
              <span>Check Tip / Claim</span>
            </Link>
          </div>
        </div>

        {/* Right: Anomaly & Risk Flags */}
        <div className="double-bezel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-primary" />
              <span>Active Anomaly Flags</span>
            </h3>
            <span className="text-[10px] font-mono text-muted-strong">{riskAnalysis?.flags.length || 0} Flags</span>
          </div>

          <div className="space-y-2">
            {riskAnalysis?.flags && riskAnalysis.flags.length > 0 ? (
              riskAnalysis.flags.map((flag, idx) => <AnomalyChip key={idx} flag={flag} />)
            ) : (
              <div className="p-4 bg-ink rounded-lg border border-hairline-dark text-xs text-muted text-center">
                No acute anomaly flags triggered.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Market Benchmark Snapshot */}
      <div className="double-bezel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-trading-up" />
            <span>Market Context & Benchmark Indices</span>
          </h3>
          <Link href="/markets/overview" className="text-xs text-primary hover:underline flex items-center gap-1">
            <span>Full Market Overview</span>
            <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {indices.map((idx) => (
            <div key={idx.symbol} className="p-3 bg-ink rounded-lg border border-hairline-dark space-y-1">
              <span className="text-[11px] font-semibold text-muted-strong block truncate">{idx.name}</span>
              <div className="text-sm font-bold font-mono text-white">
                {idx.value.toLocaleString("en-IN")}
              </div>
              <span
                className={`text-[10px] font-mono font-semibold flex items-center ${
                  idx.changePct >= 0 ? "text-trading-up" : "text-trading-down"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="double-bezel max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline-dark pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>Deterministic Math & Scoring Basis</span>
              </h3>
              <button
                onClick={() => setShowBasisModal(false)}
                className="text-muted hover:text-white text-xs font-bold px-2 py-1 bg-ink rounded"
              >
                Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-strong leading-relaxed">
              <p>
                <strong className="text-white">Risk Score (0–100):</strong> Computed as a weighted sum in pure TypeScript:
                <br />
                <code className="text-primary block bg-ink p-2 rounded mt-1 font-mono">
                  Risk = 0.40 × Concentration(HHI) + 0.40 × DebtRatio + 0.20 × LiquidityRisk
                </code>
              </p>
              <p>
                <strong className="text-white">Diversification Score (0–100):</strong> Uses the Herfindahl-Hirschman Index across 6 canonical asset categories:
                <br />
                <code className="text-primary block bg-ink p-2 rounded mt-1 font-mono">
                  Score = round( (1 - HHI) / (1 - 1/6) × 100 )
                </code>
              </p>
              <p className="text-[11px] text-muted">
                The AI model never computes these numbers — it receives the verified TypeScript output and translates it into educational, plain-language guidance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
