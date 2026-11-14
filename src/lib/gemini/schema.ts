import { Type, type Schema } from "@google/genai";

/**
 * Gemini structured-output schema for an audit. Mirrors `AuditResult` in
 * `src/types/insurance.ts`. `propertyOrdering` makes the model emit fields in
 * a sensible reasoning order (extract → diagnose → quantify → summarize).
 */

const str = (description: string): Schema => ({ type: Type.STRING, description });
const num = (description: string): Schema => ({ type: Type.NUMBER, description });

const policyTypeEnum: Schema = {
  type: Type.STRING,
  format: "enum",
  enum: ["auto", "health", "home", "renters", "life", "umbrella", "other"],
};

const coverageLine: Schema = {
  type: Type.OBJECT,
  properties: {
    term: str("Coverage name exactly as printed in the document."),
    value: str("Limit / deductible / copay as printed, e.g. '$100,000 / $300,000'."),
    plainEnglish: str("One sentence a non-expert understands: what this pays for, and when it matters."),
    annualPremium: num("Annual premium for this line if printed, else omit."),
  },
  required: ["term", "value", "plainEnglish"],
  propertyOrdering: ["term", "value", "plainEnglish", "annualPremium"],
};

const issue: Schema = {
  type: Type.OBJECT,
  properties: {
    title: str("Short, specific headline, e.g. '$250 collision deductible on a $7,200 car'."),
    category: {
      type: Type.STRING,
      format: "enum",
      enum: [
        "deductible",
        "duplicate_coverage",
        "unnecessary_coverage",
        "underinsured",
        "plan_mismatch",
        "missing_discount",
        "other",
      ],
    },
    severity: { type: Type.STRING, format: "enum", enum: ["high", "medium", "low"] },
    explanation: str("2–3 plain-English sentences citing the exact numbers from the document."),
    annualSavings: num(
      "Estimated annual USD saved by fixing this. Use a NEGATIVE number when the fix costs money (e.g. raising liability limits).",
    ),
    actionItem: str("A concrete, imperative next step (who to call / what to ask for / what form)."),
  },
  required: ["title", "category", "severity", "explanation", "annualSavings", "actionItem"],
  propertyOrdering: ["title", "category", "severity", "explanation", "annualSavings", "actionItem"],
};

const policy: Schema = {
  type: Type.OBJECT,
  properties: {
    type: policyTypeEnum,
    carrier: str("Insurance company name as printed."),
    policyNumber: str("Policy / member / group number as printed, or 'Not listed'."),
    insuredItem: str("What is insured, e.g. '2021 Toyota Highlander + 2014 Honda Civic' or 'Family of 4 — PPO'."),
    currentAnnualPremium: num("What the USER pays per year for this policy (for employer health plans: employee contribution only)."),
    optimizedAnnualPremium: num("Annual premium after applying every issue's recommendation."),
    deductible: str("Headline deductible(s) as printed."),
    coverageLimit: str("Headline limit(s) as printed."),
    status: { type: Type.STRING, format: "enum", enum: ["overpaying", "suboptimal", "optimized"] },
    plainEnglishSummary: str("One sentence: what this policy does for this household."),
    coverageLines: { type: Type.ARRAY, items: coverageLine, description: "4–10 most important coverage lines." },
    issues: { type: Type.ARRAY, items: issue, description: "0–6 issues, highest dollar impact first." },
  },
  required: [
    "type",
    "carrier",
    "policyNumber",
    "insuredItem",
    "currentAnnualPremium",
    "optimizedAnnualPremium",
    "deductible",
    "coverageLimit",
    "status",
    "plainEnglishSummary",
    "coverageLines",
    "issues",
  ],
  propertyOrdering: [
    "type",
    "carrier",
    "policyNumber",
    "insuredItem",
    "currentAnnualPremium",
    "deductible",
    "coverageLimit",
    "plainEnglishSummary",
    "coverageLines",
    "issues",
    "optimizedAnnualPremium",
    "status",
  ],
};

const scenario: Schema = {
  type: Type.OBJECT,
  properties: {
    title: str("Short label with the dollar amount, e.g. 'Fender Bender ($4,200 repair)'."),
    policyType: policyTypeEnum,
    eventCost: num("Total cost of the event before insurance, USD."),
    description: str("1–2 sentences: what happens and which coverage responds."),
    currentPlanOutOfPocket: num("USD the household pays under the CURRENT policies (deductibles, copays, coinsurance, capped at OOP max)."),
    optimizedPlanOutOfPocket: num("USD the household pays under the OPTIMIZED recommendations."),
    currentAnnualPremiums: num("Total annual premiums across all policies, current plan."),
    optimizedAnnualPremiums: num("Total annual premiums across all policies, optimized plan."),
    verdict: str("One sentence: net outcome for the year including this claim."),
  },
  required: [
    "title",
    "policyType",
    "eventCost",
    "description",
    "currentPlanOutOfPocket",
    "optimizedPlanOutOfPocket",
    "currentAnnualPremiums",
    "optimizedAnnualPremiums",
    "verdict",
  ],
  propertyOrdering: [
    "title",
    "policyType",
    "eventCost",
    "description",
    "currentPlanOutOfPocket",
    "optimizedPlanOutOfPocket",
    "currentAnnualPremiums",
    "optimizedAnnualPremiums",
    "verdict",
  ],
};

export const auditResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    policies: { type: Type.ARRAY, items: policy },
    whatIfScenarios: { type: Type.ARRAY, items: scenario, description: "Exactly 3 scenarios." },
    scoreFactors: {
      type: Type.ARRAY,
      description: "Exactly 4 factors: Cost Efficiency, Coverage Adequacy, Redundancy, Emergency Readiness.",
      items: {
        type: Type.OBJECT,
        properties: {
          label: str("Factor name."),
          score: { type: Type.INTEGER, description: "0–100" },
          note: str("One short sentence."),
        },
        required: ["label", "score", "note"],
        propertyOrdering: ["label", "score", "note"],
      },
    },
    insuranceHealthScore: { type: Type.INTEGER, description: "0–100 overall score; roughly the average of scoreFactors." },
    totalCurrentAnnualSpend: num("Sum of currentAnnualPremium across policies."),
    totalPotentialAnnualSavings: num("Sum of positive issue annualSavings net of any recommended extra spend."),
    summaryVerdict: str("Exactly 2 plain-English sentences: the headline finding and the single most valuable action."),
    negotiationScript: {
      type: Type.OBJECT,
      properties: {
        recipient: str("Carrier + department to contact (e.g. 'Lone Star Mutual — Customer Retention')."),
        emailSubject: str("Email subject line including the policy number."),
        emailBody: str(
          "Complete, ready-to-send email (plain text, \\n line breaks) signed with the named insured. References exact policy numbers, coverages, and requested changes.",
        ),
        phoneTalkingPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5–8 short phone talking points." },
      },
      required: ["recipient", "emailSubject", "emailBody", "phoneTalkingPoints"],
      propertyOrdering: ["recipient", "emailSubject", "emailBody", "phoneTalkingPoints"],
    },
    disclaimers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "1–4 important caveats specific to this household." },
  },
  required: [
    "policies",
    "whatIfScenarios",
    "scoreFactors",
    "insuranceHealthScore",
    "totalCurrentAnnualSpend",
    "totalPotentialAnnualSavings",
    "summaryVerdict",
    "negotiationScript",
    "disclaimers",
  ],
  propertyOrdering: [
    "policies",
    "whatIfScenarios",
    "scoreFactors",
    "insuranceHealthScore",
    "totalCurrentAnnualSpend",
    "totalPotentialAnnualSavings",
    "summaryVerdict",
    "negotiationScript",
    "disclaimers",
  ],
};
