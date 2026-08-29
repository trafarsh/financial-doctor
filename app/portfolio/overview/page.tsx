"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { PieChart, ResponsiveContainer, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Layers, PlusCircle, ArrowRight, Wallet, TrendingUp, TrendingDown, Coins } from "lucide-react";
import { Asset, Liability } from "@/lib/types";
import { ExportButton } from "@/components/ui/ExportButton";

const COLORS = ["#FCD535", "#0ECB81", "#3B82F6", "#F6465D", "#2DBDB6", "#929AA5"];

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

  const totalAssets = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
  const netWorth = totalAssets - totalLiabilities;

  // Group assets by category for charts
  const categorySums: Record<string, number> = {};
  for (const a of assets) {
    categorySums[a.type] = (categorySums[a.type] || 0) + Number(a.value);
  }

  const pieData = Object.entries(categorySums).map(([name, value]) => ({
    name: name.replace("_", " ").toUpperCase(),
    value,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline-dark pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Portfolio Overview</h1>
          <p className="text-xs text-muted-strong mt-0.5">
            Asset allocation breakdown, category weights, and balance sheet summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ExportButton assets={assets} liabilities={liabilities} />
          <Link
            href="/portfolio/holdings"
            className="bg-surface-card hover:bg-surface-elevated border border-hairline-dark text-xs font-semibold text-white px-3.5 py-2 rounded-md transition-colors"
          >
            Manage Holdings
          </Link>
          <Link
            href="/import"
            className="bg-primary hover:bg-primary-active text-primary-foreground text-xs font-bold px-3.5 py-2 rounded-md flex items-center gap-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add / Import</span>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="double-bezel p-5 space-y-1">
          <span className="text-xs font-semibold text-muted-strong uppercase tracking-wider">Total Net Worth</span>
          <div className="text-2xl font-bold font-mono text-primary">₹{netWorth.toLocaleString("en-IN")}</div>
        </div>
        <div className="double-bezel p-5 space-y-1">
          <span className="text-xs font-semibold text-muted-strong uppercase tracking-wider">Gross Asset Value</span>
          <div className="text-2xl font-bold font-mono text-trading-up">₹{totalAssets.toLocaleString("en-IN")}</div>
        </div>
        <div className="double-bezel p-5 space-y-1">
          <span className="text-xs font-semibold text-muted-strong uppercase tracking-wider">Outstanding Debt</span>
          <div className="text-2xl font-bold font-mono text-trading-down">₹{totalLiabilities.toLocaleString("en-IN")}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Allocation */}
        <div className="double-bezel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline-dark pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Asset Class Allocation</h3>
            <span className="text-[10px] font-mono text-muted">HHI Spread</span>
          </div>

          <div className="w-full h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1E2329", borderColor: "#2B3139", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Value"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted">
                No asset data available.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
            {pieData.map((d, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-muted-strong truncate">{d.name}:</span>
                <span className="font-mono font-semibold text-white">
                  {totalAssets > 0 ? `${Math.round((d.value / totalAssets) * 100)}%` : "0%"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Breakdown */}
        <div className="double-bezel p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-hairline-dark pb-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Category Values Breakdown</h3>
            <span className="text-[10px] font-mono text-muted">INR (₹)</span>
          </div>

          <div className="w-full h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <XAxis dataKey="name" stroke="#707A8A" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#707A8A" tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1E2329", borderColor: "#2B3139", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Value"]}
                  />
                  <Bar dataKey="value" fill="#FCD535" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-muted">
                No asset data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
