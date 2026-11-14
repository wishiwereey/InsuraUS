"use client";

import { AlertCircle, ArrowRight, Lock, ScanSearch, ShieldCheck, Zap } from "lucide-react";
import { useRef, useState } from "react";
import type { AnalyzeResponse, ApiError, UserContext } from "@/types/insurance";
import type { DemoPreset } from "@/lib/presets";
import { SAMPLE_DOCS } from "@/lib/samples-meta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ContextBar } from "@/components/landing/ContextBar";
import { DemoPresets } from "@/components/landing/DemoPresets";
import { UploadZone } from "@/components/landing/UploadZone";
import { AnalysisProgress } from "@/components/audit/AnalysisProgress";
import { ResultsDashboard } from "@/components/audit/ResultsDashboard";

type Phase = "input" | "analyzing" | "results";

async function fetchSampleFiles(preset: DemoPreset): Promise<File[]> {
  return Promise.all(
    preset.docs.map(async (id) => {
      const res = await fetch(`/api/samples/${id}`);
      if (!res.ok) throw new Error("Could not generate the sample policy PDFs.");
      const blob = await res.blob();
      return new File([blob], SAMPLE_DOCS[id].fileName, { type: "application/pdf" });
    }),
  );
}

export function CoverLensApp() {
  const [phase, setPhase] = useState<Phase>("input");
  const [files, setFiles] = useState<File[]>([]);
  const [context, setContext] = useState<UserContext>({});
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [presetLoading, setPresetLoading] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  async function analyze(docs: File[], ctx: UserContext) {
    setError(null);
    setPhase("analyzing");
    scrollTop();
    try {
      const form = new FormData();
      docs.forEach((f) => form.append("files", f));
      form.append("context", JSON.stringify(ctx));
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      const body = (await res.json().catch(() => ({ error: "The server returned an unexpected response." }))) as
        | AnalyzeResponse
        | ApiError;
      if (!res.ok || "error" in body) {
        throw new Error("error" in body ? body.error : `Request failed (${res.status}).`);
      }
      setResult(body);
      setPhase("results");
      scrollTop();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setPhase("input");
    }
  }

  async function runPreset(preset: DemoPreset) {
    setPresetLoading(preset.id);
    setError(null);
    try {
      const docs = await fetchSampleFiles(preset);
      setFiles(docs);
      setContext(preset.context);
      await analyze(docs, preset.context);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the demo.");
      setPhase("input");
    } finally {
      setPresetLoading(null);
    }
  }

  function reset() {
    setPhase("input");
    setResult(null);
    setFiles([]);
    setError(null);
    scrollTop();
  }

  return (
    <div ref={topRef} className="scroll-mt-20">
      {phase === "input" && (
        <>
          <section className="mx-auto max-w-3xl pt-6 text-center sm:pt-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-ink-soft shadow-card">
              <ShieldCheck className="size-3.5 text-savings" /> Independent AI audit · no commissions · no sign-up
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
              Stop silently overpaying for insurance you don&apos;t understand.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-pretty text-muted sm:text-lg">
              Upload your auto, health and home policies. In under a minute, CoverLens finds hidden overpayments and duplicate
              coverage, stress-tests real claims, and writes the email that gets your premium lowered.
            </p>
          </section>

          <Card className="mx-auto mt-8 max-w-4xl p-4 shadow-lift sm:p-6">
            <UploadZone files={files} onChange={setFiles} disabled={!!presetLoading} />
            <div className="mt-4">
              <ContextBar value={context} onChange={setContext} disabled={!!presetLoading} />
            </div>

            {error && (
              <div role="alert" className="mt-4 flex items-start gap-3 rounded-lg border border-risk/30 bg-risk-soft p-4 text-sm text-risk-strong">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">We couldn&apos;t finish the audit</p>
                  <p className="mt-0.5 text-risk-strong/90">{error}</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-muted">
                <Lock className="size-3.5" /> PDFs are analyzed in memory and never stored.
              </p>
              <Button
                size="lg"
                className="w-full sm:w-auto"
                disabled={files.length === 0 || !!presetLoading}
                onClick={() => analyze(files, context)}
              >
                <ScanSearch /> Audit {files.length > 1 ? `${files.length} policies` : "my policy"} <ArrowRight />
              </Button>
            </div>

            <div className="mt-6">
              <DemoPresets onRun={runPreset} disabled={!!presetLoading} loadingId={presetLoading} />
            </div>
          </Card>

          <section className="mx-auto mt-12 grid max-w-4xl gap-4 pb-6 sm:grid-cols-3">
            {[
              {
                Icon: ScanSearch,
                title: "Reads the fine print",
                body: "Gemini extracts every limit, deductible and endorsement straight from your declarations page.",
              },
              {
                Icon: Zap,
                title: "Finds the bloat",
                body: "Low deductibles on old cars, duplicate roadside & ID-theft add-ons, unused PPOs, missed discounts.",
              },
              {
                Icon: ShieldCheck,
                title: "Protects you first",
                body: "Every cut is stress-tested against real claims and your emergency fund before we recommend it.",
              },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="rounded-xl border border-line bg-surface/60 p-5">
                <Icon className="size-5 text-ink" />
                <p className="mt-3 text-sm font-semibold text-ink">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            ))}
          </section>
        </>
      )}

      {phase === "analyzing" && (
        <div className="pt-6 sm:pt-12">
          <AnalysisProgress fileNames={files.map((f) => f.name)} context={context} />
        </div>
      )}

      {phase === "results" && result && (
        <div className="pt-4">
          <ResultsDashboard data={result} files={files} context={context} onReset={reset} />
        </div>
      )}
    </div>
  );
}
