/**
 * InsuraUS domain types.
 *
 * These interfaces mirror the Gemini `responseSchema` defined in
 * `src/lib/gemini/schema.ts`. If you change one, change the other.
 */

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN",
  "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT",
  "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export type UsState = (typeof US_STATES)[number];

export type DoctorVisitFrequency = "low" | "medium" | "high";

/** Optional household context the user supplies in the Context Bar. */
export interface UserContext {
  state?: UsState;
  age?: number;
  householdSize?: number;
  doctorVisits?: DoctorVisitFrequency;
  emergencyFund?: number;
}

export type PolicyType = "auto" | "health" | "home" | "renters" | "life" | "umbrella" | "other";

export type PolicyStatus = "overpaying" | "suboptimal" | "optimized";

export type IssueSeverity = "high" | "medium" | "low";

export type IssueCategory =
  | "deductible"
  | "duplicate_coverage"
  | "unnecessary_coverage"
  | "underinsured"
  | "plan_mismatch"
  | "missing_discount"
  | "other";

export interface PolicyIssue {
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
  /** Plain-English explanation of why this is a problem. */
  explanation: string;
  /** Estimated annual savings in USD. Negative = recommended extra spend (e.g. underinsured). */
  annualSavings: number;
  /** Concrete next step the user can take. */
  actionItem: string;
}

/** One line from the declarations page, translated from jargon. */
export interface CoverageLine {
  /** Term exactly as it appears in the policy, e.g. "Bodily Injury Liability". */
  term: string;
  /** Value as printed, e.g. "$50,000 / $100,000". */
  value: string;
  /** "Jargon Translator" — what it actually means for the user. */
  plainEnglish: string;
  /** Optional annual premium attributable to this line. */
  annualPremium?: number;
}

export interface AnalyzedPolicy {
  type: PolicyType;
  carrier: string;
  policyNumber: string;
  /** Short human label, e.g. "2018 Honda CR-V + 2021 Toyota Highlander". */
  insuredItem: string;
  currentAnnualPremium: number;
  /** Premium after applying every recommendation for this policy. */
  optimizedAnnualPremium: number;
  /** Headline deductible as printed, e.g. "$250 collision / $250 comprehensive". */
  deductible: string;
  /** Headline coverage limit as printed. */
  coverageLimit: string;
  status: PolicyStatus;
  /** One-sentence plain-English summary of what this policy does. */
  plainEnglishSummary: string;
  coverageLines: CoverageLine[];
  issues: PolicyIssue[];
}

export interface WhatIfScenario {
  title: string;
  policyType: PolicyType;
  /** Total cost of the event before insurance pays, USD. */
  eventCost: number;
  description: string;
  currentPlanOutOfPocket: number;
  optimizedPlanOutOfPocket: number;
  /** Total annual premiums across all policies on the current plan. */
  currentAnnualPremiums: number;
  /** Total annual premiums across all policies on the optimized plan. */
  optimizedAnnualPremiums: number;
  /** Computed server-side: premiums + out-of-pocket. */
  currentNetOneYearCost: number;
  /** Computed server-side: premiums + out-of-pocket. */
  optimizedNetOneYearCost: number;
  /** Plain-English takeaway: do they come out ahead even with the claim? */
  verdict: string;
}

export interface ScoreFactor {
  label: string;
  /** 0–100 */
  score: number;
  note: string;
}

export interface NegotiationScript {
  /** Who to send it to, e.g. "Lone Star Mutual — Customer Retention". */
  recipient: string;
  emailSubject: string;
  emailBody: string;
  phoneTalkingPoints: string[];
}

export interface AuditResult {
  insuranceHealthScore: number;
  scoreFactors: ScoreFactor[];
  totalCurrentAnnualSpend: number;
  totalPotentialAnnualSavings: number;
  summaryVerdict: string;
  policies: AnalyzedPolicy[];
  whatIfScenarios: WhatIfScenario[];
  negotiationScript: NegotiationScript;
  /** Important caveats the model wants the user to know (state minimums, etc.). */
  disclaimers: string[];
}

/** Envelope returned by POST /api/analyze. */
export interface AnalyzeResponse {
  audit: AuditResult;
  meta: {
    model: string;
    fileNames: string[];
    durationMs: number;
    /** True when every document was a built-in sample (free, never counts against the trial). */
    demo: boolean;
  };
}

export interface ApiError {
  error: string;
  code?: "MISSING_API_KEY" | "BAD_REQUEST" | "FILE_TOO_LARGE" | "UPSTREAM_ERROR" | "INVALID_AI_OUTPUT" | "PAYWALL";
  /** Present when code === "PAYWALL". */
  reason?: "trial_used" | "file_limit" | "chat_limit";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
