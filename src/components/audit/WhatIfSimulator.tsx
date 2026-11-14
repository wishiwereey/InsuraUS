"use client";

import { Car, CloudRain, FileText, HeartPulse, Home, Building2, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PolicyType, WhatIfScenario } from "@/types/insurance";
import { Card } from "@/components/ui/card";
import { cn, formatCompactUSD, formatUSD } from "@/lib/utils";

// Validated with the dataviz palette checker (CVD-safe pair); amber gets value labels + a numbers table for contrast relief.
const PREMIUM_COLOR = "#4F6BD8";
const OOP_COLOR = "#E08A0B";

const ICONS: Partial<Record<PolicyType, typeof Car>> = {
  auto: Car,
  health: HeartPulse,
  home: Home,
  renters: Building2,
};

interface Row {
  plan: string;
  premiums: number;
  outOfPocket: number;
  total: number;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Row }[] }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="money rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lift">
      <p className="mb-1 font-semibold text-ink">{row.plan}</p>
      <p className="flex items-center justify-between gap-6 text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm" style={{ background: PREMIUM_COLOR }} /> Premiums
        </span>
        {formatUSD(row.premiums)}
      </p>
      <p className="flex items-center justify-between gap-6 text-ink-soft">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-sm" style={{ background: OOP_COLOR }} /> Out-of-pocket
        </span>
        {formatUSD(row.outOfPocket)}
      </p>
      <p className="mt-1 flex justify-between gap-6 border-t border-line pt-1 font-semibold text-ink">
        <span>1-year total</span>
        {formatUSD(row.total)}
      </p>
    </div>
  );
}

export function WhatIfSimulator({ scenarios }: { scenarios: WhatIfScenario[] }) {
  const [index, setIndex] = useState(0);
  const [withClaim, setWithClaim] = useState(true);
  const s = scenarios[index];

  const rows: Row[] = useMemo(() => {
    if (!s) return [];
    const cur = withClaim ? s.currentPlanOutOfPocket : 0;
    const opt = withClaim ? s.optimizedPlanOutOfPocket : 0;
    return [
      { plan: "Current plan", premiums: s.currentAnnualPremiums, outOfPocket: cur, total: s.currentAnnualPremiums + cur },
      { plan: "Optimized plan", premiums: s.optimizedAnnualPremiums, outOfPocket: opt, total: s.optimizedAnnualPremiums + opt },
    ];
  }, [s, withClaim]);

  if (!s) return null;
  const diff = rows[0].total - rows[1].total;
  const oopDelta = s.optimizedPlanOutOfPocket - s.currentPlanOutOfPocket;

  return (
    <Card className="overflow-hidden">
      {/* Scenario picker */}
      <div className="grid border-b border-line sm:grid-cols-3" role="tablist" aria-label="Claim scenarios">
        {scenarios.map((sc, i) => {
          const Icon = ICONS[sc.policyType] ?? (sc.policyType === "other" ? FileText : CloudRain);
          return (
            <button
              key={sc.title}
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                "flex items-center gap-3 border-line px-5 py-4 text-left transition sm:border-r sm:last:border-r-0",
                i === index ? "bg-surface shadow-[inset_0_-2px_0_var(--color-ink)]" : "bg-canvas/60 hover:bg-canvas",
                i > 0 && "border-t sm:border-t-0",
              )}
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                  i === index ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft",
                )}
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className={cn("block truncate text-sm font-semibold", i === index ? "text-ink" : "text-ink-soft")}>{sc.title}</span>
                <span className="money block text-xs text-muted">{formatUSD(sc.eventCost)} event</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Narrative + numbers */}
        <div className="flex flex-col">
          <p className="text-sm leading-relaxed text-ink-soft">{s.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-line p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">You pay today</p>
              <p className="money mt-1 text-xl font-semibold text-ink">{formatUSD(s.currentPlanOutOfPocket)}</p>
              <p className="text-xs text-muted">out-of-pocket</p>
            </div>
            <div className="rounded-lg border border-line p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Optimized plan</p>
              <p className="money mt-1 text-xl font-semibold text-ink">{formatUSD(s.optimizedPlanOutOfPocket)}</p>
              <p className={cn("money text-xs", oopDelta > 0 ? "text-warn-strong" : oopDelta < 0 ? "text-savings-strong" : "text-muted")}>
                {oopDelta === 0 ? "same out-of-pocket" : `${oopDelta > 0 ? "+" : "−"}${formatUSD(Math.abs(oopDelta))} vs today`}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "mt-3 flex items-start gap-3 rounded-lg p-4",
              diff >= 0 ? "bg-savings-soft text-savings-strong" : "bg-warn-soft text-warn-strong",
            )}
          >
            {diff >= 0 ? <TrendingDown className="mt-0.5 size-5 shrink-0" /> : <TrendingUp className="mt-0.5 size-5 shrink-0" />}
            <div>
              <p className="money text-sm font-semibold">
                {diff >= 0 ? `You come out ${formatUSD(diff)} ahead` : `Costs ${formatUSD(-diff)} more`}{" "}
                {withClaim ? "even in the year this happens" : "in a year with no claims"}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">{s.verdict}</p>
            </div>
          </div>

          {/* Table view — the accessible twin of the chart */}
          <table className="money mt-5 w-full text-xs">
            <caption className="sr-only">1-year cost comparison for {s.title}</caption>
            <thead>
              <tr className="text-left text-muted">
                <th className="pb-1.5 font-medium">1-year cost</th>
                <th className="pb-1.5 text-right font-medium">Premiums</th>
                <th className="pb-1.5 text-right font-medium">Out-of-pocket</th>
                <th className="pb-1.5 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.plan} className="border-t border-line text-ink-soft">
                  <td className="py-1.5 font-medium text-ink">{r.plan}</td>
                  <td className="py-1.5 text-right">{formatUSD(r.premiums)}</td>
                  <td className="py-1.5 text-right">{formatUSD(r.outOfPocket)}</td>
                  <td className="py-1.5 text-right font-semibold text-ink">{formatUSD(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Chart */}
        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-xs text-ink-soft">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: PREMIUM_COLOR }} /> Annual premiums
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: OOP_COLOR }} /> Claim out-of-pocket
              </span>
            </div>
            <div className="inline-flex rounded-lg border border-line bg-canvas p-0.5 text-xs" role="group" aria-label="Year type">
              {[
                { v: true, l: "Claim year" },
                { v: false, l: "Quiet year" },
              ].map((o) => (
                <button
                  key={o.l}
                  onClick={() => setWithClaim(o.v)}
                  aria-pressed={withClaim === o.v}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-medium transition",
                    withClaim === o.v ? "bg-surface text-ink shadow-card" : "text-muted hover:text-ink",
                  )}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 24, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="var(--color-line)" strokeDasharray="0" />
                <XAxis dataKey="plan" tickLine={false} axisLine={{ stroke: "var(--color-line-strong)" }} tick={{ fill: "#334155", fontSize: 12, fontWeight: 500 }} />
                <YAxis
                  tickFormatter={formatCompactUSD}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(15,23,42,0.04)" }} />
                <Bar dataKey="premiums" stackId="cost" fill={PREMIUM_COLOR} stroke="#fff" strokeWidth={2} maxBarSize={88} isAnimationActive />
                <Bar
                  dataKey="outOfPocket"
                  stackId="cost"
                  fill={OOP_COLOR}
                  stroke="#fff"
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={88}
                  isAnimationActive
                >
                  <LabelList
                    dataKey="total"
                    position="top"
                    formatter={(v) => formatUSD(Number(v))}
                    style={{ fill: "#0f172a", fontSize: 12, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  );
}
