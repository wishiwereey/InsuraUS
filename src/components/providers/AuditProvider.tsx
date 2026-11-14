"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { AnalyzeResponse, ApiError, UserContext } from "@/types/insurance";
import type { DemoPreset } from "@/lib/presets";
import { SAMPLE_DOCS } from "@/lib/samples-meta";
import { clearAudit, loadAudit, loadFiles, saveAudit, saveFiles } from "@/lib/storage";
import type { PaywallReason } from "@/lib/billing/plans";
import { useBilling } from "./BillingProvider";

export type AuditStatus = "idle" | "analyzing" | "done" | "error";

interface AuditState {
  status: AuditStatus;
  files: File[];
  context: UserContext;
  result: AnalyzeResponse | null;
  error: string | null;
  /** Set when the server refused the audit because of plan limits. */
  paywall: PaywallReason | null;
  /** True once we've tried to restore a previous audit from storage. */
  hydrated: boolean;
  activePreset: string | null;
  setFiles: (files: File[]) => void;
  setContext: (ctx: UserContext) => void;
  runAudit: (files?: File[], ctx?: UserContext) => Promise<void>;
  runPreset: (preset: DemoPreset) => Promise<void>;
  reset: () => void;
}

const AuditContext = createContext<AuditState | null>(null);

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be used inside <AuditProvider>");
  return ctx;
}

async function fetchSampleFiles(preset: DemoPreset): Promise<File[]> {
  return Promise.all(
    preset.docs.map(async (id) => {
      const res = await fetch(`/api/samples/${id}`);
      if (!res.ok) throw new Error("Could not generate the sample policy PDFs.");
      return new File([await res.blob()], SAMPLE_DOCS[id].fileName, { type: "application/pdf" });
    }),
  );
}

/**
 * App-wide audit state. Lives in the root layout so the audit survives
 * navigation between /audit and the /results/* tabs, and is restored from
 * browser storage after a refresh.
 */
export function AuditProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<AuditStatus>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [context, setContext] = useState<UserContext>({});
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<PaywallReason | null>(null);
  const billing = useBilling();
  const [hydrated, setHydrated] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const runId = useRef(0);

  useEffect(() => {
    const saved = loadAudit();
    if (!saved) {
      setHydrated(true);
      return;
    }
    setResult(saved.result);
    setContext(saved.context);
    setStatus("done");
    loadFiles()
      .then(setFiles)
      .finally(() => setHydrated(true));
  }, []);

  const runAudit = useCallback(
    async (docs?: File[], ctx?: UserContext) => {
      const useFiles = docs ?? files;
      const useCtx = ctx ?? context;
      if (useFiles.length === 0) return;
      const id = ++runId.current;
      setError(null);
      setPaywall(null);
      setStatus("analyzing");
      if (pathname !== "/audit") router.push("/audit");
      window.scrollTo({ top: 0, behavior: "smooth" });

      try {
        const form = new FormData();
        useFiles.forEach((f) => form.append("files", f));
        form.append("context", JSON.stringify(useCtx));
        const res = await fetch("/api/analyze", { method: "POST", body: form });
        const body = (await res.json().catch(() => ({ error: `The server returned an unexpected response (${res.status}).` }))) as
          | AnalyzeResponse
          | ApiError;
        if (!res.ok || "error" in body) {
          if ("code" in body && body.code === "PAYWALL" && body.reason && id === runId.current) {
            setPaywall(body.reason);
            setStatus("error");
            setError(body.error);
            return;
          }
          throw new Error("error" in body ? body.error : `Request failed (${res.status}).`);
        }
        if (id !== runId.current) return; // superseded by a newer run / reset
        setResult(body);
        setStatus("done");
        saveAudit({ result: body, context: useCtx });
        void saveFiles(useFiles);
        void billing.refresh();
        router.push("/results");
      } catch (err) {
        if (id !== runId.current) return;
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        setStatus("error");
      } finally {
        if (id === runId.current) setActivePreset(null);
      }
    },
    [files, context, pathname, router, billing],
  );

  const runPreset = useCallback(
    async (preset: DemoPreset) => {
      setActivePreset(preset.id);
      setError(null);
      try {
        const docs = await fetchSampleFiles(preset);
        setFiles(docs);
        setContext(preset.context);
        await runAudit(docs, preset.context);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load the demo.");
        setStatus("error");
        setActivePreset(null);
      }
    },
    [runAudit],
  );

  const reset = useCallback(() => {
    runId.current++;
    setStatus("idle");
    setResult(null);
    setFiles([]);
    setError(null);
    setPaywall(null);
    setActivePreset(null);
    clearAudit();
    router.push("/audit");
  }, [router]);

  const value = useMemo<AuditState>(
    () => ({ status, files, context, result, error, paywall, hydrated, activePreset, setFiles, setContext, runAudit, runPreset, reset }),
    [status, files, context, result, error, paywall, hydrated, activePreset, runAudit, runPreset, reset],
  );

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}
