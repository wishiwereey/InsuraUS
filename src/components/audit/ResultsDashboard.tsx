"use client";

import { Info, RotateCcw, Sparkles } from "lucide-react";
import type { AnalyzeResponse, UserContext } from "@/types/insurance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatUSD } from "@/lib/utils";
import { KpiRow } from "./KpiRow";
import { NegotiationDrawer } from "./NegotiationDrawer";
import { PolicyBreakdown } from "./PolicyBreakdown";
import { PolicyChat } from "./PolicyChat";
import { WhatIfSimulator } from "./WhatIfSimulator";

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-savings-strong">{eyebrow}</p>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
    </div>
  );
}

interface ResultsDashboardProps {
  data: AnalyzeResponse;
  files: File[];
  context: UserContext;
  onReset: () => void;
}

export function ResultsDashboard({ data, files, context, onReset }: ResultsDashboardProps) {
  const { audit, meta } = data;
  const savings = Math.max(0, audit.totalPotentialAnnualSavings);
  const totalIssues = audit.policies.reduce((n, p) => n + p.issues.length, 0);

  return (
    <div className="animate-fade-up space-y-10">
      {/* Verdict banner */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              <Sparkles className="size-3.5 text-savings" /> Your audit · {totalIssues} findings across {audit.policies.length} policies
            </p>
            <p className="mt-2 text-lg leading-snug font-medium text-ink sm:text-xl">{audit.summaryVerdict}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <NegotiationDrawer script={audit.negotiationScript} savings={savings} />
            <Button variant="ghost" size="sm" onClick={onReset}>
              <RotateCcw /> Audit different policies
            </Button>
          </div>
        </div>
      </Card>

      <KpiRow audit={audit} />

      <section>
        <SectionHeading
          eyebrow="Policy audit"
          title="Line by line, in plain English"
          description="Every coverage translated from insurance-speak, with red / amber / green flags on what to change."
        />
        <PolicyBreakdown policies={audit.policies} />
      </section>

      {audit.whatIfScenarios.length > 0 && (
        <section>
          <SectionHeading
            eyebrow="What-if stress test"
            title="Would the cheaper plan burn you in an emergency?"
            description={`Three realistic claims built from your actual deductibles and limits. Total 1-year cost = premiums + what you'd pay out-of-pocket. Optimized premiums total ${formatUSD(audit.whatIfScenarios[0].optimizedAnnualPremiums)}/yr.`}
          />
          <WhatIfSimulator scenarios={audit.whatIfScenarios} />
        </section>
      )}

      <section>
        <SectionHeading
          eyebrow="Action center"
          title="Ask follow-ups, then make the call"
          description="Your Copilot has read the same PDFs. Ask it anything before you contact your carrier."
        />
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <PolicyChat files={files} context={context} audit={audit} />
          <Card className="flex flex-col p-6">
            <p className="text-sm font-semibold text-ink">Your 3-step action plan</p>
            <ol className="mt-4 space-y-4 text-sm text-ink-soft">
              {audit.policies
                .flatMap((p) => p.issues.map((i) => ({ ...i, carrier: p.carrier })))
                .filter((i) => i.annualSavings > 0)
                .sort((a, b) => b.annualSavings - a.annualSavings)
                .slice(0, 3)
                .map((i, n) => (
                  <li key={i.title} className="flex gap-3">
                    <span className="money flex size-6 shrink-0 items-center justify-center rounded-full bg-savings-soft text-xs font-semibold text-savings-strong">
                      {n + 1}
                    </span>
                    <span>
                      <span className="block font-medium text-ink">{i.actionItem}</span>
                      <span className="money text-xs text-savings-strong">Saves ~{formatUSD(i.annualSavings)}/yr · {i.carrier}</span>
                    </span>
                  </li>
                ))}
            </ol>
            <div className="mt-auto pt-6">
              <NegotiationDrawer script={audit.negotiationScript} savings={savings} />
            </div>
          </Card>
        </div>
      </section>

      <footer className="rounded-xl border border-line bg-surface p-5 text-xs leading-relaxed text-muted">
        <p className="mb-2 flex items-center gap-1.5 font-semibold text-ink-soft">
          <Info className="size-3.5" /> Good to know
        </p>
        <ul className="list-disc space-y-1 pl-4">
          {audit.disclaimers.map((d) => (
            <li key={d}>{d}</li>
          ))}
          <li>
            CoverLens is an educational tool, not a licensed insurance agent or broker, and earns no commissions. Savings are
            estimates — confirm any change with your carrier in writing before you drop coverage.
          </li>
        </ul>
        <p className="money mt-3 text-[11px] text-subtle">
          Analyzed {meta.fileNames.length} document(s) with {meta.model} in {(meta.durationMs / 1000).toFixed(1)}s. Your PDFs
          were processed in memory and not stored.
        </p>
      </footer>
    </div>
  );
}
