"use client";

import { ArrowRight, Check, Crown, Gift, Minus } from "lucide-react";
import Link from "next/link";
import { useBilling } from "@/components/providers/BillingProvider";
import { FREE_TRIAL, PRO_LIMITS, PRO_PRICE_USD } from "@/lib/billing/plans";

const ROWS: [string, string, string][] = [
  ["Audits of your own policies", `${FREE_TRIAL.audits} free audit`, "Unlimited"],
  ["PDFs per audit", `Up to ${FREE_TRIAL.maxFiles}`, `Up to ${PRO_LIMITS.maxFiles}`],
  ["Policy Copilot questions", `${FREE_TRIAL.chatQuestions}`, "Unlimited"],
  ["Health score, stress test & negotiation script", "✓", "✓"],
  ["Sample household demos", "Always free", "Always free"],
];

const FAQ = [
  [
    "Why a subscription and not a commission?",
    "We never take money from insurers or a cut of the policy you switch to. A flat fee means our only incentive is to find you the best deal.",
  ],
  [
    "How much can I save?",
    "Your free audit shows the exact estimated savings for your own policies before you pay anything. If $12 isn't clearly worth it, don't upgrade.",
  ],
  ["Can I cancel?", "Anytime, in one click from your Account page."],
  [
    "Is this a real payment?",
    "No. This is a hackathon prototype: checkout runs in test mode, only test card numbers are accepted, and nothing is charged.",
  ],
];

export default function PricingPage() {
  const { status, isPro } = useBilling();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">Pricing</p>
        <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Try it free. Pay only if it pays off.</h1>
        <p className="mt-4 text-lg text-muted">
          One free audit shows exactly how much you could save. Upgrade when you want to audit everything.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {/* Free */}
        <div className="flex flex-col rounded-3xl border border-line bg-surface p-8 shadow-card">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-canvas px-3 py-1 text-sm font-bold text-ink-soft">
            <Gift className="size-4" /> Free trial
          </span>
          <p className="mt-5">
            <span className="money text-5xl font-extrabold text-ink">$0</span>
          </p>
          <p className="mt-2 text-base text-muted">See your savings before you pay anything.</p>
          <ul className="mt-6 space-y-3 text-base text-ink-soft">
            <li className="flex gap-2"><Check className="mt-1 size-5 shrink-0 text-savings" /> {FREE_TRIAL.audits} audit of your own policies</li>
            <li className="flex gap-2"><Check className="mt-1 size-5 shrink-0 text-savings" /> Up to {FREE_TRIAL.maxFiles} PDFs</li>
            <li className="flex gap-2"><Check className="mt-1 size-5 shrink-0 text-savings" /> {FREE_TRIAL.chatQuestions} Copilot questions</li>
            <li className="flex gap-2"><Check className="mt-1 size-5 shrink-0 text-savings" /> Full report & negotiation script</li>
          </ul>
          <Link
            href="/audit"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl border border-line px-6 py-3.5 text-base font-bold text-ink transition hover:bg-canvas"
          >
            {status && !isPro && status.trialAuditsLeft === 0 ? "Trial used" : "Start free audit"}
          </Link>
        </div>

        {/* Pro */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-night p-8 text-white shadow-glow">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-savings/20 blur-3xl" />
          <div className="relative flex flex-1 flex-col">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-scan/15 px-3 py-1 text-sm font-bold text-scan">
                <Crown className="size-4" /> Pro
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold text-slate-200">Most popular</span>
            </div>
            <p className="mt-5">
              <span className="money text-5xl font-extrabold">${PRO_PRICE_USD}</span>
              <span className="text-lg text-slate-400"> / month</span>
            </p>
            <p className="mt-2 text-base text-slate-300">For households with several policies and yearly renewals.</p>
            <ul className="mt-6 space-y-3 text-base text-slate-200">
              <li className="flex gap-2"><Check className="mt-1 size-5 shrink-0 text-scan" /> Unlimited audits</li>
              <li className="flex gap-2"><Check className="mt-1 size-5 shrink-0 text-scan" /> Up to {PRO_LIMITS.maxFiles} PDFs per audit</li>
              <li className="flex gap-2"><Check className="mt-1 size-5 shrink-0 text-scan" /> Unlimited Copilot questions</li>
              <li className="flex gap-2"><Check className="mt-1 size-5 shrink-0 text-scan" /> Cancel anytime</li>
            </ul>
            <Link
              href={isPro ? "/account" : "/checkout"}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-scan px-6 py-3.5 text-base font-bold text-night transition hover:bg-white sm:mt-8"
            >
              {isPro ? "Manage subscription" : "Upgrade to Pro"} <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="mt-12 overflow-x-auto rounded-3xl border border-line bg-surface shadow-card">
        <table className="w-full min-w-[520px] text-left text-base">
          <thead>
            <tr className="border-b border-line text-sm text-muted">
              <th className="px-6 py-4 font-semibold">Feature</th>
              <th className="px-6 py-4 font-semibold">Free trial</th>
              <th className="px-6 py-4 font-semibold">Pro</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([f, free, pro]) => (
              <tr key={f} className="border-b border-line last:border-0">
                <td className="px-6 py-4 font-semibold text-ink">{f}</td>
                <td className="px-6 py-4 text-ink-soft">{free === "—" ? <Minus className="size-4" /> : free}</td>
                <td className="px-6 py-4 font-semibold text-savings-strong">{pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {FAQ.map(([q, a]) => (
          <div key={q} className="rounded-3xl border border-line bg-surface p-6">
            <h3 className="text-lg font-bold text-ink">{q}</h3>
            <p className="mt-2 text-base text-muted">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
