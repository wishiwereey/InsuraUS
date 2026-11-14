/** Client-safe metadata for the generated demo PDFs (no pdf-lib import). */

export type SampleId =
  | "miller-auto"
  | "miller-health"
  | "miller-home"
  | "rivera-auto"
  | "rivera-renters"
  | "rivera-health";

export interface SampleDocMeta {
  id: SampleId;
  fileName: string;
  label: string;
  policyType: "auto" | "health" | "home" | "renters";
  annualPremium: number;
}

export const SAMPLE_DOCS: Record<SampleId, SampleDocMeta> = {
  "miller-auto": {
    id: "miller-auto",
    fileName: "Miller_Auto_Declarations_LoneStarMutual.pdf",
    label: "Auto — Lone Star Mutual (2 vehicles)",
    policyType: "auto",
    annualPremium: 2760,
  },
  "miller-health": {
    id: "miller-health",
    fileName: "Miller_Health_PPO_Enrollment_Bluebonnet.pdf",
    label: "Health — Bluebonnet Family PPO",
    policyType: "health",
    annualPremium: 3840,
  },
  "miller-home": {
    id: "miller-home",
    fileName: "Miller_Homeowners_HO3_HillCountry.pdf",
    label: "Home — Hill Country HO-3",
    policyType: "home",
    annualPremium: 2040,
  },
  "rivera-auto": {
    id: "rivera-auto",
    fileName: "Rivera_Auto_Declarations_PacificCrest.pdf",
    label: "Auto — Pacific Crest (2012 Mazda3)",
    policyType: "auto",
    annualPremium: 1980,
  },
  "rivera-renters": {
    id: "rivera-renters",
    fileName: "Rivera_Renters_HO4_HarborMutual.pdf",
    label: "Renters — Harbor Mutual HO-4",
    policyType: "renters",
    annualPremium: 240,
  },
  "rivera-health": {
    id: "rivera-health",
    fileName: "Rivera_Health_PlatinumPPO_GoldenCoast.pdf",
    label: "Health — Golden Coast Platinum PPO",
    policyType: "health",
    annualPremium: 1200,
  },
};

export function isSampleId(value: string): value is SampleId {
  return value in SAMPLE_DOCS;
}
