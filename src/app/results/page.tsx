"use client";

import { ArrowRight, Car, FileText, HeartPulse, Home, Building2, Info } from "lucide-react";
import Link from "next/link";
import { useAudit } from "@/components/providers/AuditProvider";
import { KpiRow } from "@/components/audit/KpiRow";
import { ScoreFactorsCard } from "@/components/audit/HealthScoreCard";
import { formatUSD } from "@/lib/utils";
import type { PolicyType } from "@/types/insurance";

const ICON: Partial<Record<PolicyType, typeof Car>> = { auto: Car, health: HeartPulse, home: Home, renters: Building2 };

export default function OverviewPage() {
  const { result } = useAudit();
  if (!result) return null;
  const { audit } = result;

  const bySavings = audit.policies
    .map((p) => ({
      ...p,
      savings: p.issues.reduce((sum, i) => sum + Math.max(0, i.annualSavings), 0),
      upgrades: p.issues.reduce((sum, i) => sum + Math.max(0, -i.annualSavings), 0),
    }))
    .sort((a, b) => b.savings - a.savings);
  const maxSavings = Math.max(1, ...bySavings.map((p) => Math.abs(p.savings)));

  const topActions = audit.policies
    .flatMap((p) => p.issues.map((i) => ({ ...i, carrier: p.carrier })))
    .filter((i) => i.annualSavings > 0)
    .sort((a, b) => b.annualSavings - a.annualSavings)
    .slice(0, 3);

  return (
    <div className="space-y-10">
      <KpiRow audit={audit} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
        {/* Savings by policy */}
        <section className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
          <h2 className="text-2xl font-extrabold text-ink">Where the money is</h2>
          <p className="mt-1 text-base text-muted">Yearly savings on each policy · protection upgrades shown separately</p>
          <ul className="mt-6 space-y-5">
            {bySavings.map((p, i) => {
              const Icon = ICON[p.type] ?? FileText;
              const pct = (Math.abs(p.savings) / maxSavings) * 100;
              return (
                <li key={`${p.policyNumber}-${i}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-ink">
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-base font-bold text-ink capitalize">{p.type} · {p.carrier}</span>
                        <span className="money block text-sm text-muted">
                          {formatUSD(p.currentAnnualPremium)} → {formatUSD(p.optimizedAnnualPremium)} per year
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="money block text-lg font-extrabold text-savings-strong">{formatUSD(p.savings)}</span>
                      {p.upgrades > 0 && (
                        <span className="money block text-sm font-semibold text-warn-strong">+{formatUSD(p.upgrades)} protection</span>
                      )}
                    </span>
                  </div>
                  <div className="mt-2.5 h-3 overflow-hidden rounded-full bg-canvas">
                    <div className="h-full rounded-full bg-savings" style={{ width: `${Math.max(pct, p.savings === 0 ? 0 : 3)}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <Link href="/results/policies" className="mt-7 inline-flex items-center gap-1.5 text-base font-bold text-ink hover:underline">
            See every finding <ArrowRight className="size-4" />
          </Link>
        </section>
        <ScoreFactorsCard factors={audit.scoreFactors} />
        </div>

        {/* Top actions */}
        <section className="flex h-fit flex-col rounded-3xl bg-night p-6 text-white sm:p-8">
          <h2 className="text-2xl font-extrabold">Your 3 biggest wins</h2>
          <p className="mt-1 text-base text-slate-400">Do these first</p>
          <ol className="mt-6 space-y-4">
            {topActions.map((a, n) => (
              <li key={a.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <span className="money flex size-9 shrink-0 items-center justify-center rounded-full bg-scan text-base font-extrabold text-night">
                  {n + 1}
                </span>
                <div>
                  <p className="text-base font-bold text-white">{a.title}</p>
                  <p className="mt-1 text-base text-slate-300">{a.actionItem}</p>
                  <p className="money mt-2 text-base font-bold text-scan">
                    ~{formatUSD(a.annualSavings)}/yr · {a.carrier}
                  </p>
                </div>
              </li>
            ))}
            {topActions.length === 0 && <li className="text-base text-slate-300">No savings found — your coverage is well tuned.</li>}
          </ol>
          <Link
            href="/results/negotiate"
            className="mt-8 inline-flex items-center justify-center gap-2 self-start rounded-xl bg-scan px-6 py-3.5 text-base font-bold text-night transition hover:bg-white"
          >
            Get my negotiation script <ArrowRight className="size-5" />
          </Link>
        </section>
      </div>

      <section className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
          <Info className="size-5" /> Good to know
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-base text-ink-soft">
          {audit.disclaimers.map((d) => (
            <li key={d}>{d}</li>
          ))}
          <li>
            InsuraUS is educational, not a licensed agent or broker. Savings are estimates — confirm any change with your
            carrier in writing before dropping coverage.
          </li>
        </ul>
        <p className="money mt-4 text-sm text-muted">
          Analyzed with {result.meta.model} in {(result.meta.durationMs / 1000).toFixed(1)}s. Your PDFs were processed in memory
          and not stored.
        </p>
      </section>
    </div>
  );
}
