"use client";

import { ArrowRight, Download, ExternalLink, FileText, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { useAudit } from "@/components/providers/AuditProvider";
import { DEMO_PRESETS } from "@/lib/presets";
import { SAMPLE_DOCS, type SampleId } from "@/lib/samples-meta";
import { cn, formatUSD } from "@/lib/utils";

export function SampleLibrary() {
  const { runPreset, activePreset } = useAudit();
  const [selected, setSelected] = useState<SampleId>("miller-auto");
  const doc = SAMPLE_DOCS[selected];

  return (
    <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
      <div className="min-w-0 space-y-6">
        {DEMO_PRESETS.map((p) => (
          <section key={p.id} className="rounded-3xl border border-line bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between gap-3 px-1">
              <div>
                <h2 className="text-xl font-extrabold text-ink">{p.name}</h2>
                <p className="mt-0.5 flex items-center gap-1 text-base text-muted">
                  <MapPin className="size-4" /> {p.location}
                </p>
              </div>
              <span className="money rounded-full bg-canvas px-3 py-1 text-base font-bold text-ink">{formatUSD(p.annualSpend)}/yr</span>
            </div>
            <ul className="mt-4 space-y-2">
              {p.docs.map((id) => (
                <li key={id}>
                  <button
                    onClick={() => setSelected(id)}
                    aria-pressed={selected === id}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                      selected === id ? "border-ink bg-ink text-white" : "border-line hover:border-ink/30 hover:bg-canvas",
                    )}
                  >
                    <FileText className={cn("size-5 shrink-0", selected === id ? "text-scan" : "text-risk")} />
                    <span className="min-w-0 flex-1 truncate text-base font-semibold">{SAMPLE_DOCS[id].label}</span>
                    <span className={cn("money text-sm", selected === id ? "text-slate-300" : "text-muted")}>
                      {formatUSD(SAMPLE_DOCS[id].annualPremium)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => runPreset(p)}
              disabled={!!activePreset}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-savings px-4 py-3.5 text-base font-bold text-white transition hover:bg-savings-strong disabled:opacity-60"
            >
              {activePreset === p.id ? <Loader2 className="size-5 animate-spin" /> : null}
              Audit this household <ArrowRight className="size-5" />
            </button>
          </section>
        ))}
      </div>

      <section className="flex min-h-[720px] min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-ink">{doc.label}</p>
            <p className="truncate text-sm text-muted">{doc.fileName}</p>
          </div>
          <div className="flex gap-2">
            <a
              href={`/api/samples/${selected}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-base font-semibold text-ink hover:bg-canvas"
            >
              <ExternalLink className="size-4" /> Open
            </a>
            <a
              href={`/api/samples/${selected}?download=1`}
              download={doc.fileName}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-base font-semibold text-white hover:bg-ink-soft"
            >
              <Download className="size-4" /> Download
            </a>
          </div>
        </div>
        <iframe key={selected} src={`/api/samples/${selected}#view=FitH`} title={doc.label} className="w-full flex-1 bg-canvas" />
      </section>
    </div>
  );
}
