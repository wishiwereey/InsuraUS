"use client";

import type { AnalyzeResponse, UserContext } from "@/types/insurance";

/**
 * Per-browser persistence so a page refresh doesn't lose the audit.
 * - Audit JSON + context → sessionStorage (small, tab-scoped).
 * - Uploaded PDFs → IndexedDB (File objects are structured-cloneable; can be MBs).
 * Nothing leaves the browser; everything is wrapped in try/catch because
 * storage can be unavailable (private mode, blocked site data).
 */

const SESSION_KEY = "insuraus:audit:v1";
const DB_NAME = "insuraus";
const STORE = "files";

export interface PersistedAudit {
  result: AnalyzeResponse;
  context: UserContext;
}

export function saveAudit(data: PersistedAudit) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    /* storage unavailable — in-memory state still works */
  }
}

export function loadAudit(): PersistedAudit | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as PersistedAudit) : null;
  } catch {
    return null;
  }
}

export function clearAudit() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  void saveFiles([]);
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFiles(files: File[]) {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(files, "current");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* ignore */
  }
}

export async function loadFiles(): Promise<File[]> {
  try {
    const db = await openDb();
    const files = await new Promise<File[]>((resolve, reject) => {
      const req = db.transaction(STORE, "readonly").objectStore(STORE).get("current");
      req.onsuccess = () => resolve((req.result as File[] | undefined) ?? []);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return files;
  } catch {
    return [];
  }
}
