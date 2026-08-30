"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Alert } from "@/lib/types";

type FilterTab = "all" | "critical" | "unread";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  const fetchAlerts = async () => {
    try {
      const res = await fetch("/api/alerts").then((r) => r.json());
      if (res.alerts) setAlerts(res.alerts);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAction = async (alertId: string, action: "read" | "dismiss") => {
    try {
      await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alertId, action }),
      });

      if (action === "dismiss") {
        setAlerts((prev) => prev.filter((a) => a.id !== alertId));
      } else {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
        );
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = alerts.filter((a) => !a.read);
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    await Promise.all(unread.map((a) => handleAction(a.id, "read")));
  };

  const filteredAlerts = useMemo(() => {
    if (filter === "critical") return alerts.filter((a) => a.severity === "critical" || a.severity === "high");
    if (filter === "unread") return alerts.filter((a) => !a.read);
    return alerts;
  }, [alerts, filter]);

  const severityClass = (severity: Alert["severity"]) => {
    if (severity === "critical") return "badge-critical";
    if (severity === "high") return "badge-high";
    if (severity === "medium") return "badge-medium";
    return "badge-low";
  };

  return (
    <div className="flex flex-col gap-6 px-8 py-8 w-full max-w-6xl">
      {/* Topbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-4 border-b-2 border-divider mb-6">
        <div className="kicker">Alerts</div>
        <div className="sm:ml-auto flex flex-wrap gap-2">
          <div className="seg">
            <button className={`seg-opt ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              All
            </button>
            <button className={`seg-opt ${filter === "critical" ? "active" : ""}`} onClick={() => setFilter("critical")}>
              Critical
            </button>
            <button className={`seg-opt ${filter === "unread" ? "active" : ""}`} onClick={() => setFilter("unread")}>
              Unread
            </button>
          </div>
          <button className="btn btn-secondary" onClick={handleMarkAllRead}>
            Mark all read
          </button>
        </div>
      </div>

      {loading && <div className="kicker">Loading alerts…</div>}

      <div>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const emphasized = !alert.read || alert.severity === "critical" || alert.severity === "high";
            const dimmed = alert.read && alert.severity === "low";

            return (
              <div
                key={alert.id}
                className={`grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-3 sm:gap-4 items-start sm:items-center py-4 px-2 sm:px-4 border-b border-divider ${
                  emphasized ? "bg-accent-100" : ""
                } ${dimmed ? "opacity-60" : ""}`}
              >
                <span className={`badge-severity ${severityClass(alert.severity)}`}>{alert.severity}</span>
                <div>
                  <div className="font-heading font-extrabold text-sm mb-1 text-ink">{alert.title}</div>
                  <div className="text-[12.5px] text-muted leading-relaxed">{alert.message}</div>
                </div>
                <div className="text-[11px] text-muted font-heading font-semibold whitespace-nowrap">
                  {new Date(alert.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                </div>
                <div className="flex gap-1.5">
                  {!alert.read && (
                    <button
                      onClick={() => handleAction(alert.id, "read")}
                      className="btn btn-secondary"
                      style={{ fontSize: 11, padding: "4px 10px" }}
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(alert.id, "dismiss")}
                    className="btn-icon flex items-center justify-center text-muted hover:text-accent"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card text-center text-xs text-muted py-8">No active alerts at this time.</div>
        )}
      </div>
    </div>
  );
}
