"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertOctagon, RefreshCw, Sliders, TrendingUp, TrendingDown, Layers, Info, Trash2, PlusCircle, ArrowLeft } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { SimulationScenario, Asset, Liability } from "@/lib/types";

function SimulatorContent() {
  const searchParams = useSearchParams();
  const holdingIdParam = searchParams.get("holdingId") || searchParams.get("holding");

  const [mode, setMode] = useState<"sip" | "portfolio">(holdingIdParam ? "portfolio" : "sip");

  // --- SIP SIMULATOR STATE ---
  const [monthlyInvestment, setMonthlyInvestment] = useState(15000);
  const [annualReturnPct, setAnnualReturnPct] = useState(12);
  const [years, setYears] = useState(15);
  const [marketShockPct, setMarketShockPct] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scenario, setScenario] = useState<SimulationScenario | null>(null);

  // --- PORTFOLIO STRESS TESTING STATE ---
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  
  // Modifiers
  const [priceShockPct, setPriceShockPct] = useState(0);
  const [allocationAdj, setAllocationAdj] = useState(0); // in INR change
  const [removeAsset, setRemoveAsset] = useState(false);
  const [marketWideDecline, setMarketWideDecline] = useState(0);
  const [sectorDecline, setSectorDecline] = useState(0);

  // Fetch holdings
  const fetchHoldings = async () => {
    try {
      const res = await fetch("/api/portfolio").then((r) => r.json());
      if (res.assets) setAssets(res.assets);
      if (res.liabilities) setLiabilities(res.liabilities);
    } catch (err) {
      console.warn("Failed to fetch holdings for simulator:", err);
    }
  };

  useEffect(() => {
    fetchHoldings();
  }, []);

  // Set selected asset from URL query param when assets are loaded
  useEffect(() => {
    if (holdingIdParam && assets.length > 0) {
      const found = assets.find((a) => a.id === holdingIdParam);
      if (found) {
        setSelectedAssetId(found.id);
        setMode("portfolio");
      }
    }
  }, [holdingIdParam, assets]);

  // Reset modifiers when selected asset changes
  useEffect(() => {
    setPriceShockPct(0);
    setAllocationAdj(0);
    setRemoveAsset(false);
    setMarketWideDecline(0);
    setSectorDecline(0);
  }, [selectedAssetId]);

  // Run SIP Simulation
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

  // --- MATH FOR PORTFOLIO SIMULATION ---
  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  const simulatedAssets = assets.map((asset) => {
    let baseVal = asset.value;

    // Apply allocation changes for selected asset
    if (asset.id === selectedAssetId) {
      if (removeAsset) {
        return { ...asset, simulatedValue: 0, change: -asset.value };
      }
      baseVal = Math.max(0, asset.value + allocationAdj);
    }

    let simVal = baseVal;

    // Apply price shock for selected asset
    if (asset.id === selectedAssetId) {
      simVal = baseVal * (1 + priceShockPct / 100);
    }

    // Apply market-wide decline to all market-linked assets (stock, etf, mutual_fund)
    const isMarketLinked = asset.type === "stock" || asset.type === "etf" || asset.type === "mutual_fund";
    if (isMarketLinked && marketWideDecline > 0) {
      simVal = simVal * (1 - marketWideDecline / 100);
    }

    // Apply sector-specific decline to all assets in same sector as selected asset
    if (selectedAsset && asset.sector && asset.sector === selectedAsset.sector && sectorDecline > 0) {
      simVal = simVal * (1 - sectorDecline / 100);
    }

    simVal = Math.round(simVal);
    return {
      ...asset,
      simulatedValue: simVal,
      change: simVal - asset.value,
    };
  });

  const originalAssetsTotal = assets.reduce((sum, a) => sum + a.value, 0);
  const simulatedAssetsTotal = simulatedAssets.reduce((sum, a) => sum + a.simulatedValue, 0);

  const liabilitiesTotal = liabilities.reduce((sum, l) => sum + l.amount, 0);
  const originalNetWorth = originalAssetsTotal - liabilitiesTotal;
  const simulatedNetWorth = simulatedAssetsTotal - liabilitiesTotal;

  const netWorthChange = simulatedNetWorth - originalNetWorth;
  const netWorthChangePct = originalNetWorth > 0 ? (netWorthChange / originalNetWorth) * 100 : 0;

  const getSimulatedCommentary = () => {
    if (!selectedAsset) return "Select a holding in the controls to see stress-test analysis.";
    let commentary = `Simulating stress scenario on ${selectedAsset.name}. `;
    if (removeAsset) {
      commentary += `Removing this asset entirely reduces your portfolio exposure to the ${selectedAsset.sector || "General"} sector by ₹${selectedAsset.value.toLocaleString("en-IN")}. `;
    } else {
      if (priceShockPct !== 0) {
        commentary += `A ${priceShockPct > 0 ? "gain" : "decline"} of ${Math.abs(priceShockPct)}% in asset price changes its value to ₹${Math.round(selectedAsset.value * (1 + priceShockPct / 100)).toLocaleString("en-IN")}. `;
      }
      if (allocationAdj !== 0) {
        commentary += `Adjusting allocation by ${allocationAdj > 0 ? "+" : ""}₹${allocationAdj.toLocaleString("en-IN")} changes its core position value. `;
      }
    }
    if (marketWideDecline > 0) {
      commentary += `Applying a ${marketWideDecline}% market-wide decline down-valuates all market-linked assets (Stocks, ETFs, and HFUNDs) in your portfolio. `;
    }
    if (sectorDecline > 0 && selectedAsset.sector) {
      commentary += `A ${sectorDecline}% drop in the ${selectedAsset.sector} sector specifically impacts all holdings classified under it. `;
    }
    commentary += `Overall, this what-if scenario impacts your net worth by ${netWorthChange >= 0 ? "+" : ""}₹${Math.abs(Math.round(netWorthChange)).toLocaleString("en-IN")} (${netWorthChangePct >= 0 ? "+" : ""}${netWorthChangePct.toFixed(2)}%).`;
    return commentary;
  };

  const chartData = scenario?.yearlyPoints.map((p) => ({
    year: `Yr ${p.year}`,
    totalValue: p.value,
    contributions: p.contributions,
    interestEarned: p.interestEarned,
  })) || [];

  const lastPoint = scenario?.yearlyPoints[scenario.yearlyPoints.length - 1];

  return (
    <div className="flex flex-col gap-6 px-8 py-8 w-full max-w-6xl">
      {/* Page Header */}
      <div className="border-b-2 border-divider pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-800 text-ink m-0">What-if Simulator</h1>
          <p className="text-xs text-ink/60 mt-1">
            Stress-test your portfolio holdings or run illustrative compound growth simulations.
          </p>
        </div>

        {/* Segmented Control Mode Switcher */}
        <div className="seg self-start sm:self-center">
          <button
            onClick={() => setMode("sip")}
            className={`seg-opt ${mode === "sip" ? "active" : ""}`}
          >
            SIP Growth Projection
          </button>
          <button
            onClick={() => setMode("portfolio")}
            className={`seg-opt ${mode === "portfolio" ? "active" : ""}`}
          >
            Portfolio Stress Testing
          </button>
        </div>
      </div>

      {/* --- SIP GROWTH SIMULATOR MODE --- */}
      {mode === "sip" && (
        <div className="flex flex-col gap-6">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-2 border-ink bg-surface/40">
            {/* Monthly SIP */}
            <div className="p-4.5 border-r-0 lg:border-r border-b lg:border-b-0 border-divider">
              <div className="kicker mb-2">Monthly SIP</div>
              <div className="font-heading font-800 text-2xl mb-2.5">
                ₹{monthlyInvestment.toLocaleString("en-IN")}
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                step="1000"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink/45 mt-1">
                <span>₹0</span>
                <span>₹2L</span>
              </div>
            </div>

            {/* Expected return */}
            <div className="p-4.5 border-r-0 lg:border-r border-b lg:border-b-0 border-divider">
              <div className="kicker mb-2">Expected return</div>
              <div className="font-heading font-800 text-2xl mb-2.5">
                {annualReturnPct}%<span className="text-sm opacity-50"> p.a.</span>
              </div>
              <input
                type="range"
                min="-10"
                max="25"
                step="0.5"
                value={annualReturnPct}
                onChange={(e) => setAnnualReturnPct(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink/45 mt-1">
                <span>-10%</span>
                <span>25%</span>
              </div>
            </div>

            {/* Time horizon */}
            <div className="p-4.5 border-r-0 lg:border-r border-b lg:border-b-0 border-divider">
              <div className="kicker mb-2">Time horizon</div>
              <div className="font-heading font-800 text-2xl mb-2.5">
                {years}<span className="text-sm opacity-50"> years</span>
              </div>
              <input
                type="range"
                min="1"
                max="35"
                step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-accent cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-ink/45 mt-1">
                <span>1Y</span>
                <span>35Y</span>
              </div>
            </div>

            {/* Market shock preset */}
            <div className="p-4.5">
              <div className="kicker mb-2">Market shock preset</div>
              <div className="flex flex-col gap-1.5 mt-1">
                {[0, -10, -20, -30].map((shock) => (
                  <button
                    key={shock}
                    onClick={() => setMarketShockPct(shock)}
                    className={`text-xs px-2.5 py-1.5 border border-divider font-heading font-600 text-left ${
                      marketShockPct === shock ? "bg-ink text-bg" : "text-ink bg-bg"
                    }`}
                  >
                    {shock === 0 ? "None (baseline)" : `${shock}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button onClick={runSimulation} disabled={loading} className="btn btn-primary self-start">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Simulating..." : "Recalculate scenario"}
          </button>

          {/* Result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 border-2 border-ink">
            <div className="p-5 border-r-0 sm:border-r border-b sm:border-b-0 border-divider bg-accent text-bg">
              <div className="text-[10px] tracking-[0.14em] uppercase font-600 mb-1.5 opacity-80">
                Projected value
              </div>
              <div className="font-heading font-800 text-[34px] tracking-tight">
                ₹{scenario?.projectedNetWorth.toLocaleString("en-IN") || "—"}
              </div>
            </div>
            <div className="p-5 border-r-0 sm:border-r border-b sm:border-b-0 border-divider bg-surface">
              <div className="kicker mb-1.5">Total principal</div>
              <div className="font-heading font-800 text-[34px] tracking-tight">
                ₹{lastPoint?.contributions.toLocaleString("en-IN") || "—"}
              </div>
            </div>
            <div className="p-5 bg-surface">
              <div className="kicker mb-1.5">Total returns</div>
              <div className="font-heading font-800 text-[34px] tracking-tight text-up">
                ₹{lastPoint?.interestEarned.toLocaleString("en-IN") || "—"}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-surface border border-divider">
            <div className="px-4.5 py-3.5 border-b-2 border-divider bg-neutral-200">
              <h3 className="m-0 text-base">Wealth accumulation ({years} years)</h3>
            </div>
            <div className="p-4.5">
              <div className="w-full h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec3013" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ec3013" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-divider)" />
                    <XAxis dataKey="year" stroke="var(--color-neutral-600)" tick={{ fontSize: 10 }} />
                    <YAxis
                      stroke="var(--color-neutral-600)"
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-bg)",
                        borderColor: "var(--color-divider)",
                        borderRadius: 0,
                        fontSize: "12px",
                      }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalValue"
                      name="Total value"
                      stroke="#ec3013"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#totalColor)"
                    />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      name="Principal invested"
                      stroke="var(--color-neutral-500)"
                      strokeWidth={1.5}
                      fillOpacity={0}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Stress Test presets */}
          {scenario?.stressTestResults && scenario.stressTestResults.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-sm font-heading font-800 uppercase tracking-[0.04em] mb-3">
                <AlertOctagon className="w-4.5 h-4.5 text-accent" />
                Stress-test impact scenarios
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 border-2 border-divider">
                {scenario.stressTestResults.map((st, idx) => (
                  <div
                    key={idx}
                    className={`p-5 bg-surface ${idx < scenario.stressTestResults!.length - 1 ? "border-r-0 sm:border-r" : ""} border-b sm:border-b-0 border-divider`}
                  >
                    <div className="text-[10px] tracking-[0.14em] uppercase font-heading font-800 mb-2 text-ink/60">
                      {st.scenarioName}
                    </div>
                    <div className="font-heading font-800 text-2xl tracking-tight">
                      ₹{st.projectedValue.toLocaleString("en-IN")}
                    </div>
                    <div className={`text-xs mt-1.5 font-600 ${st.impactPct < 0 ? "text-accent" : "text-up"}`}>
                      {st.impactPct > 0 ? "+" : ""}
                      {st.impactPct}% (₹{st.impactAmount.toLocaleString("en-IN")})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Commentary */}
          {scenario?.explanation && (
            <div className="border-l-[3px] border-accent px-5 py-4 bg-accent-100">
              <div className="kicker-accent mb-1.5">Illustrative commentary</div>
              <p className="text-[13.5px] leading-relaxed m-0 whitespace-pre-line">{scenario.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* --- PORTFOLIO STRESS TESTING MODE --- */}
      {mode === "portfolio" && (
        <div className="flex flex-col gap-6">
          {assets.length === 0 ? (
            <div className="bg-surface border-2 border-divider p-8 text-center space-y-3">
              <Layers className="w-8 h-8 text-ink/45 mx-auto" />
              <h3 className="text-sm font-heading font-800 text-ink">No holdings available to stress test</h3>
              <p className="text-xs text-ink/60 max-w-md mx-auto">
                Please add or import assets in holdings page before using the stress test simulator.
              </p>
              <Link href="/import" className="btn btn-primary inline-flex">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Import Assets</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Controls Column (Span 1) */}
              <div className="space-y-5 lg:col-span-1 border-2 border-ink p-5 bg-surface/30 flex flex-col gap-4">
                <h3 className="text-sm font-heading font-800 uppercase tracking-wider border-b border-divider pb-2 m-0">
                  Stress Controls
                </h3>

                {/* Asset Selection */}
                <div className="field">
                  <label className="font-semibold text-xs">Select Holding to Simulate</label>
                  <select
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="input font-semibold text-xs"
                  >
                    <option value="">-- Choose an asset --</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type === "mutual_fund" ? "HFUND" : a.type.replace("_", " ")})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedAsset ? (
                  <div className="space-y-4 pt-2">
                    <div className="p-3 bg-surface border border-divider space-y-1">
                      <span className="text-[10px] text-ink/50 block font-heading font-800 uppercase">
                        Current Position Details
                      </span>
                      <div className="text-sm font-semibold text-ink">{selectedAsset.name}</div>
                      <div className="text-xs text-ink/60 flex justify-between">
                        <span>Sector: {selectedAsset.sector || "General"}</span>
                        <span className="font-heading font-800">₹{selectedAsset.value.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Remove asset trigger */}
                    <div className="flex items-center gap-2 border border-divider p-3 bg-bg">
                      <input
                        type="checkbox"
                        id="removeAssetToggle"
                        checked={removeAsset}
                        onChange={(e) => setRemoveAsset(e.target.checked)}
                        className="accent-accent cursor-pointer w-4 h-4"
                      />
                      <label htmlFor="removeAssetToggle" className="text-xs font-semibold cursor-pointer select-none">
                        Remove from hypothetical portfolio
                      </label>
                    </div>

                    {!removeAsset && (
                      <>
                        {/* Price Shock slider */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold flex justify-between">
                            <span>Price Shock (%)</span>
                            <span className={`font-heading font-800 ${priceShockPct > 0 ? "text-up" : priceShockPct < 0 ? "text-accent" : ""}`}>
                              {priceShockPct > 0 ? "+" : ""}{priceShockPct}%
                            </span>
                          </label>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            step="5"
                            value={priceShockPct}
                            onChange={(e) => setPriceShockPct(Number(e.target.value))}
                            className="w-full accent-accent cursor-pointer"
                          />
                          <div className="flex flex-wrap gap-1 pt-1">
                            {[-30, -10, 0, 10, 30].map((preset) => (
                              <button
                                key={preset}
                                onClick={() => setPriceShockPct(preset)}
                                className={`text-[10px] px-2 py-0.5 border border-divider font-heading font-600 ${
                                  priceShockPct === preset ? "bg-ink text-bg" : "bg-bg text-ink"
                                }`}
                              >
                                {preset > 0 ? "+" : ""}{preset}%
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Allocation adjustments */}
                        <div className="space-y-1.5 pt-2">
                          <label className="text-xs font-semibold flex justify-between">
                            <span>Simulate Allocation Change (₹)</span>
                            <span className={`font-heading font-800 ${allocationAdj > 0 ? "text-up" : allocationAdj < 0 ? "text-accent" : ""}`}>
                              {allocationAdj > 0 ? "+" : ""}₹{allocationAdj.toLocaleString("en-IN")}
                            </span>
                          </label>
                          <input
                            type="range"
                            min={-selectedAsset.value}
                            max={selectedAsset.value * 2}
                            step={Math.round(selectedAsset.value / 10) || 5000}
                            value={allocationAdj}
                            onChange={(e) => setAllocationAdj(Number(e.target.value))}
                            className="w-full accent-accent cursor-pointer"
                          />
                          <div className="flex flex-wrap gap-1 pt-1">
                            {[
                              { label: "-50%", val: -Math.round(selectedAsset.value * 0.5) },
                              { label: "Reset", val: 0 },
                              { label: "+50%", val: Math.round(selectedAsset.value * 0.5) },
                              { label: "+100%", val: selectedAsset.value },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                onClick={() => setAllocationAdj(preset.val)}
                                className={`text-[10px] px-2 py-0.5 border border-divider font-heading font-600 ${
                                  allocationAdj === preset.val ? "bg-ink text-bg" : "bg-bg text-ink"
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Macro: Market-wide decline */}
                    <div className="space-y-1.5 border-t border-divider pt-3">
                      <label className="text-xs font-semibold flex justify-between">
                        <span>Market-wide decline (%)</span>
                        <span className="font-heading font-800 text-accent">{marketWideDecline > 0 ? `-${marketWideDecline}%` : "None"}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="5"
                        value={marketWideDecline}
                        onChange={(e) => setMarketWideDecline(Number(e.target.value))}
                        className="w-full accent-accent cursor-pointer"
                      />
                      <div className="flex flex-wrap gap-1">
                        {[0, 10, 20, 30].map((pct) => (
                          <button
                            key={pct}
                            onClick={() => setMarketWideDecline(pct)}
                            className={`text-[10px] px-2 py-0.5 border border-divider font-heading font-600 ${
                              marketWideDecline === pct ? "bg-ink text-bg" : "bg-bg text-ink"
                            }`}
                          >
                            {pct === 0 ? "None" : `-${pct}%`}
                          </button>
                        ))}
                      </div>
                      <span className="text-[9px] text-ink/45 block leading-normal">
                        Applies price contraction across all Stocks, ETFs, and HFUNDs in the portfolio.
                      </span>
                    </div>

                    {/* Macro: Sector decline */}
                    {selectedAsset.sector && (
                      <div className="space-y-1.5 border-t border-divider pt-3">
                        <label className="text-xs font-semibold flex justify-between">
                          <span>{selectedAsset.sector} Sector decline (%)</span>
                          <span className="font-heading font-800 text-accent">{sectorDecline > 0 ? `-${sectorDecline}%` : "None"}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="5"
                          value={sectorDecline}
                          onChange={(e) => setSectorDecline(Number(e.target.value))}
                          className="w-full accent-accent cursor-pointer"
                        />
                        <div className="flex flex-wrap gap-1">
                          {[0, 15, 30, 50].map((pct) => (
                            <button
                              key={pct}
                              onClick={() => setSectorDecline(pct)}
                              className={`text-[10px] px-2 py-0.5 border border-divider font-heading font-600 ${
                                sectorDecline === pct ? "bg-ink text-bg" : "bg-bg text-ink"
                              }`}
                            >
                              {pct === 0 ? "None" : `-${pct}%`}
                            </button>
                          ))}
                        </div>
                        <span className="text-[9px] text-ink/45 block leading-normal">
                          Applies contraction to all holdings belonging to the {selectedAsset.sector} sector.
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 border border-dashed border-divider text-xs text-ink/55 text-center my-6">
                    Select a holding above to begin scenario configuration.
                  </div>
                )}
              </div>

              {/* Results & Visual Feedback Column (Span 2) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Result cards comparing Original vs Simulated */}
                <div className="grid grid-cols-1 sm:grid-cols-3 border-2 border-ink bg-surface/30">
                  <div className="p-5 border-r border-divider">
                    <span className="kicker">Original Net Worth</span>
                    <div className="font-heading font-800 text-2xl text-ink/70 mt-1">
                      ₹{originalNetWorth.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="p-5 border-r border-divider bg-accent-100">
                    <span className="kicker-accent">Simulated Net Worth</span>
                    <div className="font-heading font-800 text-2xl text-accent mt-1">
                      ₹{simulatedNetWorth.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <div className="p-5">
                    <span className="kicker">Estimated Impact</span>
                    <div className={`font-heading font-800 text-2xl mt-1 flex items-center gap-1 ${netWorthChange >= 0 ? "text-up" : "text-accent"}`}>
                      {netWorthChange >= 0 ? <TrendingUp className="w-5 h-5 shrink-0" /> : <TrendingDown className="w-5 h-5 shrink-0" />}
                      <span>
                        {netWorthChange >= 0 ? "+" : ""}
                        {netWorthChangePct.toFixed(1)}%
                      </span>
                    </div>
                    <span className="text-[10px] text-ink/45">
                      {netWorthChange >= 0 ? "+" : ""}₹{Math.abs(Math.round(netWorthChange)).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* AI / Local stress analysis card */}
                <div className="border-l-[3px] border-accent px-5 py-4 bg-accent-200/50 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4 text-accent" />
                    <span className="kicker-accent m-0">What-if simulation analysis</span>
                  </div>
                  <p className="text-[13.5px] leading-relaxed m-0 text-ink/85">{getSimulatedCommentary()}</p>
                  <span className="text-[10px] text-ink/45 mt-2 font-mono">
                    * Illustrative simulation for educational stress testing only. Order execution is not supported.
                  </span>
                </div>

                {/* Stressed holdings breakdown table */}
                <div className="bg-surface border border-divider">
                  <div className="px-5 py-3.5 border-b-2 border-divider bg-neutral-200 flex justify-between items-center">
                    <h3 className="m-0 text-base font-heading font-800 text-ink">Stressed Portfolio Breakdown</h3>
                    <span className="text-[10px] bg-ink text-bg px-2 py-0.5 font-heading font-700 uppercase">
                      Estimates
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="table text-xs">
                      <thead>
                        <tr>
                          <th>Asset Name</th>
                          <th>Sector</th>
                          <th className="text-right">Original Value</th>
                          <th className="text-right">Simulated Value</th>
                          <th className="text-right">Change (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {simulatedAssets.map((asset) => (
                          <tr
                            key={asset.id}
                            className={asset.id === selectedAssetId ? "bg-accent-100 font-semibold" : ""}
                          >
                            <td>{asset.name}</td>
                            <td className="text-ink/55">{asset.sector || "General"}</td>
                            <td className="text-right text-ink/70">₹{asset.value.toLocaleString("en-IN")}</td>
                            <td className="text-right text-ink font-heading font-700">
                              ₹{asset.simulatedValue.toLocaleString("en-IN")}
                            </td>
                            <td
                              className={`text-right font-heading font-800 ${
                                asset.change > 0 ? "text-up" : asset.change < 0 ? "text-accent" : "text-ink/45"
                              }`}
                            >
                              {asset.change > 0 ? "+" : ""}
                              {asset.change === 0 ? "—" : `₹${asset.change.toLocaleString("en-IN")}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={<div className="p-8 font-heading font-800 text-ink/55">Loading Stress Simulator...</div>}>
      <SimulatorContent />
    </Suspense>
  );
}
