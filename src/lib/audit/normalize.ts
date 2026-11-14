import type {
  AnalyzedPolicy,
  AuditResult,
  IssueSeverity,
  PolicyIssue,
  PolicyStatus,
  WhatIfScenario,
} from "@/types/insurance";

/**
 * The LLM extracts facts and reasons about them; deterministic code does the
 * arithmetic. This pass sanitizes the model output and recomputes every derived
 * total so the dashboard is always internally consistent (no "savings" that
 * don't add up, no negative out-of-pocket, no score of 140).
 */

const money = (v: unknown): number => {
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
};
const nonNeg = (v: unknown) => Math.max(0, money(v));
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const text = (v: unknown, fallback = "") => (typeof v === "string" && v.trim() ? v.trim() : fallback);

const SEVERITY_RANK: Record<IssueSeverity, number> = { high: 0, medium: 1, low: 2 };

function normalizeIssue(raw: Partial<PolicyIssue>): PolicyIssue {
  return {
    title: text(raw.title, "Issue"),
    category: raw.category ?? "other",
    severity: raw.severity ?? "medium",
    explanation: text(raw.explanation),
    annualSavings: money(raw.annualSavings),
    actionItem: text(raw.actionItem),
  };
}

function deriveStatus(current: number, savings: number, hasRisk: boolean, modelStatus?: PolicyStatus): PolicyStatus {
  if (current > 0 && savings / current >= 0.1) return "overpaying";
  if (savings > 0 || hasRisk) return "suboptimal";
  return modelStatus === "overpaying" ? "suboptimal" : "optimized";
}

function normalizePolicy(raw: Partial<AnalyzedPolicy>): AnalyzedPolicy {
  const issues = (raw.issues ?? [])
    .map(normalizeIssue)
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity] || b.annualSavings - a.annualSavings);
  const current = nonNeg(raw.currentAnnualPremium);
  const netSavings = issues.reduce((s, i) => s + i.annualSavings, 0);
  const hasRisk = issues.some((i) => i.category === "underinsured" || i.annualSavings < 0);
  return {
    type: raw.type ?? "other",
    carrier: text(raw.carrier, "Unknown carrier"),
    policyNumber: text(raw.policyNumber, "Not listed"),
    insuredItem: text(raw.insuredItem),
    currentAnnualPremium: current,
    optimizedAnnualPremium: Math.max(0, current - netSavings),
    deductible: text(raw.deductible, "—"),
    coverageLimit: text(raw.coverageLimit, "—"),
    status: deriveStatus(current, netSavings, hasRisk, raw.status),
    plainEnglishSummary: text(raw.plainEnglishSummary),
    coverageLines: (raw.coverageLines ?? [])
      .filter((l) => l && text(l.term))
      .map((l) => ({
        term: text(l.term),
        value: text(l.value, "—"),
        plainEnglish: text(l.plainEnglish),
        ...(l.annualPremium != null && money(l.annualPremium) > 0 ? { annualPremium: money(l.annualPremium) } : {}),
      })),
    issues,
  };
}

function normalizeScenario(raw: Partial<WhatIfScenario>, currentTotal: number, optimizedTotal: number): WhatIfScenario {
  const eventCost = nonNeg(raw.eventCost);
  const cap = (v: unknown) => clamp(nonNeg(v), 0, eventCost || Number.MAX_SAFE_INTEGER);
  const currentOop = cap(raw.currentPlanOutOfPocket);
  const optimizedOop = cap(raw.optimizedPlanOutOfPocket);
  return {
    title: text(raw.title, "Scenario"),
    policyType: raw.policyType ?? "other",
    eventCost,
    description: text(raw.description),
    currentPlanOutOfPocket: currentOop,
    optimizedPlanOutOfPocket: optimizedOop,
    // Premium totals come from the policies, not the model, so every scenario agrees.
    currentAnnualPremiums: currentTotal,
    optimizedAnnualPremiums: optimizedTotal,
    currentNetOneYearCost: currentTotal + currentOop,
    optimizedNetOneYearCost: optimizedTotal + optimizedOop,
    verdict: text(raw.verdict),
  };
}

export function normalizeAudit(raw: Partial<AuditResult>): AuditResult {
  const policies = (raw.policies ?? []).map(normalizePolicy);
  const currentTotal = policies.reduce((s, p) => s + p.currentAnnualPremium, 0);
  const optimizedTotal = policies.reduce((s, p) => s + p.optimizedAnnualPremium, 0);

  const scoreFactors = (raw.scoreFactors ?? []).slice(0, 4).map((f) => ({
    label: text(f.label, "Factor"),
    score: clamp(Math.round(Number(f.score) || 0), 0, 100),
    note: text(f.note),
  }));
  const factorAvg = scoreFactors.length
    ? Math.round(scoreFactors.reduce((s, f) => s + f.score, 0) / scoreFactors.length)
    : undefined;
  const modelScore = Number(raw.insuranceHealthScore);
  const score = clamp(Math.round(Number.isFinite(modelScore) ? modelScore : factorAvg ?? 50), 0, 100);

  const ns = raw.negotiationScript;
  return {
    insuranceHealthScore: score,
    scoreFactors,
    totalCurrentAnnualSpend: policies.length ? currentTotal : nonNeg(raw.totalCurrentAnnualSpend),
    totalPotentialAnnualSavings: policies.length ? currentTotal - optimizedTotal : money(raw.totalPotentialAnnualSavings),
    summaryVerdict: text(raw.summaryVerdict, "Analysis complete."),
    policies,
    whatIfScenarios: (raw.whatIfScenarios ?? []).slice(0, 3).map((s) => normalizeScenario(s, currentTotal, optimizedTotal)),
    negotiationScript: {
      recipient: text(ns?.recipient, "Your insurance carrier"),
      emailSubject: text(ns?.emailSubject, "Request to review my policy"),
      emailBody: text(ns?.emailBody),
      phoneTalkingPoints: (ns?.phoneTalkingPoints ?? []).map((t) => text(t)).filter(Boolean),
    },
    disclaimers: (raw.disclaimers ?? []).map((d) => text(d)).filter(Boolean),
  };
}
