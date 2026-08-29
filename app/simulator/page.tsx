"use client";

import React, { useEffect, useState } from "react";
import {
  Sliders,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { SimulationScenario } from "@/lib/types";

export default function SimulatorPage() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(15000);
  const [annualReturnPct, setAnnualReturnPct] = useState(12);
  const [years, setYears] = useState(15);
  const [marketShockPct, setMarketShockPct] = useState(0);

  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<SimulationScenario | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/simulator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assumptions: {
            monthlyInvestment,
            annualReturnPct,
            years,
            marketShockPct,
          },
        }),
      });

      const json = await res.json();
      if (json.scenario) {
        setScenario(json.scenario);
      }
    } catch (err) {
      console.warn("Simulation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, []);

  const chartData = scenario?.yearlyPoints.map((p) => ({
    year: `Yr ${p.year}`,
    totalValue: p.value,
    contributions: p.contributions,
    interestEarned: p.interestEarned,
  })) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-hairline-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-trading-up/15 border border-trading-up/30 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-trading-up" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">What-If Scenario Simulator</h1>
          </div>
          <p className="text-xs text-muted-strong mt-0.5">
            Deterministic compound growth projections and macroeconomic stress-testing scenarios.
          </p>
        </div>

        <div className="text-[10px] font-mono text-primary bg-ink px-3 py-1.5 rounded-lg border border-hairline-dark">
          ILLUSTRATIVE MODEL
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Controls */}
        <div className="double-bezel p-6 space-y-6">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-hairline-dark pb-3">
            Scenario Assumptions
          </h3>

          {/* Monthly Investment Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-muted-strong font-semibold">Monthly SIP (₹)</label>
              <span className="font-mono font-bold text-white">₹{monthlyInvestment.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200000"
              step="1000"
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted font-mono">
              <span>₹0</span>
              <span>₹1 Lakh</span>
              <span>₹2 Lakhs</span>
            </div>
          </div>

          {/* Annual Return % Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-muted-strong font-semibold">Expected Return (p.a.)</label>
              <span className="font-mono font-bold text-trading-up">{annualReturnPct}%</span>
            </div>
            <input
              type="range"
              min="-10"
              max="25"
              step="0.5"
              value={annualReturnPct}
              onChange={(e) => setAnnualReturnPct(Number(e.target.value))}
              className="w-full accent-trading-up cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted font-mono">
              <span>-10%</span>
              <span>8% (Debt/FD)</span>
              <span>14% (Nifty)</span>
              <span>25%</span>
            </div>
          </div>

          {/* Horizon Years Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="text-muted-strong font-semibold">Time Horizon</label>
              <span className="font-mono font-bold text-white">{years} Years</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-accent-blue cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted font-mono">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>35 Years</span>
            </div>
          </div>

          {/* Market Shock Simulation */}
          <div className="space-y-2 pt-2 border-t border-hairline-dark">
            <div className="flex justify-between text-xs">
              <label className="text-muted-strong font-semibold">Instant Market Shock</label>
              <span className={`font-mono font-bold ${marketShockPct < 0 ? "text-trading-down" : "text-white"}`}>
                {marketShockPct > 0 ? `+${marketShockPct}%` : `${marketShockPct}%`}
              </span>
            </div>
            <div className="flex gap-2">
              {[0, -10, -20, -30].map((shock) => (
                <button
                  key={shock}
                  onClick={() => setMarketShockPct(shock)}
                  className={`flex-1 py-1 rounded text-[11px] font-mono font-semibold border ${
                    marketShockPct === shock
                      ? "bg-trading-down/20 border-trading-down text-trading-down"
                      : "bg-ink border-hairline-dark text-muted hover:text-white"
                  }`}
                >
                  {shock === 0 ? "Normal" : `${shock}%`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-active active:scale-95 text-primary-foreground font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Simulating..." : "Recalculate Scenario"}</span>
          </button>
        </div>

        {/* Right Columns: Projection Chart & Stress Test */}
        <div className="lg:col-span-2 space-y-6">
          {/* Headline Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="double-bezel p-4 space-y-1">
              <span className="text-[10px] font-semibold text-muted-strong uppercase tracking-wider block">
                Projected Future Value
              </span>
              <span className="text-xl font-extrabold font-mono text-primary">
                ₹{scenario?.projectedNetWorth.toLocaleString("en-IN") || "—"}
              </span>
            </div>
            <div className="double-bezel p-4 space-y-1">
              <span className="text-[10px] font-semibold text-muted-strong uppercase tracking-wider block">
                Principal Invested
              </span>
              <span className="text-xl font-bold font-mono text-white">
                ₹{scenario?.yearlyPoints[scenario.yearlyPoints.length - 1]?.contributions.toLocaleString("en-IN") || "—"}
              </span>
            </div>
            <div className="double-bezel p-4 space-y-1">
              <span className="text-[10px] font-semibold text-muted-strong uppercase tracking-wider block">
                Est. Compound Returns
              </span>
              <span className="text-xl font-bold font-mono text-trading-up">
                ₹{scenario?.yearlyPoints[scenario.yearlyPoints.length - 1]?.interestEarned.toLocaleString("en-IN") || "—"}
              </span>
            </div>
          </div>

          {/* Projection Area Chart */}
          <div className="double-bezel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline-dark pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Projected Wealth Accumulation Curve ({years} Years)
              </h3>
              <span className="text-[10px] font-mono text-trading-up">Pure TS Compound Engine</span>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FCD535" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FCD535" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" />
                  <XAxis dataKey="year" stroke="#707A8A" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#707A8A" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1E2329", borderColor: "#2B3139", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                  />
                  <Area type="monotone" dataKey="totalValue" name="Projected Value" stroke="#FCD535" strokeWidth={2.5} fillOpacity={1} fill="url(#totalColor)" />
                  <Area type="monotone" dataKey="contributions" name="Principal Invested" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stress Test Matrix */}
          {scenario?.stressTestResults && (
            <div className="double-bezel p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-trading-down" />
                <span>Stress-Test Impact Scenarios</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {scenario.stressTestResults.map((st, idx) => (
                  <div key={idx} className="p-3 bg-ink rounded-lg border border-hairline-dark space-y-1">
                    <span className="text-[11px] font-semibold text-muted-strong block">{st.scenarioName}</span>
                    <div className="text-sm font-bold font-mono text-white">
                      ₹{st.projectedValue.toLocaleString("en-IN")}
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${st.impactPct < 0 ? "text-trading-down" : "text-trading-up"}`}>
                      {st.impactPct > 0 ? "+" : ""}{st.impactPct}% (₹{st.impactAmount.toLocaleString("en-IN")})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Non-Advisory Commentary */}
          {scenario?.explanation && (
            <div className="p-4 rounded-xl bg-surface-card border border-hairline-dark text-xs text-muted-strong leading-relaxed">
              <span className="font-semibold text-white block mb-1">Scenario Analysis Commentary:</span>
              <p className="whitespace-pre-line">{scenario.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
