import { describe, expect, it } from "vitest";
import { normalizeAudit } from "@/lib/audit/normalize";
import type { AuditResult } from "@/types/insurance";

const issue = (annualSavings: number, extra: Record<string, unknown> = {}) => ({
  title: `Issue ${annualSavings}`,
  category: "deductible",
  severity: "medium",
  explanation: "x",
  annualSavings,
  actionItem: "Do it.",
  ...extra,
});

const raw = (over: Record<string, unknown> = {}) =>
  ({
    insuranceHealthScore: 60,
    scoreFactors: [],
    policies: [],
    whatIfScenarios: [],
    summaryVerdict: "Switch plans to save $500/yr.",
    negotiationScript: { recipient: "Carrier", emailSubject: "S", emailBody: "B", phoneTalkingPoints: ["a"] },
    disclaimers: [],
    ...over,
  }) as unknown as Partial<AuditResult>;

describe("normalizeAudit — totals are recomputed, never trusted from the model", () => {
  it("sums current premiums and gross savings across policies", () => {
    const out = normalizeAudit(
      raw({
        totalCurrentAnnualSpend: 99999, // model's number must be ignored
        totalPotentialAnnualSavings: 99999,
        policies: [
          { type: "auto", currentAnnualPremium: 2760, issues: [issue(380), issue(72)] },
          { type: "home", currentAnnualPremium: 2040, issues: [issue(176)] },
        ],
      }),
    );
    expect(out.totalCurrentAnnualSpend).toBe(4800);
    expect(out.totalPotentialAnnualSavings).toBe(628);
    expect(out.totalRecommendedUpgrades).toBe(0);
  });

  it("reports protection upgrades separately instead of netting them out of savings (regression)", () => {
    // Real-world case: $120 of savings + a $192 liability increase used to show "You could save $0".
    const out = normalizeAudit(
      raw({ policies: [{ type: "auto", currentAnnualPremium: 3278, issues: [issue(72), issue(48), issue(-192, { category: "underinsured" })] }] }),
    );
    expect(out.totalPotentialAnnualSavings).toBe(120);
    expect(out.totalRecommendedUpgrades).toBe(192);
    // The per-policy optimized premium is still the honest net figure.
    expect(out.policies[0].optimizedAnnualPremium).toBe(3278 - 120 + 192);
  });

  it("parses money strings and rounds to whole dollars", () => {
    const out = normalizeAudit(raw({ policies: [{ type: "auto", currentAnnualPremium: "$2,760.40", issues: [issue("380.6" as never)] }] }));
    expect(out.policies[0].currentAnnualPremium).toBe(2760);
    expect(out.policies[0].issues[0].annualSavings).toBe(381);
  });

  it("never produces a negative optimized premium", () => {
    const out = normalizeAudit(raw({ policies: [{ type: "auto", currentAnnualPremium: 100, issues: [issue(500)] }] }));
    expect(out.policies[0].optimizedAnnualPremium).toBe(0);
  });
});

describe("normalizeAudit — policy status is derived deterministically", () => {
  it("is 'overpaying' when savings are at least 10% of the premium", () => {
    const out = normalizeAudit(raw({ policies: [{ currentAnnualPremium: 1000, issues: [issue(100)], status: "optimized" }] }));
    expect(out.policies[0].status).toBe("overpaying");
  });

  it("is 'suboptimal' for small savings or any coverage gap", () => {
    const small = normalizeAudit(raw({ policies: [{ currentAnnualPremium: 1000, issues: [issue(50)] }] }));
    const gap = normalizeAudit(raw({ policies: [{ currentAnnualPremium: 1000, issues: [issue(0, { category: "underinsured" })] }] }));
    expect(small.policies[0].status).toBe("suboptimal");
    expect(gap.policies[0].status).toBe("suboptimal");
  });

  it("is 'optimized' with no issues, and never 'overpaying' without evidence", () => {
    const out = normalizeAudit(raw({ policies: [{ currentAnnualPremium: 1000, issues: [], status: "overpaying" }] }));
    expect(out.policies[0].status).toBe("suboptimal"); // model said overpaying with no evidence → downgraded, not trusted
    const clean = normalizeAudit(raw({ policies: [{ currentAnnualPremium: 1000, issues: [] }] }));
    expect(clean.policies[0].status).toBe("optimized");
  });

  it("sorts issues by severity, then by savings", () => {
    const out = normalizeAudit(
      raw({
        policies: [
          {
            currentAnnualPremium: 5000,
            issues: [issue(10, { severity: "low" }), issue(50, { severity: "high" }), issue(300, { severity: "high" })],
          },
        ],
      }),
    );
    expect(out.policies[0].issues.map((i) => i.annualSavings)).toEqual([300, 50, 10]);
  });
});

describe("normalizeAudit — what-if scenarios", () => {
  it("uses portfolio premiums from the policies and computes 1-year net cost", () => {
    const out = normalizeAudit(
      raw({
        policies: [{ currentAnnualPremium: 2000, issues: [issue(500)] }],
        whatIfScenarios: [
          { title: "Crash", eventCost: 4200, currentPlanOutOfPocket: 250, optimizedPlanOutOfPocket: 1000, currentAnnualPremiums: 1, optimizedAnnualPremiums: 1 },
        ],
      }),
    );
    const s = out.whatIfScenarios[0];
    expect(s.currentAnnualPremiums).toBe(2000);
    expect(s.optimizedAnnualPremiums).toBe(1500);
    expect(s.currentNetOneYearCost).toBe(2250);
    expect(s.optimizedNetOneYearCost).toBe(2500);
  });

  it("caps out-of-pocket at the event cost and floors it at zero", () => {
    const out = normalizeAudit(
      raw({ whatIfScenarios: [{ title: "x", eventCost: 4200, currentPlanOutOfPocket: -50, optimizedPlanOutOfPocket: 9999 }] }),
    );
    expect(out.whatIfScenarios[0].currentPlanOutOfPocket).toBe(0);
    expect(out.whatIfScenarios[0].optimizedPlanOutOfPocket).toBe(4200);
  });

  it("keeps at most 3 scenarios", () => {
    const sc = { title: "x", eventCost: 1 };
    expect(normalizeAudit(raw({ whatIfScenarios: [sc, sc, sc, sc, sc] })).whatIfScenarios).toHaveLength(3);
  });
});

describe("normalizeAudit — score and verdict", () => {
  it("clamps the health score to 0–100", () => {
    expect(normalizeAudit(raw({ insuranceHealthScore: 140 })).insuranceHealthScore).toBe(100);
    expect(normalizeAudit(raw({ insuranceHealthScore: -5 })).insuranceHealthScore).toBe(0);
  });

  it("falls back to the average of factor scores when the model omits the score", () => {
    const out = normalizeAudit(
      raw({
        insuranceHealthScore: undefined,
        scoreFactors: [
          { label: "a", score: 40, note: "" },
          { label: "b", score: 80, note: "" },
        ],
      }),
    );
    expect(out.insuranceHealthScore).toBe(60);
  });

  it("keeps the verdict to one sentence and strips cents", () => {
    const out = normalizeAudit(
      raw({
        summaryVerdict:
          "The Millers overpay an estimated $4,916.40 annually due to duplicate coverage. The single most valuable action is to switch plans.",
      }),
    );
    expect(out.summaryVerdict).toBe("The Millers overpay an estimated $4,916 annually due to duplicate coverage.");
  });
});
