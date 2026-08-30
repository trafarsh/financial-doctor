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
    <div className="flex flex-col gap-6 px-8 py-8 max-w-6xl">
      {/* Header */}
      <div className="border-b-2 border-divider pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-heading font-800 text-ink">Market Intelligence</h1>
          <p className="text-xs text-ink/60 mt-0.5">
            Normalized market indices, equity fundamentals, and macroeconomic events.
          </p>
        </div>
        <span className="text-[11px] font-heading font-700 text-up bg-bg px-3 py-1.5 border border-divider">
          NSE / BSE DATA FEED
        </span>
      </div>

      {/* 1. Top Benchmark Indices Strip (mirrors dashboard "Market snapshot" language) */}
      <div className="bg-surface">
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-divider">
          <h3 className="text-base font-heading font-800 text-ink">Market snapshot</h3>
          <span className="text-[11px] text-ink/50 font-heading font-600">Delayed 15 min</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {indices.map((idx, i) => {
            const isUp = idx.changePct >= 0;
            return (
              <div
                key={idx.symbol}
                className={`grid grid-cols-[1fr_auto_auto] gap-3 items-center px-5 py-3.5 border-divider ${
                  i < indices.length - 1 ? "border-b" : ""
                } ${i % 2 === 0 ? "sm:border-r" : ""}`}
              >
                <div>
                  <div className="font-heading font-800 text-sm text-ink">{idx.name}</div>
                  <div className="text-xs text-ink/55">Index</div>
                </div>
                <div className="font-heading font-800 text-right text-ink">{idx.value.toLocaleString("en-IN")}</div>
                <div className={`text-xs font-semibold text-right ${isUp ? "text-up" : "text-accent"}`}>
                  {isUp ? "+" : ""}
                  {idx.change} ({isUp ? "+" : ""}
                  {idx.changePct}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Equities & Fundamentals Table */}
      <div className="bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-b-2 border-divider">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent" />
            <h3 className="text-base font-heading font-800 text-ink">Indian Equities &amp; Fundamentals</h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-ink/45 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ticker (Reliance, TCS...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-8"
              style={{ paddingLeft: "2rem" }}
            />
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="table">
            <thead>
              <tr>
                <th>Company / Symbol</th>
                <th className="text-right">Price (₹)</th>
                <th className="text-right">24h Change</th>
                <th className="text-right">Market Cap (₹ Cr)</th>
                <th className="text-right">P/E Ratio</th>
                <th className="text-right">Dividend Yield</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((q) => {
                const fund = fundamentals.find((f) => f.symbol === q.symbol);
                const isUp = q.change24hPct >= 0;
                return (
                  <tr key={q.symbol}>
                    <td>
                      <div className="font-semibold text-ink">{q.name}</div>
                      <div className="text-xs text-ink/45">
                        {q.symbol} · {fund?.sector || "NSE"}
                      </div>
                    </td>
                    <td className="font-heading font-700 text-ink text-right">₹{q.price.toLocaleString("en-IN")}</td>
                    <td className={`font-heading font-700 text-right ${isUp ? "text-up" : "text-accent"}`}>
                      {isUp ? "+" : ""}
                      {q.change24hPct}%
                    </td>
                    <td className="text-right text-ink/60">{fund ? `₹${fund.marketCap.toLocaleString("en-IN")}` : "—"}</td>
                    <td className="text-right text-ink/60">{fund?.peRatio ? `${fund.peRatio}x` : "—"}</td>
                    <td className="text-right text-ink/60">{fund?.dividendYield ? `${fund.dividendYield}%` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Macroeconomic Calendar Events */}
      <div className="bg-surface">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b-2 border-divider">
          <Calendar className="w-4 h-4 text-accent" />
          <h3 className="text-base font-heading font-800 text-ink">Economic Events &amp; Policy Calendar</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5">
          {events.map((evt) => (
            <div key={evt.id} className="p-4 border border-divider space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-heading font-800 text-ink">{evt.title}</span>
                <span className="tag tag-accent">{evt.impact} Impact</span>
              </div>
              <p className="text-xs text-ink/60 leading-relaxed">{evt.description}</p>
              <span className="text-[11px] text-ink/45 block">
                Scheduled: {new Date(evt.date).toLocaleDateString("en-IN", { month: "long", day: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
