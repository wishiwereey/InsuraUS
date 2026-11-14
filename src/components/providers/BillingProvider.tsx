"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { FREE_TRIAL, PRO_LIMITS, type BillingStatus } from "@/lib/billing/plans";

interface BillingState {
  status: BillingStatus | null;
  isPro: boolean;
  /** Max PDFs of the user's own the uploader accepts on the current plan. */
  maxFiles: number;
  refresh: () => Promise<void>;
  checkout: (card: { last4: string; brand: "Visa" | "Mastercard" }) => Promise<void>;
  cancel: () => Promise<void>;
  resetDemo: () => Promise<void>;
}

const BillingContext = createContext<BillingState | null>(null);

export function useBilling() {
  const ctx = useContext(BillingContext);
  if (!ctx) throw new Error("useBilling must be used inside <BillingProvider>");
  return ctx;
}

async function call(url: string, init?: RequestInit): Promise<BillingStatus> {
  const res = await fetch(url, { cache: "no-store", ...init });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Billing request failed.");
  return body as BillingStatus;
}

/** Client mirror of the server-signed billing cookies (the server remains the source of truth). */
export function BillingProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<BillingStatus | null>(null);

  const refresh = useCallback(async () => {
    try {
      setStatus(await call("/api/billing/status"));
    } catch {
      /* keep last known status */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const checkout = useCallback(async (card: { last4: string; brand: "Visa" | "Mastercard" }) => {
    setStatus(
      await call("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      }),
    );
  }, []);

  const cancel = useCallback(async () => setStatus(await call("/api/billing/cancel", { method: "POST" })), []);
  const resetDemo = useCallback(async () => setStatus(await call("/api/billing/reset", { method: "POST" })), []);

  const value = useMemo<BillingState>(() => {
    const isPro = status?.plan === "pro";
    return {
      status,
      isPro,
      maxFiles: isPro ? PRO_LIMITS.maxFiles : FREE_TRIAL.maxFiles,
      refresh,
      checkout,
      cancel,
      resetDemo,
    };
  }, [status, refresh, checkout, cancel, resetDemo]);

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}
