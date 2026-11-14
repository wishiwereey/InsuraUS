"use client";

import { FileText, ShieldCheck } from "lucide-react";
import { useAudit } from "@/components/providers/AuditProvider";
import { PolicyChat } from "@/components/audit/PolicyChat";
import { ResultsSectionTitle } from "@/components/results/ResultsShell";

export default function CopilotPage() {
  const { result, files, context } = useAudit();
  if (!result) return null;

  return (
    <>
      <ResultsSectionTitle
        eyebrow="Policy Copilot"
        title="Ask anything about your policies"
        description="The Copilot has read the same PDFs. It quotes your exact coverages and shows the math for any what-if."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {files.length ? (
          <PolicyChat files={files} context={context} audit={result.audit} />
        ) : (
          <div className="rounded-3xl border border-dashed border-line-strong p-10 text-center text-lg text-muted">
            Your original PDFs aren&apos;t available in this browser anymore. Re-run the audit to chat about them.
          </div>
        )}
        <aside className="space-y-4">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
            <h2 className="text-lg font-bold text-ink">Documents in context</h2>
            <ul className="mt-4 space-y-3">
              {result.meta.fileNames.map((n) => (
                <li key={n} className="flex items-start gap-3 text-base text-ink-soft">
                  <FileText className="mt-1 size-5 shrink-0 text-risk" />
                  <span className="break-all">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-night p-6 text-base text-slate-300">
            <ShieldCheck className="size-6 text-scan" />
            <p className="mt-3">
              Answers come only from your documents. If the policy doesn&apos;t say, the Copilot tells you exactly what to ask
              your carrier.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
