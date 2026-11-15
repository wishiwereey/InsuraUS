"use client";

import { ArrowRight, Check, CheckCircle2, CreditCard, FlaskConical, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PRO_FEATURES } from "@/components/billing/UpgradeCard";
import { useBilling } from "@/components/providers/BillingProvider";
import {
  ANNUAL_SAVINGS_PCT,
  ANNUAL_SAVINGS_USD,
  PRICES,
  TEST_CARD_NUMBERS,
  formatPrice,
  isBillingInterval,
  type BillingInterval,
} from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const field =
  "h-12 w-full rounded-xl border border-line bg-surface px-4 text-base text-ink shadow-card transition focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/5";

const formatCard = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const formatExp = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

/**
 * PROTOTYPE checkout. Runs entirely in test mode: only published test card
 * numbers are accepted, the full card number never leaves this page, and
 * nothing is charged. Swap for Stripe Checkout to go live.
 */
export default function CheckoutPage() {
  const { isPro, checkout, status } = useBilling();
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  // Yearly is the default (best value); /checkout?interval=month preselects monthly.
  const [interval, setBillingInterval] = useState<BillingInterval>("year");
  const price = PRICES[interval];

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("interval");
    if (isBillingInterval(fromUrl)) setBillingInterval(fromUrl);
  }, []);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const digits = card.replace(/\D/g, "");
    const [mm, yy] = exp.split("/").map(Number);
    const expiry = new Date(2000 + (yy || 0), mm || 0, 1);
    if (!name.trim()) return setError("Enter the name on the card.");
    if (!TEST_CARD_NUMBERS.includes(digits))
      return setError("Test mode: use 4242 4242 4242 4242 (Visa) or 5555 5555 5555 4444 (Mastercard). Real cards are not accepted.");
    if (!mm || mm > 12 || expiry.getTime() <= Date.now()) return setError("Enter a future expiry date (MM/YY).");
    if (!/^\d{3}$/.test(cvc)) return setError("Enter a 3-digit CVC.");

    setProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1200)); // simulate the processor round-trip
      await checkout({ last4: digits.slice(-4), brand: digits.startsWith("5") ? "Mastercard" : "Visa", interval });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed.");
    } finally {
      setProcessing(false);
    }
  }

  if (done || (isPro && !processing)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <CheckCircle2 className="mx-auto size-16 text-savings" />
        <h1 className="mt-5 text-4xl font-extrabold text-ink">{done ? "Welcome to Pro!" : "You're already on Pro"}</h1>
        <p className="mt-3 text-lg text-muted">
          Unlimited audits, up to 6 PDFs each, and unlimited Copilot questions.
          {status?.pro ? ` Renews ${new Date(status.pro.renewsAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.` : ""}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/audit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-base font-bold text-white hover:bg-ink-soft">
            Start an audit <ArrowRight className="size-5" />
          </Link>
          <Link href="/account" className="inline-flex items-center justify-center rounded-xl border border-line px-6 py-3.5 text-base font-semibold text-ink hover:bg-canvas">
            View account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 flex items-start gap-3 rounded-2xl border border-warn/40 bg-warn-soft p-4 text-base text-warn-strong">
        <FlaskConical className="mt-0.5 size-5 shrink-0" />
        <p>
          <span className="font-bold">Test mode — prototype checkout.</span> No real payment is processed. Use card{" "}
          <span className="money font-bold">4242 4242 4242 4242</span>, any future date and any 3-digit CVC.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <form onSubmit={pay} className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8" autoComplete="off" noValidate>
          <h1 className="text-3xl font-extrabold text-ink">Upgrade to Pro</h1>
          <p className="mt-2 text-base text-muted">Cancel anytime from your account.</p>

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-semibold text-ink-soft">Billing</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["year", "month"] as const).map((id) => {
                const p = PRICES[id];
                const active = interval === id;
                return (
                  <label
                    key={id}
                    className={cn(
                      "relative flex cursor-pointer flex-col rounded-2xl border-2 p-4 transition",
                      active ? "border-savings bg-savings-soft" : "border-line hover:border-ink/25",
                    )}
                  >
                    <input
                      type="radio"
                      name="interval"
                      value={id}
                      checked={active}
                      onChange={() => setBillingInterval(id)}
                      className="sr-only"
                    />
                    {id === "year" && (
                      <span className="absolute -top-3 right-3 rounded-full bg-savings px-2.5 py-0.5 text-xs font-bold text-white">
                        Save {ANNUAL_SAVINGS_PCT}%
                      </span>
                    )}
                    <span className="text-base font-bold text-ink">{p.label}</span>
                    <span className="money mt-1 text-2xl font-extrabold text-ink">
                      {formatPrice(p.amount)}
                      <span className="text-base font-semibold text-muted">/{id === "year" ? "yr" : "mo"}</span>
                    </span>
                    <span className="money mt-0.5 text-sm text-muted">
                      {id === "year" ? `Just ${formatPrice(p.perMonth)}/mo, billed once a year` : "Flexible, cancel anytime"}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Name on card</span>
              <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" autoComplete="off" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Card number</span>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-subtle" />
                <input
                  className={cn(field, "money pl-12")}
                  inputMode="numeric"
                  value={card}
                  onChange={(e) => setCard(formatCard(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  autoComplete="off"
                  aria-describedby="test-hint"
                />
              </div>
              <span id="test-hint" className="mt-1.5 block text-sm text-muted">Test cards only in this prototype.</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-soft">Expiry</span>
                <input className={cn(field, "money")} inputMode="numeric" value={exp} onChange={(e) => setExp(formatExp(e.target.value))} placeholder="MM/YY" autoComplete="off" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold text-ink-soft">CVC</span>
                <input className={cn(field, "money")} inputMode="numeric" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="123" autoComplete="off" />
              </label>
            </div>
          </div>

          {error && <p role="alert" className="mt-5 rounded-xl bg-risk-soft p-4 text-base font-medium text-risk-strong">{error}</p>}

          <button
            type="submit"
            disabled={processing}
            className="mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-ink text-lg font-bold text-white transition hover:bg-ink-soft disabled:opacity-70"
          >
            {processing ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
            {processing ? "Processing…" : `Pay ${formatPrice(price.amount)} (test)`}
          </button>
          <p className="mt-3 text-center text-sm text-muted">
            Renews {interval === "year" ? "yearly" : "monthly"} at {formatPrice(price.amount)} until you cancel in Account. By
            subscribing you agree to the{" "}
            <Link href="/terms" className="font-semibold text-ink underline underline-offset-2">
              Terms & subscription policy
            </Link>
            . Your card number never leaves this page in test mode.
          </p>
        </form>

        <aside className="h-fit rounded-3xl bg-night p-6 text-white sm:p-8">
          <p className="text-sm font-bold tracking-widest text-scan uppercase">Order summary</p>
          <div className="mt-5 flex items-baseline justify-between">
            <span className="text-xl font-bold">InsuraUS Pro</span>
            <span className="money text-xl font-bold">{formatPrice(price.amount)}</span>
          </div>
          <p className="money text-base text-slate-400">
            {interval === "year" ? `Yearly subscription · ${formatPrice(price.perMonth)}/mo` : "Monthly subscription"}
          </p>
          {interval === "year" ? (
            <p className="money mt-3 rounded-xl bg-scan/15 px-3 py-2 text-sm font-semibold text-scan">
              You save {formatPrice(ANNUAL_SAVINGS_USD)} vs. paying monthly
            </p>
          ) : (
            <button
              type="button"
              onClick={() => setBillingInterval("year")}
              className="money mt-3 w-full rounded-xl border border-scan/40 px-3 py-2 text-left text-sm font-semibold text-scan transition hover:bg-scan/10"
            >
              Switch to yearly and save {formatPrice(ANNUAL_SAVINGS_USD)} →
            </button>
          )}
          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-base text-slate-200">
                <Check className="mt-1 size-4 shrink-0 text-scan" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-5">
            <span className="text-base text-slate-300">Due today</span>
            <span className="money text-3xl font-extrabold">{formatPrice(price.amount)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
