"use client";

import React, { useEffect, useState } from "react";
import { Bell, AlertTriangle, AlertCircle, Check, X, ShieldAlert, TrendingDown, Info } from "lucide-react";
import { Alert } from "@/lib/types";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="border-b border-hairline-dark pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Notifications & Alerts</h1>
          </div>
          <p className="text-xs text-muted-strong mt-0.5">
            Automated alerts for concentration shifts, market shocks, and scam warnings.
          </p>
        </div>

        <span className="text-[10px] font-mono text-primary bg-ink px-3 py-1.5 rounded-lg border border-hairline-dark">
          {alerts.filter((a) => !a.read).length} UNREAD ALERTS
        </span>
      </div>

      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            let badgeBg = "bg-surface-elevated text-muted-strong";
            if (alert.severity === "high" || alert.severity === "critical") {
              badgeBg = "bg-trading-down/20 text-trading-down border border-trading-down/40";
            } else if (alert.severity === "medium") {
              badgeBg = "bg-primary/20 text-primary border border-primary/40";
            }

            return (
              <div
                key={alert.id}
                className={`double-bezel p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${
                  alert.read ? "opacity-75" : "border-primary/40"
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${badgeBg}`}>
                      {alert.severity}
                    </span>
                    <h3 className="text-xs font-bold text-white">{alert.title}</h3>
                    <span className="text-[10px] font-mono text-muted ml-auto sm:ml-2">
                      {new Date(alert.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-strong leading-relaxed">{alert.message}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!alert.read && (
                    <button
                      onClick={() => handleAction(alert.id, "read")}
                      className="text-[11px] bg-ink hover:bg-surface-elevated text-trading-up px-2.5 py-1 rounded border border-hairline-dark flex items-center gap-1 font-semibold"
                    >
                      <Check className="w-3 h-3" />
                      <span>Mark Read</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(alert.id, "dismiss")}
                    className="p-1 text-muted hover:text-trading-down"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="double-bezel p-8 text-center text-xs text-muted">
            No active alerts at this time.
          </div>
        )}
      </div>
    </div>
  );
}
