import Dexie, { type EntityTable } from "dexie";
import { useCallback, useEffect, useState } from "react";

export type Quote = {
  id: string; body: string; speakers: string[]; season: number; episode: number;
  title: string; favorite: boolean; queued: boolean; postedAt?: string; notes?: string;
  createdAt: string; updatedAt?: string; revision?: number; deviceId?: string;
};

type OutboxItem = Quote & { queuedAt: string };
const db = new Dexie("frasier-archive") as Dexie & {
  quotes: EntityTable<Quote, "id">;
  outbox: EntityTable<OutboxItem, "id">;
};
db.version(2).stores({ quotes: "id, createdAt, updatedAt, season, episode, queued, favorite", outbox: "id, queuedAt" });

const deviceId = (() => {
  const existing = localStorage.getItem("frasier-device-id");
  if (existing) return existing;
  const next = crypto.randomUUID();
  localStorage.setItem("frasier-device-id", next);
  return next;
})();

function fromServer(row: Record<string, unknown>): Quote {
  return {
    id: String(row.id), body: String(row.body),
    speakers: Array.isArray(row.speakers) ? row.speakers.map(String) : JSON.parse(String(row.speakers || "[]")),
    season: Number(row.season), episode: Number(row.episode), title: String(row.title || ""),
    favorite: Boolean(row.favorite), queued: Boolean(row.queued),
    postedAt: row.postedAt ? String(row.postedAt) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    createdAt: String(row.createdAt), updatedAt: String(row.updatedAt),
    revision: Number(row.revision || 1), deviceId: row.deviceId ? String(row.deviceId) : undefined
  };
}

export function useQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [ready, setReady] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Synced");

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) { setSyncStatus("Offline ready"); return; }
    setSyncStatus("Syncing…");
    try {
      const pending = await db.outbox.toArray();
      if (pending.length) {
        const response = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ changes: pending }) });
        if (!response.ok) throw new Error("Sync rejected");
        const result = await response.json() as { accepted: string[] };
        await db.outbox.bulkDelete(result.accepted);
      }
      const response = await fetch("/api/bootstrap", { cache: "no-store" });
      if (!response.ok) throw new Error("Bootstrap failed");
      const payload = await response.json() as { quotes: Record<string, unknown>[] };
      const remote = payload.quotes.map(fromServer);
      const waiting = new Set((await db.outbox.toArray()).map(item => item.id));
      const local = await db.quotes.toArray();
      const merged = new Map(remote.map(q => [q.id, q]));
      local.forEach(q => { if (waiting.has(q.id) || !merged.has(q.id)) merged.set(q.id, q); });
      const next = [...merged.values()].sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      await db.quotes.bulkPut(next);
      setQuotes(next);
      setSyncStatus("Synced");
    } catch {
      const waiting = await db.outbox.count();
      setSyncStatus(waiting ? `${waiting} waiting` : "Sync problem");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const local = await db.quotes.orderBy("createdAt").reverse().toArray();
      if (active) { setQuotes(local); setReady(true); }
      await syncNow();
      if (navigator.storage?.persist) void navigator.storage.persist();
    })();
    const online = () => void syncNow();
    const visible = () => { if (document.visibilityState === "visible") void syncNow(); };
    addEventListener("online", online);
    document.addEventListener("visibilitychange", visible);
    return () => { active = false; removeEventListener("online", online); document.removeEventListener("visibilitychange", visible); };
  }, [syncNow]);

  const save = useCallback((next: Quote[]) => {
    const now = new Date().toISOString();
    const normalized = next.map(q => ({ ...q, updatedAt: now, revision: (q.revision || 0) + 1, deviceId }));
    setQuotes(normalized);
    void db.transaction("rw", db.quotes, db.outbox, async () => {
      await db.quotes.clear();
      await db.quotes.bulkPut(normalized);
      await db.outbox.bulkPut(normalized.map(q => ({ ...q, queuedAt: now })));
    }).then(syncNow);
  }, [syncNow]);

  return { quotes, save, ready, syncStatus, syncNow };
}
