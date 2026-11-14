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
              <span className="text-base font-bold text-ink">{type.label}</span>
              <Badge tone={status.tone}>
                <status.Icon /> {status.label}
              </Badge>
              {policy.issues.length > 0 && (
                <span className="text-xs text-muted">
                  {policy.issues.length} {policy.issues.length === 1 ? "finding" : "findings"}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm break-words text-ink-soft">
              {policy.carrier} <span className="text-subtle">·</span> <span className="money">#{policy.policyNumber}</span>
            </p>
            {policy.insuredItem && <p className="text-sm break-words text-muted">{policy.insuredItem}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 sm:shrink-0 sm:flex-nowrap sm:justify-end">
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Annual premium</p>
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
            <p className="border-b border-line bg-canvas/60 px-5 py-3 text-base break-words text-ink-soft sm:px-6">{policy.plainEnglishSummary}</p>
          )}
          <div className="grid gap-0 lg:grid-cols-2 [&>*]:min-w-0">
            {/* Jargon Translator */}
            <section className="min-w-0 border-line p-5 sm:p-6 lg:border-r">
              <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                <Languages className="size-3.5" /> Jargon translator
              </h4>
              <dl className="divide-y divide-line">
                {policy.coverageLines.map((line) => (
                  <div key={line.term + line.value} className="min-w-0 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="min-w-0 flex-1 text-base font-bold break-words text-ink">{line.term}</dt>
                      {line.annualPremium ? (
                        <span className="money shrink-0 rounded-full bg-canvas px-2.5 py-0.5 text-sm font-semibold text-ink-soft">
                          {formatUSD(line.annualPremium)}/yr
                        </span>
                      ) : null}
                    </div>
                    <dd className="money mt-1 text-base font-semibold break-words text-info">{line.value}</dd>
                    <dd className="mt-1 text-sm leading-relaxed break-words text-muted">{line.plainEnglish}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 grid gap-3 rounded-xl bg-canvas p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-muted">Deductible</p>
                  <p className="money font-semibold break-words text-ink">{policy.deductible}</p>
                </div>
                <div>
                  <p className="text-muted">Coverage limit</p>
                  <p className="money font-semibold break-words text-ink">{policy.coverageLimit}</p>
                </div>
              </div>
            </section>

            {/* Findings */}
            <section className="min-w-0 border-t border-line p-5 sm:p-6 lg:border-t-0">
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
                      className={cn("min-w-0 rounded-xl border border-l-4 border-line bg-surface p-4", SEVERITY_BORDER[issue.severity])}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                            {CATEGORY_LABEL[issue.category] ?? issue.category} · {issue.severity} impact
                          </p>
                          <p className="mt-0.5 text-base font-bold break-words text-ink">{issue.title}</p>
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
                      <p className="mt-2 text-sm leading-relaxed break-words text-ink-soft">{issue.explanation}</p>
                      <p className="mt-3 flex items-start gap-2 rounded-lg bg-canvas px-3 py-2.5 text-sm font-medium text-ink">
                        <ArrowRight className="mt-1 size-4 shrink-0 text-savings" />
                        <span className="min-w-0 break-words">{issue.actionItem}</span>
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
