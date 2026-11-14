import { PiggyBank, TrendingUp, Wallet } from "lucide-react";
import type { AuditResult } from "@/types/insurance";
import { Card, Eyebrow } from "@/components/ui/card";
import { futureValueOfAnnualSavings, growthSeries } from "@/lib/finance";
import { formatUSD } from "@/lib/utils";
import { HealthScoreCard } from "./HealthScoreCard";

/** Tiny inline growth bars for the wealth-impact tile (decorative; the number carries the meaning). */
function GrowthBars({ annual }: { annual: number }) {
  const series = growthSeries(annual).slice(1);
  const max = series[series.length - 1]?.balance || 1;
  return (
    <div className="flex h-10 items-end gap-1.5" aria-hidden>
      {series.map((p) => (
        <div key={p.year} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-[4px] bg-savings/80" style={{ height: `${Math.max(8, (p.balance / max) * 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

export function KpiRow({ audit }: { audit: AuditResult }) {
  const savings = Math.max(0, audit.totalPotentialAnnualSavings);
  const pct = audit.totalCurrentAnnualSpend > 0 ? Math.round((savings / audit.totalCurrentAnnualSpend) * 100) : 0;
  const fiveYear = futureValueOfAnnualSavings(savings, 5, 0.07);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(240px,1fr)_2.4fr]">
      <HealthScoreCard score={audit.insuranceHealthScore} factors={audit.scoreFactors} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex flex-col p-5">
          <div className="flex items-center justify-between">
            <Eyebrow>Current annual spend</Eyebrow>
            <Wallet className="size-4 text-subtle" />
          </div>
          <p className="money mt-3 text-3xl font-semibold tracking-tight text-ink">{formatUSD(audit.totalCurrentAnnualSpend)}</p>
          <p className="money mt-1 text-sm text-muted">{formatUSD(audit.totalCurrentAnnualSpend / 12)} / month</p>
          <div className="mt-auto pt-4 text-xs text-muted">
            Across {audit.policies.length} {audit.policies.length === 1 ? "policy" : "policies"}
          </div>
        </Card>

        <Card className="relative flex flex-col overflow-hidden border-savings/40 bg-gradient-to-b from-savings-soft to-surface p-5">
          <div className="flex items-center justify-between">
            <Eyebrow className="text-savings-strong">Potential annual savings</Eyebrow>
            <PiggyBank className="size-4 text-savings" />
          </div>
          <p className="money mt-3 text-3xl font-semibold tracking-tight text-savings-strong">{formatUSD(savings)}</p>
          <p className="money mt-1 text-sm text-savings-strong/80">{pct}% of what you pay today</p>
          <div className="mt-auto pt-4 text-xs text-ink-soft">
            <span className="money font-semibold">{formatUSD(savings / 12)}</span> back in your pocket every month
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          <div className="flex items-center justify-between">
            <Eyebrow>5-year wealth impact</Eyebrow>
            <TrendingUp className="size-4 text-subtle" />
          </div>
          <p className="money mt-3 text-3xl font-semibold tracking-tight text-ink">{formatUSD(fiveYear)}</p>
          <p className="mt-1 text-sm text-muted">If savings are invested at 7%/yr</p>
          <div className="mt-auto pt-4">
            <GrowthBars annual={savings} />
          </div>
        </Card>
      </div>
    </div>
  );
}
