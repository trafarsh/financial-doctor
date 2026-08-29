"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Calendar, Search, ExternalLink, BarChart3 } from "lucide-react";
import { MarketIndex, AssetPrice, MarketEvent, AssetFundamental } from "@/lib/types";

export default function MarketsOverviewPage() {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [quotes, setQuotes] = useState<AssetPrice[]>([]);
  const [events, setEvents] = useState<MarketEvent[]>([]);
  const [fundamentals, setFundamentals] = useState<AssetFundamental[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/overview")
      .then((r) => r.json())
      .then((data) => {
        if (data.indices) setIndices(data.indices);
        if (data.quotes) setQuotes(data.quotes);
        if (data.events) setEvents(data.events);
        if (data.fundamentals) setFundamentals(data.fundamentals);
      })
      .catch((err) => console.warn(err))
      .finally(() => setLoading(false));
  }, []);

  const filteredQuotes = quotes.filter(
    (q) =>
      q.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-hairline-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Market Intelligence</h1>
          <p className="text-xs text-muted-strong mt-0.5">
            Normalized market indices, equity fundamentals, and macroeconomic events.
          </p>
        </div>
        <span className="text-[10px] font-mono text-trading-up bg-ink px-3 py-1.5 rounded-lg border border-hairline-dark">
          NSE / BSE DATA FEED
        </span>
      </div>

      {/* 1. Top Benchmark Indices Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {indices.map((idx) => {
          const isUp = idx.changePct >= 0;
          return (
            <div key={idx.symbol} className="double-bezel p-4 space-y-1.5">
              <span className="text-xs font-semibold text-muted-strong block truncate">{idx.name}</span>
              <div className="text-xl font-bold font-mono text-white">
                {idx.value.toLocaleString("en-IN")}
              </div>
              <div className={`text-xs font-mono font-semibold flex items-center gap-1 ${isUp ? "text-trading-up" : "text-trading-down"}`}>
                {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>
                  {isUp ? "+" : ""}{idx.change} ({isUp ? "+" : ""}{idx.changePct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Equities & Fundamentals Table */}
      <div className="double-bezel p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-hairline-dark pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Indian Equities & Fundamentals
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ticker (Reliance, TCS...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-ink border border-hairline-dark rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-muted outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-ink text-muted-strong uppercase text-[10px] tracking-wider border-b border-hairline-dark">
              <tr>
                <th className="p-3">Company / Symbol</th>
                <th className="p-3 font-mono text-right">Price (₹)</th>
                <th className="p-3 font-mono text-right">24h Change</th>
                <th className="p-3 font-mono text-right">Market Cap (₹ Cr)</th>
                <th className="p-3 font-mono text-right">P/E Ratio</th>
                <th className="p-3 font-mono text-right">Dividend Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-dark">
              {filteredQuotes.map((q) => {
                const fund = fundamentals.find((f) => f.symbol === q.symbol);
                const isUp = q.change24hPct >= 0;
                return (
                  <tr key={q.symbol} className="hover:bg-ink/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-white">{q.name}</div>
                      <div className="text-[10px] font-mono text-muted">{q.symbol} · {fund?.sector || "NSE"}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-white text-right">
                      ₹{q.price.toLocaleString("en-IN")}
                    </td>
                    <td className={`p-3 font-mono font-bold text-right ${isUp ? "text-trading-up" : "text-trading-down"}`}>
                      {isUp ? "+" : ""}{q.change24hPct}%
                    </td>
                    <td className="p-3 font-mono text-right text-muted-strong">
                      {fund ? `₹${fund.marketCap.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td className="p-3 font-mono text-right text-muted-strong">
                      {fund?.peRatio ? `${fund.peRatio}x` : "—"}
                    </td>
                    <td className="p-3 font-mono text-right text-muted-strong">
                      {fund?.dividendYield ? `${fund.dividendYield}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Macroeconomic Calendar Events */}
      <div className="double-bezel p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-hairline-dark pb-3">
          <Calendar className="w-4 h-4 text-accent-blue" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Economic Events & Policy Calendar
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {events.map((evt) => (
            <div key={evt.id} className="p-4 bg-ink rounded-xl border border-hairline-dark space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{evt.title}</span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/30 uppercase">
                  {evt.impact} Impact
                </span>
              </div>
              <p className="text-xs text-muted-strong leading-relaxed">{evt.description}</p>
              <span className="text-[10px] font-mono text-muted block">
                Scheduled: {new Date(evt.date).toLocaleDateString("en-IN", { month: "long", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
