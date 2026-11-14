"use client";

import { useAudit } from "@/components/providers/AuditProvider";
import { NegotiationPanel } from "@/components/audit/NegotiationPanel";
import { ResultsSectionTitle } from "@/components/results/ResultsShell";

export default function NegotiatePage() {
  const { result } = useAudit();
  if (!result) return null;
  const { audit } = result;

  return (
    <>
      <ResultsSectionTitle
        eyebrow="Negotiate"
        title="Your script to lower the bill"
        description="Written from your exact policy numbers and coverages. Carriers keep retention budgets for customers who ask — this is how you ask."
      />
      <NegotiationPanel script={audit.negotiationScript} savings={Math.max(0, audit.totalPotentialAnnualSavings)} />
    </>
  );
}
