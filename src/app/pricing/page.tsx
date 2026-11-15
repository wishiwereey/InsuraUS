"use client";

import { ArrowRight, Check, Crown, Gift, Minus } from "lucide-react";
import Link from "next/link";
import { useBilling } from "@/components/providers/BillingProvider";
import {
  ANNUAL_SAVINGS_PCT,
  ANNUAL_SAVINGS_USD,
  FREE_TRIAL,
  PRICES,
  PRO_LIMITS,
  formatPrice,
  type BillingInterval,
} from "@/lib/billing/plans";

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
    "Is Pro worth it?",
    "Yearly Pro costs $89.99 — about $7.50 a month. A single fix — a duplicate add-on, a deductible that's too low, the wrong health plan — often saves more than that, and households commonly overpay by hundreds or even thousands a year. Paying $7.50 a month beats silently losing hundreds. Your free audit shows your exact number first.",
  ],
  [
    "Monthly or yearly?",
    "Insurance renews once a year, so yearly fits how you actually use it: audit every renewal and open enrollment, for $89.99 instead of $144. Prefer flexibility? Monthly is $12 and you can cancel anytime.",
  ],
  ["Can I cancel?", "Anytime, in one click from your Account page. No calls, no emails. See the Terms page for the full subscription policy."],
  [
    "Is this a real payment?",
    "No. This is a hackathon prototype: checkout runs in test mode, only test card numbers are accepted, and nothing is charged.",
  ],
];

const PRO_BULLETS = [
  "Unlimited audits",
  `Up to ${PRO_LIMITS.maxFiles} PDFs per audit`,
  "Unlimited Copilot questions",
  "Cancel anytime",
];

export default function PricingPage() {
  const { status, isPro } = useBilling();
  const ctaFor = (interval: BillingInterval) => (isPro ? "/account" : `/checkout?interval=${interval}`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">Pricing</p>
        <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Try it free. Pay only if it pays off.</h1>
        <p className="mt-4 text-lg text-muted">
          One free audit shows exactly how much you could save. Upgrade when you want to audit everything.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
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

        {/* Pro — monthly */}
        <div className="flex flex-col rounded-3xl border border-line bg-surface p-8 shadow-card">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-info-soft px-3 py-1 text-sm font-bold whitespace-nowrap text-info">
            <Crown className="size-4" /> Pro Monthly
          </span>
          <p className="mt-5">
            <span className="money text-5xl font-extrabold text-ink">{formatPrice(PRICES.month.amount)}</span>
            <span className="text-lg text-muted"> / month</span>
          </p>
          <p className="mt-2 text-base text-muted">Flexible. Try Pro for a month, cancel anytime.</p>
          <ul className="mt-6 space-y-3 text-base text-ink-soft">
            {PRO_BULLETS.map((b) => (
              <li key={b} className="flex gap-2">
                <Check className="mt-1 size-5 shrink-0 text-savings" /> {b}
              </li>
            ))}
          </ul>
          <Link
            href={ctaFor("month")}
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-base font-bold text-white transition hover:bg-ink-soft sm:mt-8"
          >
            {isPro ? "Manage subscription" : "Choose monthly"}
          </Link>
        </div>

        {/* Pro — yearly (highlighted) */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl bg-night p-8 text-white shadow-glow ring-2 ring-scan">
          <div className="absolute -right-24 -top-24 size-72 rounded-full bg-savings/20 blur-3xl" />
          <div className="relative flex flex-1 flex-col">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-scan/15 px-3 py-1 text-sm font-bold whitespace-nowrap text-scan">
                <Crown className="size-4" /> Pro Yearly
              </span>
              <span className="rounded-full bg-scan px-3 py-1 text-sm font-bold whitespace-nowrap text-night">Best value</span>
            </div>
            <p className="mt-5">
              <span className="money text-5xl font-extrabold">{formatPrice(PRICES.year.perMonth)}</span>
              <span className="text-lg text-slate-400"> / month</span>
            </p>
            <p className="money mt-2 text-base text-slate-300">
              <span className="text-slate-500 line-through">{formatPrice(PRICES.month.amount * 12)}</span>{" "}
              <span className="font-bold text-white">{formatPrice(PRICES.year.amount)} billed yearly</span>
            </p>
            <p className="money mt-1 text-base font-semibold text-scan">Save {ANNUAL_SAVINGS_PCT}% · {formatPrice(ANNUAL_SAVINGS_USD)} a year</p>
            <ul className="mt-6 space-y-3 text-base text-slate-200">
              {[...PRO_BULLETS, "Covers every renewal and open enrollment this year"].map((b) => (
                <li key={b} className="flex gap-2">
                  <Check className="mt-1 size-5 shrink-0 text-scan" /> {b}
                </li>
              ))}
            </ul>
            <Link
              href={ctaFor("year")}
              className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl bg-scan px-6 py-3.5 text-base font-bold text-night transition hover:bg-white sm:mt-8"
            >
              {isPro ? "Manage subscription" : "Choose yearly"} <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Value framing */}
      <div className="mt-12 grid items-center gap-6 rounded-3xl border border-savings/30 bg-savings-soft p-6 sm:p-8 md:grid-cols-[1fr_auto_1fr]">
        <div className="text-center md:text-left">
          <p className="text-sm font-bold tracking-widest text-risk-strong uppercase">Overpaying silently</p>
          <p className="money mt-1 text-4xl font-extrabold text-risk-strong">−$300 to −$2,000+</p>
          <p className="mt-1 text-base text-ink-soft">a year in typical leaks: low deductibles, duplicate add-ons, the wrong health plan</p>
        </div>
        <p className="text-center text-2xl font-extrabold text-muted">vs</p>
        <div className="text-center md:text-right">
          <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">InsuraUS Pro</p>
          <p className="money mt-1 text-4xl font-extrabold text-savings-strong">−$7.50/mo</p>
          <p className="mt-1 text-base text-ink-soft">to find and fix them — and re-check at every renewal</p>
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
      <p className="mt-8 text-center text-base text-muted">
        Full details in our{" "}
        <Link href="/terms" className="font-semibold text-ink underline underline-offset-4">
          Terms & subscription policy
        </Link>
        .
      </p>
    </div>
  );
}
