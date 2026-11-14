"use client";

import { Crown, Gift, Loader2, Receipt, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { UpgradeCard } from "@/components/billing/UpgradeCard";
import { useBilling } from "@/components/providers/BillingProvider";
import { FREE_TRIAL, PRO_PRICE_USD } from "@/lib/billing/plans";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function AccountPage() {
  const { status, isPro, cancel, resetDemo } = useBilling();
  const [busy, setBusy] = useState<"cancel" | "reset" | null>(null);

  if (!status) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-3 text-lg text-muted">
        <Loader2 className="size-5 animate-spin" /> Loading account…
      </div>
    );
  }

  const run = async (kind: "cancel" | "reset", fn: () => Promise<void>) => {
    setBusy(kind);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">Account</p>
      <h1 className="mt-3 text-4xl font-extrabold text-ink">Plan & billing</h1>

      <section className="mt-8 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-muted">Current plan</p>
            <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold text-ink">
              {isPro ? <Crown className="size-6 text-savings" /> : <Gift className="size-6 text-muted" />}
              {isPro ? `Pro · $${PRO_PRICE_USD}/month` : "Free trial"}
            </p>
          </div>
          {isPro && status.pro && (
            <button
              onClick={() => run("cancel", cancel)}
              disabled={!!busy}
              className="rounded-xl border border-line px-5 py-2.5 text-base font-semibold text-risk-strong transition hover:border-risk/40 hover:bg-risk-soft disabled:opacity-60"
            >
              {busy === "cancel" ? "Cancelling…" : "Cancel subscription"}
            </button>
          )}
        </div>

        {isPro && status.pro ? (
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-canvas p-4">
              <dt className="text-sm text-muted">Member since</dt>
              <dd className="mt-1 text-lg font-bold text-ink">{fmt(status.pro.since)}</dd>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <dt className="text-sm text-muted">Renews on</dt>
              <dd className="mt-1 text-lg font-bold text-ink">{fmt(status.pro.renewsAt)}</dd>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <dt className="text-sm text-muted">Payment method</dt>
              <dd className="money mt-1 text-lg font-bold text-ink">
                {status.pro.brand} •••• {status.pro.last4}
              </dd>
            </div>
          </dl>
        ) : (
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-canvas p-4">
              <dt className="text-sm text-muted">Free audits left</dt>
              <dd className="money mt-1 text-2xl font-extrabold text-ink">
                {status.trialAuditsLeft} <span className="text-base font-semibold text-muted">of {FREE_TRIAL.audits}</span>
              </dd>
            </div>
            <div className="rounded-2xl bg-canvas p-4">
              <dt className="text-sm text-muted">Copilot questions left</dt>
              <dd className="money mt-1 text-2xl font-extrabold text-ink">
                {status.trialChatsLeft} <span className="text-base font-semibold text-muted">of {FREE_TRIAL.chatQuestions}</span>
              </dd>
            </div>
          </dl>
        )}
      </section>

      {isPro && status.pro ? (
        <section className="mt-6 rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
            <Receipt className="size-5" /> Invoices
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-base">
              <thead>
                <tr className="text-sm text-muted">
                  <th className="pb-2 font-semibold">Invoice</th>
                  <th className="pb-2 font-semibold">Date</th>
                  <th className="pb-2 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-line">
                  <td className="money py-3 font-semibold text-ink">{status.pro.invoiceId}</td>
                  <td className="py-3 text-ink-soft">{fmt(status.pro.since)}</td>
                  <td className="money py-3 text-ink-soft">${PRO_PRICE_USD}.00</td>
                  <td className="py-3">
                    <span className="rounded-full bg-warn-soft px-2.5 py-1 text-sm font-semibold text-warn-strong">Paid · test mode</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <UpgradeCard className="mt-6" message="Unlock unlimited audits" />
      )}

      <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl border border-dashed border-line-strong p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-base font-bold text-ink">Demo controls</p>
          <p className="text-base text-muted">Reset to a fresh free trial — handy for demoing the paywall again.</p>
        </div>
        <button
          onClick={() => run("reset", resetDemo)}
          disabled={!!busy}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-line bg-surface px-5 py-2.5 text-base font-semibold text-ink transition hover:bg-canvas disabled:opacity-60"
        >
          <RotateCcw className="size-4" /> {busy === "reset" ? "Resetting…" : "Reset demo billing"}
        </button>
      </section>

      <p className="mt-6 text-sm text-muted">
        Prototype billing: no accounts, no real payments. Plan state is stored in signed browser cookies.{" "}
        <Link href="/pricing" className="font-semibold text-ink underline-offset-4 hover:underline">
          See pricing
        </Link>
      </p>
    </div>
  );
}
