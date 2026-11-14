"use client";

import { ArrowRight, Download, FileDown, Home, MapPin, User, Users } from "lucide-react";
import { useState } from "react";
import { DEMO_PRESETS, type DemoPreset } from "@/lib/presets";
import { SAMPLE_DOCS, type SampleId } from "@/lib/samples-meta";
import { cn, formatUSD } from "@/lib/utils";

interface DemoPresetsProps {
  onRun: (preset: DemoPreset) => void;
  disabled?: boolean;
  loadingId?: string | null;
}

/**
 * 1-click demos. Each preset downloads REAL generated PDFs from /api/samples
 * and pushes them through the exact same Gemini pipeline as a user upload.
 */
export function DemoPresets({ onRun, disabled, loadingId }: DemoPresetsProps) {
  const [showDownloads, setShowDownloads] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium text-muted">No policy handy? Try a realistic US household</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {DEMO_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={disabled}
            onClick={() => onRun(p)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-xl border border-line bg-surface p-4 text-left shadow-card transition-all",
              "hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-lift disabled:pointer-events-none disabled:opacity-60",
              loadingId === p.id && "border-savings ring-2 ring-savings/20",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <span className="flex size-8 items-center justify-center rounded-lg bg-canvas text-ink">
                {p.context.householdSize && p.context.householdSize > 1 ? <Users className="size-4" /> : <User className="size-4" />}
              </span>
              <span className="money rounded-full bg-canvas px-2 py-0.5 text-xs font-semibold text-ink-soft">
                {formatUSD(p.annualSpend)}/yr
              </span>
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink">{p.name}</span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="size-3" /> {p.location}
              </span>
            </span>
            <span className="text-xs text-ink-soft">{p.blurb}</span>
            <span className="mt-auto flex items-center gap-1 pt-1 text-xs font-semibold text-savings-strong">
              Run live audit <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowDownloads((v) => !v)}
          aria-expanded={showDownloads}
          className="group flex flex-col items-start gap-2 rounded-xl border border-dashed border-line-strong bg-canvas/60 p-4 text-left transition-all hover:border-ink/30 hover:bg-surface"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-surface text-ink shadow-card">
            <FileDown className="size-4" />
          </span>
          <span className="block text-sm font-semibold text-ink">Download sample PDFs</span>
          <span className="text-xs text-ink-soft">
            Inspect the 6 generated declarations pages, then drag them into the uploader yourself.
          </span>
          <span className="mt-auto flex items-center gap-1 pt-1 text-xs font-semibold text-ink">
            {showDownloads ? "Hide files" : "Show files"} <ArrowRight className={cn("size-3.5 transition-transform", showDownloads && "rotate-90")} />
          </span>
        </button>
      </div>

      {showDownloads && (
        <div className="mt-3 grid animate-fade-up gap-4 rounded-xl border border-line bg-surface p-4 shadow-card md:grid-cols-2">
          {DEMO_PRESETS.map((p) => (
            <div key={p.id}>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                <Home className="size-3.5 text-muted" /> {p.name} · {p.location}
              </p>
              <ul className="space-y-1.5">
                {p.docs.map((id: SampleId) => (
                  <li key={id}>
                    <a
                      href={`/api/samples/${id}?download=1`}
                      download={SAMPLE_DOCS[id].fileName}
                      className="flex items-center justify-between gap-3 rounded-lg border border-line px-3 py-2 text-xs transition hover:border-ink/25 hover:bg-canvas"
                    >
                      <span className="min-w-0 truncate font-medium text-ink-soft">{SAMPLE_DOCS[id].label}</span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="money text-muted">{formatUSD(SAMPLE_DOCS[id].annualPremium)}/yr</span>
                        <Download className="size-3.5 text-ink" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
