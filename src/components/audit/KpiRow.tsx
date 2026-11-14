import { PiggyBank, TrendingUp, Wallet } from "lucide-react";
import type { AuditResult } from "@/types/insurance";
import { Card, Eyebrow } from "@/components/ui/card";
import { futureValueOfAnnualSavings, growthSeries } from "@/lib/finance";
import { formatUSD } from "@/lib/utils";
import { HealthScoreCard } from "./HealthScoreCard";

/** Year-by-year growth of invested savings (decorative; the headline number carries the meaning). */
function GrowthBars({ annual }: { annual: number }) {
  const series = growthSeries(annual).slice(1);
  const max = series[series.length - 1]?.balance || 1;
  return (
    <div className="flex h-12 items-end gap-1.5" aria-hidden>
      {series.map((p) => (
        <div
          key={p.year}
          className="flex-1 rounded-t-[4px] bg-savings/80"
          style={{ height: `${Math.max(10, (p.balance / max) * 100)}%` }}
          title={`Year ${p.year}: ${formatUSD(p.balance)}`}
        />
      ))}
    </div>
  );
}

export function KpiRow({ audit }: { audit: AuditResult }) {
  const savings = Math.max(0, audit.totalPotentialAnnualSavings);
  const pct = audit.totalCurrentAnnualSpend > 0 ? Math.round((savings / audit.totalCurrentAnnualSpend) * 100) : 0;
  const fiveYear = futureValueOfAnnualSavings(savings, 5, 0.07);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <HealthScoreCard score={audit.insuranceHealthScore} />

      <Card className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <Eyebrow>You pay today</Eyebrow>
          <Wallet className="size-5 text-subtle" />
        </div>
        <p className="money mt-4 text-4xl font-extrabold text-ink">{formatUSD(audit.totalCurrentAnnualSpend)}</p>
        <p className="money mt-1 text-base text-muted">per year · {formatUSD(audit.totalCurrentAnnualSpend / 12)}/month</p>
        <p className="mt-auto pt-6 text-sm text-muted">
          Across {audit.policies.length} {audit.policies.length === 1 ? "policy" : "policies"}
        </p>
      </Card>

      <Card className="flex flex-col border-savings/40 bg-gradient-to-b from-savings-soft to-surface p-6">
        <div className="flex items-center justify-between">
          <Eyebrow className="text-savings-strong">You could save</Eyebrow>
          <PiggyBank className="size-5 text-savings" />
        </div>
        <p className="money mt-4 text-4xl font-extrabold text-savings-strong">{formatUSD(savings)}</p>
        <p className="money mt-1 text-base text-savings-strong/90">per year · {pct}% of your bill</p>
        <p className="money mt-auto pt-6 text-sm text-ink-soft">
          <span className="font-bold">{formatUSD(savings / 12)}</span> back every month
        </p>
      </Card>

      <Card className="flex flex-col p-6">
        <div className="flex items-center justify-between">
          <Eyebrow>In 5 years</Eyebrow>
          <TrendingUp className="size-5 text-subtle" />
        </div>
        <p className="money mt-4 text-4xl font-extrabold text-ink">{formatUSD(fiveYear)}</p>
        <p className="mt-1 text-base text-muted">if savings are invested at 7%/yr</p>
        <div className="mt-auto pt-5">
          <GrowthBars annual={savings} />
        </div>
      </Card>
    </div>
  );
}
