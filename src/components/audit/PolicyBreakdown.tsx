"use client";

import {
  AlertTriangle,
  ArrowRight,
  Car,
  ChevronDown,
  CircleCheck,
  FileText,
  HeartPulse,
  Home,
  Building2,
  Languages,
  ShieldAlert,
  Umbrella,
} from "lucide-react";
import { useState } from "react";
import type { AnalyzedPolicy, IssueSeverity, PolicyStatus, PolicyType } from "@/types/insurance";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatSignedUSD, formatUSD } from "@/lib/utils";

const TYPE_META: Record<PolicyType, { label: string; Icon: typeof Car }> = {
  auto: { label: "Auto", Icon: Car },
  health: { label: "Health", Icon: HeartPulse },
  home: { label: "Homeowners", Icon: Home },
  renters: { label: "Renters", Icon: Building2 },
  life: { label: "Life", Icon: ShieldAlert },
  umbrella: { label: "Umbrella", Icon: Umbrella },
  other: { label: "Policy", Icon: FileText },
};

const STATUS_META: Record<PolicyStatus, { label: string; tone: "risk" | "warn" | "savings"; Icon: typeof Car }> = {
  overpaying: { label: "Overpaying", tone: "risk", Icon: AlertTriangle },
  suboptimal: { label: "Suboptimal", tone: "warn", Icon: ShieldAlert },
  optimized: { label: "Optimized", tone: "savings", Icon: CircleCheck },
};

const SEVERITY_BORDER: Record<IssueSeverity, string> = {
  high: "border-l-risk",
  medium: "border-l-warn",
  low: "border-l-line-strong",
};

const CATEGORY_LABEL: Record<string, string> = {
  deductible: "Deductible",
  duplicate_coverage: "Duplicate coverage",
  unnecessary_coverage: "Unnecessary coverage",
  underinsured: "Coverage gap",
  plan_mismatch: "Plan mismatch",
  missing_discount: "Missing discount",
  other: "Other",
};

function PolicyCard({ policy, defaultOpen }: { policy: AnalyzedPolicy; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  const type = TYPE_META[policy.type] ?? TYPE_META.other;
  const status = STATUS_META[policy.status];
  const savings = policy.currentAnnualPremium - policy.optimizedAnnualPremium;
  const panelId = `policy-${policy.policyNumber.replace(/\W/g, "")}`;

  return (
    <Card className={cn("overflow-hidden transition-shadow", open && "shadow-lift")}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-canvas/50 sm:flex-row sm:items-center"
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-line bg-canvas text-ink">
            <type.Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">{type.label}</span>
              <Badge tone={status.tone}>
                <status.Icon /> {status.label}
              </Badge>
              {policy.issues.length > 0 && (
                <span className="text-xs text-muted">
                  {policy.issues.length} {policy.issues.length === 1 ? "finding" : "findings"}
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-sm text-ink-soft">
              {policy.carrier} <span className="text-subtle">·</span> <span className="money">#{policy.policyNumber}</span>
            </p>
            {policy.insuredItem && <p className="truncate text-xs text-muted">{policy.insuredItem}</p>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 sm:justify-end">
          <div className="text-right">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">Annual premium</p>
            <p className="money flex items-center justify-end gap-1.5 text-sm">
              <span className={cn("font-semibold", savings > 0 ? "text-muted line-through decoration-risk/60" : "text-ink")}>
                {formatUSD(policy.currentAnnualPremium)}
              </span>
              {savings !== 0 && (
                <>
                  <ArrowRight className="size-3.5 text-subtle" />
                  <span className="font-semibold text-ink">{formatUSD(policy.optimizedAnnualPremium)}</span>
                </>
              )}
            </p>
          </div>
          {savings !== 0 && (
            <span
              className={cn(
                "money rounded-lg px-2.5 py-1.5 text-sm font-semibold",
                savings > 0 ? "bg-savings-soft text-savings-strong" : "bg-warn-soft text-warn-strong",
              )}
            >
              {savings > 0 ? `Save ${formatUSD(savings)}` : `+${formatUSD(-savings)} protection`}
            </span>
          )}
          <ChevronDown className={cn("size-5 shrink-0 text-muted transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div id={panelId} className="animate-fade-up border-t border-line">
          {policy.plainEnglishSummary && (
            <p className="border-b border-line bg-canvas/60 px-5 py-3 text-sm text-ink-soft">{policy.plainEnglishSummary}</p>
          )}
          <div className="grid gap-0 lg:grid-cols-2">
            {/* Jargon Translator */}
            <section className="border-line p-5 lg:border-r">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <Languages className="size-3.5" /> Jargon translator
              </h4>
              <dl className="divide-y divide-line">
                {policy.coverageLines.map((line) => (
                  <div key={line.term + line.value} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-sm font-medium text-ink">{line.term}</dt>
                      <dd className="money shrink-0 text-right text-sm font-semibold text-ink">
                        {line.value}
                        {line.annualPremium ? (
                          <span className="ml-2 text-xs font-normal text-muted">{formatUSD(line.annualPremium)}/yr</span>
                        ) : null}
                      </dd>
                    </div>
                    <dd className="mt-0.5 text-xs leading-relaxed text-muted">{line.plainEnglish}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-canvas p-3 text-xs">
                <div>
                  <p className="text-muted">Deductible</p>
                  <p className="money font-semibold text-ink">{policy.deductible}</p>
                </div>
                <div>
                  <p className="text-muted">Coverage limit</p>
                  <p className="money font-semibold text-ink">{policy.coverageLimit}</p>
                </div>
              </div>
            </section>

            {/* Findings */}
            <section className="border-t border-line p-5 lg:border-t-0">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <ShieldAlert className="size-3.5" /> Optimization flags
              </h4>
              {policy.issues.length === 0 ? (
                <div className="flex items-center gap-2 rounded-lg border border-savings/30 bg-savings-soft p-4 text-sm text-savings-strong">
                  <CircleCheck className="size-4" /> No material issues found — this policy is well tuned.
                </div>
              ) : (
                <ul className="space-y-3">
                  {policy.issues.map((issue) => (
                    <li
                      key={issue.title}
                      className={cn("rounded-lg border border-l-4 border-line bg-surface p-4", SEVERITY_BORDER[issue.severity])}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                            {CATEGORY_LABEL[issue.category] ?? issue.category} · {issue.severity} impact
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-ink">{issue.title}</p>
                        </div>
                        <span
                          className={cn(
                            "money shrink-0 text-sm font-semibold",
                            issue.annualSavings >= 0 ? "text-savings-strong" : "text-warn-strong",
                          )}
                        >
                          {formatSignedUSD(issue.annualSavings)}/yr
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{issue.explanation}</p>
                      <p className="mt-3 flex items-start gap-2 rounded-md bg-canvas px-3 py-2 text-xs font-medium text-ink">
                        <ArrowRight className="mt-0.5 size-3.5 shrink-0 text-savings" />
                        {issue.actionItem}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </Card>
  );
}

export function PolicyBreakdown({ policies }: { policies: AnalyzedPolicy[] }) {
  const firstWithIssues = policies.findIndex((p) => p.issues.length > 0);
  return (
    <div className="space-y-3">
      {policies.map((p, i) => (
        <PolicyCard key={`${p.policyNumber}-${i}`} policy={p} defaultOpen={i === (firstWithIssues === -1 ? 0 : firstWithIssues)} />
      ))}
    </div>
  );
}
