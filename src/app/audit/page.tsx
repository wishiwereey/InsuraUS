"use client";

import { AlertCircle, ArrowRight, FileCheck2, Lock, ScanSearch, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAudit } from "@/components/providers/AuditProvider";
import { AnalysisProgress } from "@/components/audit/AnalysisProgress";
import { ContextBar } from "@/components/landing/ContextBar";
import { DemoPresets } from "@/components/landing/DemoPresets";
import { UploadZone } from "@/components/landing/UploadZone";
import { Button } from "@/components/ui/button";

const TIPS = [
  "Look for “Declarations Page” in your auto, home or renters policy — it's usually page 1–3.",
  "For health insurance, use your plan's “Summary of Benefits & Coverage” or open-enrollment confirmation.",
  "Uploading every policy together lets us catch duplicates across carriers.",
];

export default function AuditPage() {
  const { status, files, setFiles, context, setContext, runAudit, error, activePreset, result } = useAudit();

  if (status === "analyzing") {
    return (
      <div className="relative overflow-hidden bg-night py-16 sm:py-24">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="relative px-4">
          <AnalysisProgress fileNames={files.map((f) => f.name)} context={context} />
        </div>
      </div>
    );
  }

  const busy = !!activePreset;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-3xl">
        <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">New audit</p>
        <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Upload your policies</h1>
        <p className="mt-4 text-lg text-muted">
          Add one or more insurance PDFs. The more you add, the more duplicates and bundle savings we can find.
        </p>
      </div>

      {result && (
        <Link
          href="/results"
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-savings/30 bg-savings-soft px-5 py-4 text-base font-semibold text-savings-strong transition hover:shadow-card"
        >
          <span className="flex items-center gap-2">
            <FileCheck2 className="size-5" /> You have a finished audit from earlier in this session.
          </span>
          <span className="flex items-center gap-1">
            View results <ArrowRight className="size-4" />
          </span>
        </Link>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <h2 className="flex items-center gap-3 text-xl font-bold text-ink">
              <span className="money flex size-8 items-center justify-center rounded-full bg-ink text-sm text-white">1</span>
              Add your PDFs
            </h2>
            <div className="mt-5">
              <UploadZone files={files} onChange={setFiles} disabled={busy} />
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
            <h2 className="flex items-center gap-3 text-xl font-bold text-ink">
              <span className="money flex size-8 items-center justify-center rounded-full bg-ink text-sm text-white">2</span>
              Tell us about your household <span className="text-base font-medium text-muted">(optional)</span>
            </h2>
            <p className="mt-2 text-base text-muted">
              Helps us apply your state&apos;s rules and make sure higher deductibles fit your emergency fund.
            </p>
            <div className="mt-5">
              <ContextBar value={context} onChange={setContext} disabled={busy} />
            </div>
          </section>

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-risk/30 bg-risk-soft p-5 text-risk-strong">
              <AlertCircle className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="text-base font-bold">We couldn&apos;t finish the audit</p>
                <p className="mt-1 text-base break-words">{error}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col items-stretch gap-4 rounded-3xl bg-night p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="flex items-center gap-2 text-base text-slate-300">
              <Lock className="size-5 text-scan" /> PDFs are analyzed in memory and never stored.
            </p>
            <Button
              size="lg"
              className="h-14 bg-scan px-7 text-lg font-bold text-night hover:bg-white"
              disabled={files.length === 0 || busy}
              onClick={() => runAudit()}
            >
              <ScanSearch className="!size-5" /> Audit {files.length > 1 ? `${files.length} policies` : "my policy"}
            </Button>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-line bg-surface p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <Sparkles className="size-5 text-savings" /> What to upload
            </h2>
            <ul className="mt-4 space-y-4">
              {TIPS.map((t) => (
                <li key={t} className="flex gap-3 text-base text-ink-soft">
                  <span className="mt-2 size-2 shrink-0 rounded-full bg-savings" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section className="mt-16">
        <h2 className="text-2xl font-extrabold text-ink">No policy handy? Use a sample household</h2>
        <p className="mt-2 text-base text-muted">Generates real PDFs and runs the full live audit.</p>
        <div className="mt-6">
          <DemoPresets />
        </div>
      </section>
    </div>
  );
}
