import { ArrowRight, Check, Crown } from "lucide-react";
import Link from "next/link";
import { PRICES, PRO_LIMITS, PRO_PRICE_USD, formatPrice } from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

export const PRO_FEATURES = [
  "Unlimited policy audits",
  `Up to ${PRO_LIMITS.maxFiles} PDFs per audit — catch duplicates across carriers`,
  "Unlimited Policy Copilot questions",
  "Re-audit at every renewal",
];

/** Paywall / upsell card shown when a free-trial limit is hit. */
export function UpgradeCard({ message, className }: { message?: string; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-night p-6 text-white sm:p-8", className)}>
      <div className="absolute -right-20 -top-20 size-64 rounded-full bg-savings/20 blur-3xl" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-scan/15 px-3 py-1 text-sm font-bold text-scan">
          <Crown className="size-4" /> InsuraUS Pro
        </span>
        <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">{message ?? "Keep auditing with Pro"}</h2>
        <p className="mt-2 text-lg text-slate-300">
          <span className="money text-3xl font-extrabold text-white">{formatPrice(PRICES.year.perMonth)}</span> / month billed
          yearly · or {formatPrice(PRO_PRICE_USD)} monthly
        </p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {PRO_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-base text-slate-200">
              <Check className="mt-1 size-4 shrink-0 text-scan" /> {f}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-scan px-6 py-3.5 text-base font-bold text-night transition hover:bg-white"
          >
            Upgrade to Pro <ArrowRight className="size-5" />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Compare plans
          </Link>
        </div>
      </div>
    </div>
  );
}
