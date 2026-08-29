"use client";

import React, { useEffect, useState } from "react";
import { History, ShieldCheck, Lock, Search, RefreshCw, BookOpen } from "lucide-react";
import { AuditLog } from "@/lib/types";

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRoute, setFilterRoute] = useState<string>("all");

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit").then((r) => r.json());
      if (res.logs) setLogs(res.logs);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter((l) => (filterRoute === "all" ? true : l.route.includes(filterRoute)));

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-hairline-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <History className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">AI Compliance & Audit Trail</h1>
          </div>
          <p className="text-xs text-muted-strong mt-0.5">
            Immutable audit record of all AI operations, system prompts, retrieved citations, and user requests.
          </p>
        </div>

        <button
          onClick={fetchAuditLogs}
          className="p-2 bg-surface-card hover:bg-surface-elevated border border-hairline-dark text-muted-strong hover:text-white rounded-lg transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {["all", "scam-check", "copilot", "simulate", "risk"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterRoute(tab)}
            className={`px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border transition-all ${
              filterRoute === tab
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-ink border-hairline-dark text-muted-strong hover:text-white"
            }`}
          >
            {tab === "all" ? "All Operations" : tab}
          </button>
        ))}
      </div>

      {/* Audit Log Stream */}
      <div className="space-y-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="double-bezel p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-hairline-dark pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-ink border border-hairline-dark text-primary px-2 py-0.5 rounded">
                    {log.route}
                  </span>
                  <span className="text-xs font-bold text-white">{log.action}</span>
                </div>
                <span className="text-[10px] font-mono text-muted">
                  {new Date(log.createdAt).toLocaleString("en-IN")} · Model: {log.model}
                </span>
              </div>

              {/* Prompt */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                  Prompt Ingested:
                </span>
                <div className="p-3 bg-ink rounded-lg border border-hairline-dark text-xs text-muted-strong font-mono leading-relaxed line-clamp-3">
                  {log.prompt}
                </div>
              </div>

              {/* Response */}
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-muted uppercase tracking-wider block">
                  Structured Response Produced:
                </span>
                <div className="p-3 bg-ink rounded-lg border border-hairline-dark text-xs text-body font-mono leading-relaxed line-clamp-4">
                  {log.response}
                </div>
              </div>

              {/* Sources attached */}
              {log.sources && log.sources.length > 0 && (
                <div className="text-[11px] text-muted pt-1">
                  <strong className="text-muted-strong">Sources Grounded:</strong> {log.sources.map((s) => s.title).join(" | ")}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="double-bezel p-8 text-center text-xs text-muted">
            No audit logs recorded yet. Perform a risk analysis or scam check to generate audit trails.
          </div>
        )}
      </div>
    </div>
  );
}
