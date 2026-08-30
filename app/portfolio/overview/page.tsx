"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PieChart, ResponsiveContainer, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Layers, PlusCircle, ArrowRight, Wallet, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { Asset, Liability } from "@/lib/types";
import { ExportButton } from "@/components/ui/ExportButton";

const COLORS = ["#ec3013", "#201e1d", "#7d7979", "#bab6b6", "#d7d3d3", "#9b9797"];

export default function PortfolioOverviewPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((data) => {
        if (data.assets) setAssets(data.assets);
        if (data.liabilities) setLiabilities(data.liabilities);
      })
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  const liquidAssetsList = assets.filter(
    (a) => a.type === "bank" || a.type === "stock" || a.type === "etf" || a.type === "mutual_fund" || a.type === "gold"
  );
  const fixedAssetsList = assets.filter(
    (a) => a.type === "real_estate" || a.type === "other"
  );
  const liquidAssetsValue = liquidAssetsList.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const fixedAssetsValue = fixedAssetsList.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const totalAssets = liquidAssetsValue + fixedAssetsValue;
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Group assets by category for charts
  const categorySums: Record<string, number> = {};
  for (const a of assets) {
    categorySums[a.type] = (categorySums[a.type] || 0) + Number(a.value);
  }

  const pieData = Object.entries(categorySums).map(([name, value]) => ({
    name: name === "mutual_fund" ? "HFUND" : name.replace("_", " ").toUpperCase(),
    value,
  }));

  const sortedHoldings = [...assets].sort((a, b) => Number(b.value) - Number(a.value)).slice(0, 8);

  return (
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8 md:py-8 w-full max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-divider pb-4">
        <div>
          <h1 className="text-2xl font-heading font-800 text-ink">Portfolio Overview</h1>
          <p className="text-xs text-ink/60 mt-0.5">
            Asset allocation breakdown, category weights, and balance sheet summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton assets={assets} liabilities={liabilities} />
          <Link href="/portfolio/holdings" className="btn btn-secondary">
            Manage Holdings
          </Link>
          <Link href="/import" className="btn btn-primary">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add / Import</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 border-2 border-ink">
        <div className="p-5 border-b sm:border-b-0 sm:border-r border-divider">
          <span className="kicker">Liquid Assets</span>
          <div className="font-heading font-800 text-2xl text-ink mt-1.5">₹{liquidAssetsValue.toLocaleString("en-IN")}</div>
        </div>
        <div className="p-5 border-b sm:border-b-0 sm:border-r border-divider">
          <span className="kicker">Fixed Assets</span>
          <div className="font-heading font-800 text-2xl text-ink mt-1.5">₹{fixedAssetsValue.toLocaleString("en-IN")}</div>
        </div>
        <div className="p-5 border-b sm:border-b-0 sm:border-r border-divider">
          <span className="kicker">Total Liabilities</span>
          <div className="font-heading font-800 text-2xl text-ink mt-1.5">₹{totalLiabilities.toLocaleString("en-IN")}</div>
        </div>
        <div className="p-5 bg-accent text-bg">
          <span className="text-[10px] tracking-wider uppercase font-heading font-600 opacity-80">Net Worth</span>
          <div className="font-heading font-800 text-2xl mt-1.5">₹{netWorth.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Allocation */}
        <div className="bg-surface">
          <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
            <h3 className="text-base font-heading font-800 text-ink">Asset Class Allocation</h3>
            <span className="text-[11px] font-heading font-600 text-ink/50">HHI Spread</span>
          </div>

          <div className="w-full h-64 p-5">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#eae9e9", borderColor: "#201e1d", borderRadius: "0px", fontSize: "12px" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Value"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink/45">
                No asset data available.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-5 pb-5">
            {pieData.map((d, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-ink/55 truncate">{d.name}:</span>
                <span className="font-heading font-700 text-ink">
                  {totalAssets > 0 ? `${Math.round((d.value / totalAssets) * 100)}%` : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Allocation by type: stacked bar + legend (mockup s4 style) */}
        <div className="bg-surface">
          <div className="px-5 py-3.5 border-b-2 border-divider">
            <h3 className="text-base font-heading font-800 text-ink">Allocation by type</h3>
          </div>
          <div className="p-5">
            {pieData.length > 0 ? (
              <>
                <div className="h-8 flex overflow-hidden mb-5">
                  {pieData.map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: `${totalAssets > 0 ? (d.value / totalAssets) * 100 : 0}%`,
                        backgroundColor: COLORS[idx % COLORS.length],
                      }}
                      title={`${d.name} ${totalAssets > 0 ? Math.round((d.value / totalAssets) * 100) : 0}%`}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-2.5">
                  {pieData.map((d, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-sm">
                      <span
                        className="w-3 h-3 flex-none"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="flex-1 text-ink">{d.name}</span>
                      <span className="font-heading font-800 text-ink">₹{d.value.toLocaleString("en-IN")}</span>
                      <span className="font-heading font-800 text-ink w-11 text-right">
                        {totalAssets > 0 ? `${Math.round((d.value / totalAssets) * 100)}%` : "0%"}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink/45">
                No asset data available.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category values breakdown (bar chart) + Top holdings table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface">
          <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
            <h3 className="text-base font-heading font-800 text-ink">Category Values Breakdown</h3>
            <span className="text-[11px] font-heading font-600 text-ink/50">INR (₹)</span>
          </div>

          <div className="w-full h-64 p-5">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <XAxis dataKey="name" stroke="#7d7979" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#7d7979" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#eae9e9", borderColor: "#201e1d", borderRadius: "0px", fontSize: "12px" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Value"]}
                  />
                  <Bar dataKey="value" fill="#ec3013" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-ink/45">
                No asset data available.
              </div>
            )}
          </div>
        </div>

        {/* Top holdings table */}
        <div className="bg-surface">
          <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
            <h3 className="text-base font-heading font-800 text-ink">Top holdings</h3>
            <span className="text-[11px] text-ink/50">{assets.length} holdings</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">% of assets</th>
                </tr>
              </thead>
              <tbody>
                {sortedHoldings.length > 0 ? (
                  sortedHoldings.map((a) => (
                    <tr key={a.id}>
                      <td className="font-semibold text-ink">{a.name}</td>
                      <td className="text-right font-heading font-600 text-ink">₹{Number(a.value).toLocaleString("en-IN")}</td>
                      <td className="text-right font-heading font-800 text-accent">
                        {totalAssets > 0 ? `${((Number(a.value) / totalAssets) * 100).toFixed(1)}%` : "0%"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center text-ink/45 py-6">
                      No holdings available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
