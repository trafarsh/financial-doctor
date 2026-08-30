// ============================================================
// FINANCIAL DOCTOR (finX) — Speed-Sync Offline Core
// IndexedDB-backed write queue for offline-first data entry.
// Any client component can enqueue a POST; it plays back against the
// same endpoint once connectivity returns. No service worker: this
// relies on navigator.onLine + the window "online" event, which is
// enough while the tab stays open (the realistic case for a rural
// user re-entering a spotty connection, not a closed-tab background
// sync guarantee).
// ============================================================

const DB_NAME = "finx-offline-queue";
const DB_VERSION = 1;
const STORE_NAME = "pending_writes";

export interface QueuedWrite {
  id: string;
  route: string;              // API route to POST to, e.g. "/api/debt/compare"
  body: unknown;               // JSON-serializable request body
  createdAt: string;           // ISO timestamp, used for most-recent-wins conflict resolution
  status: "pending" | "syncing" | "synced" | "failed";
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB unavailable in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const req = fn(store);
    tx.oncomplete = () => resolve((req as IDBRequest<T>)?.result as T);
    tx.onerror = () => reject(tx.error);
  });
}

/** Queue a write locally. Call this instead of fetch() when the app might be offline. */
export async function enqueueWrite(route: string, body: unknown): Promise<QueuedWrite> {
  const entry: QueuedWrite = {
    id: `qw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    route,
    body,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  await withStore("readwrite", (store) => store.put(entry));
  return entry;
}

export async function getPendingWrites(): Promise<QueuedWrite[]> {
  const all = await withStore<QueuedWrite[]>("readonly", (store) => store.getAll() as unknown as IDBRequest<QueuedWrite[]>);
  return (all || []).filter((w) => w.status === "pending" || w.status === "failed");
}

async function updateWrite(id: string, patch: Partial<QueuedWrite>): Promise<void> {
  const existing = await withStore<QueuedWrite>("readonly", (store) => store.get(id) as unknown as IDBRequest<QueuedWrite>);
  if (!existing) return;
  await withStore("readwrite", (store) => store.put({ ...existing, ...patch }));
}

export async function removeSyncedWrite(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

/**
 * Attempt to flush every pending write, most-recent-first is not needed here
 * since each queued write targets its own record — conflict resolution for
 * concurrent edits to the *same* logical record is the caller's job (compare
 * createdAt and keep the newer one), this only guarantees each queued write
 * is eventually sent.
 */
export async function flushQueue(
  onResult?: (write: QueuedWrite, ok: boolean) => void
): Promise<{ succeeded: number; failed: number }> {
  const pending = await getPendingWrites();
  let succeeded = 0;
  let failed = 0;

  for (const write of pending) {
    await updateWrite(write.id, { status: "syncing" });
    try {
      const res = await fetch(write.route, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(write.body),
      });
      if (!res.ok) throw new Error(`Sync failed with status ${res.status}`);
      await removeSyncedWrite(write.id);
      succeeded++;
      onResult?.(write, true);
    } catch {
      await updateWrite(write.id, { status: "failed" });
      failed++;
      onResult?.(write, false);
    }
  }

  return { succeeded, failed };
}

type SyncListener = (state: { syncing: boolean; pendingCount: number }) => void;
const listeners = new Set<SyncListener>();
let flushing = false;

async function notify() {
  const pending = await getPendingWrites();
  listeners.forEach((l) => l({ syncing: flushing, pendingCount: pending.length }));
}

async function runFlush() {
  if (flushing) return;
  flushing = true;
  await notify();
  await flushQueue();
  flushing = false;
  await notify();
}

/** Call once (e.g. in a root client component) to wire auto-flush on reconnect. */
export function initOfflineSync() {
  if (typeof window === "undefined") return () => {};

  const handleOnline = () => {
    void runFlush();
  };

  window.addEventListener("online", handleOnline);
  if (navigator.onLine) void runFlush();

  return () => window.removeEventListener("online", handleOnline);
}

export function onSyncStateChange(listener: SyncListener): () => void {
  listeners.add(listener);
  void notify();
  return () => listeners.delete(listener);
}

/**
 * Convenience wrapper: POST if online, otherwise queue for later.
 * Returns { ok: true, offline: true } when queued rather than sent.
 */
export async function postWithOfflineFallback(
  route: string,
  body: unknown
): Promise<{ ok: boolean; offline: boolean; data?: any; error?: string }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    await enqueueWrite(route, body);
    void notify();
    return { ok: true, offline: true };
  }

  try {
    const res = await fetch(route, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    const data = await res.json();
    return { ok: true, offline: false, data };
  } catch {
    // Network dropped mid-request — queue instead of losing the entry.
    await enqueueWrite(route, body);
    void notify();
    return { ok: true, offline: true };
  }
}
