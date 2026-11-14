"use client";

import { useState } from "react";
import { useAudit } from "@/components/providers/AuditProvider";
import { PolicyBreakdown } from "@/components/audit/PolicyBreakdown";
import { ResultsSectionTitle } from "@/components/results/ResultsShell";
import type { PolicyStatus } from "@/types/insurance";
import { cn } from "@/lib/utils";

const FILTERS: { id: "all" | PolicyStatus; label: string }[] = [
  { id: "all", label: "All policies" },
  { id: "overpaying", label: "Overpaying" },
  { id: "suboptimal", label: "Suboptimal" },
  { id: "optimized", label: "Optimized" },
];

export default function PoliciesPage() {
  const { result } = useAudit();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  if (!result) return null;
  const policies = result.audit.policies;
  const shown = filter === "all" ? policies : policies.filter((p) => p.status === filter);

  return (
    <>
      <ResultsSectionTitle
        eyebrow="Policy audit"
        title="Your policies, decoded"
        description="What each coverage really means, and what to change. Tap a policy to open it."
      />
      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter policies">
        {FILTERS.map((f) => {
          const count = f.id === "all" ? policies.length : policies.filter((p) => p.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={cn(
                "rounded-full border px-4 py-2 text-base font-semibold transition",
                filter === f.id ? "border-ink bg-ink text-white" : "border-line bg-surface text-ink-soft hover:border-ink/30",
              )}
            >
              {f.label} <span className="money opacity-60">{count}</span>
            </button>
          );
        })}
      </div>
      {shown.length ? (
        <PolicyBreakdown key={filter} policies={shown} />
      ) : (
        <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-lg text-muted">No policies in this group.</p>
      )}
    </>
  );
}
