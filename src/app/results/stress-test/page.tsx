"use client";

import { useAudit } from "@/components/providers/AuditProvider";
import { WhatIfSimulator } from "@/components/audit/WhatIfSimulator";
import { ResultsSectionTitle } from "@/components/results/ResultsShell";

export default function StressTestPage() {
  const { result } = useAudit();
  if (!result) return null;
  const scenarios = result.audit.whatIfScenarios;

  return (
    <>
      <ResultsSectionTitle
        eyebrow="What-if stress test"
        title="Would the cheaper plan burn you in an emergency?"
        description="Three realistic claims built from your actual deductibles and limits. Total yearly cost = premiums + what you'd pay out of pocket for the claim."
      />
      {scenarios.length ? (
        <WhatIfSimulator scenarios={scenarios} />
      ) : (
        <p className="text-lg text-muted">No scenarios were generated for these documents.</p>
      )}
    </>
  );
}
