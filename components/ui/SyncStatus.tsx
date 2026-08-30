"use client";

import React, { useEffect, useState } from "react";
import { CloudOff, RefreshCw, CheckCheck } from "lucide-react";
import { initOfflineSync, onSyncStateChange } from "@/lib/offlineQueue";

export function SyncStatus() {
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setOnline(navigator.onLine);
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const cleanupSync = initOfflineSync();
    const unsubscribe = onSyncStateChange(({ syncing, pendingCount }) => {
      setSyncing(syncing);
      setPendingCount(pendingCount);
    });

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      cleanupSync();
      unsubscribe();
    };
  }, []);

  if (online && pendingCount === 0 && !syncing) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 border-2 border-ink bg-bg text-xs font-heading font-700 shadow-[3px_3px_0_var(--color-ink)]"
      role="status"
      aria-live="polite"
    >
      {!online ? (
        <>
          <CloudOff className="w-4 h-4 text-accent" />
          <span>Offline — {pendingCount > 0 ? `${pendingCount} change${pendingCount === 1 ? "" : "s"} queued` : "changes will queue locally"}</span>
        </>
      ) : syncing ? (
        <>
          <RefreshCw className="w-4 h-4 animate-spin text-accent" />
          <span>Syncing {pendingCount > 0 ? `${pendingCount} change${pendingCount === 1 ? "" : "s"}` : ""}...</span>
        </>
      ) : (
        <>
          <CheckCheck className="w-4 h-4 text-up" />
          <span>All changes synced</span>
        </>
      )}
    </div>
  );
}
