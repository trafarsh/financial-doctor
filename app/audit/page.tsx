"use client";

import React, { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
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
    <div className="flex flex-col gap-6 px-4 py-6 md:px-8 md:py-8 w-full max-w-6xl">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b-2 border-divider mb-6">
        <div>
          <div className="kicker">Audit log</div>
          <h1 className="text-2xl font-heading font-extrabold text-ink mt-1">AI compliance &amp; audit trail</h1>
          <p className="text-xs text-muted mt-1 max-w-lg">
            Immutable audit record of all AI operations, system prompts, retrieved citations, and user requests.
          </p>
        </div>
        <button onClick={fetchAuditLogs} className="btn btn-secondary sm:ml-auto self-start">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter segmented control */}
      <div className="seg mb-6 self-start">
        {["all", "scam-check", "copilot", "simulate", "risk"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterRoute(tab)}
            className={`seg-opt ${filterRoute === tab ? "active" : ""}`}
          >
            {tab === "all" ? "All operations" : tab}
          </button>
        ))}
      </div>

      {/* Audit log stream */}
      <div className="flex flex-col gap-4">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log.id} className="border-2 border-divider p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-divider pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-heading font-bold border border-divider text-accent px-2 py-0.5">
                    {log.route}
                  </span>
                  <span className="text-xs font-bold text-ink">{log.action}</span>
                </div>
                <span className="text-[10px] font-heading text-muted">
                  {new Date(log.createdAt).toLocaleString("en-IN")} · Model: {log.model}
                </span>
              </div>

              {/* Prompt */}
              <div className="mb-3">
                <span className="kicker block mb-1.5">Prompt ingested</span>
                <div className="p-3 border border-divider text-xs text-muted leading-relaxed line-clamp-3">
                  {log.prompt}
                </div>
              </div>

              {/* Response */}
              <div className="mb-3">
                <span className="kicker block mb-1.5">Structured response produced</span>
                <div className="p-3 border border-divider text-xs text-ink leading-relaxed line-clamp-4">
                  {log.response}
                </div>
              </div>

              {/* Sources attached */}
              {log.sources && log.sources.length > 0 && (
                <div className="text-[11px] text-muted pt-1">
                  <strong className="text-ink">Sources grounded:</strong> {log.sources.map((s) => s.title).join(" | ")}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card text-center text-xs text-muted py-8">
            No audit logs recorded yet. Perform a risk analysis or scam check to generate audit trails.
          </div>
        )}
      </div>
    </div>
  );
}
