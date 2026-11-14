"use client";

import { ArrowRight, Loader2, MapPin, User, Users } from "lucide-react";
import Link from "next/link";
import { useAudit } from "@/components/providers/AuditProvider";
import { DEMO_PRESETS } from "@/lib/presets";
import { SAMPLE_DOCS } from "@/lib/samples-meta";
import { cn, formatUSD } from "@/lib/utils";

/**
 * 1-click demos. Each preset downloads REAL generated PDFs from /api/samples
 * and pushes them through the exact same Gemini pipeline as a user upload.
 */
export function DemoPresets({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { runPreset, activePreset, status } = useAudit();
  const busy = !!activePreset || status === "analyzing";
  const dark = variant === "dark";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {DEMO_PRESETS.map((p) => {
        const loading = activePreset === p.id;
        return (
          <button
            key={p.id}
            type="button"
            disabled={busy}
            onClick={() => runPreset(p)}
            className={cn(
              "group relative flex flex-col items-start gap-3 rounded-2xl border p-6 text-left transition-all disabled:cursor-wait",
              dark
                ? "border-night-line bg-night-2 hover:-translate-y-1 hover:border-scan/50 hover:shadow-glow"
                : "border-line bg-surface shadow-card hover:-translate-y-1 hover:border-ink/20 hover:shadow-lift",
              busy && !loading && "opacity-50",
              loading && "border-scan shadow-glow",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-xl",
                  dark ? "bg-white/5 text-scan" : "bg-savings-soft text-savings-strong",
                )}
              >
                {(p.context.householdSize ?? 1) > 1 ? <Users className="size-5" /> : <User className="size-5" />}
              </span>
              <span
                className={cn(
                  "money rounded-full px-3 py-1 text-sm font-bold",
                  dark ? "bg-white/5 text-slate-200" : "bg-canvas text-ink",
                )}
              >
                {formatUSD(p.annualSpend)}/yr
              </span>
            </span>
            <span>
              <span className={cn("block text-xl font-bold", dark ? "text-white" : "text-ink")}>{p.name}</span>
              <span className={cn("mt-0.5 flex items-center gap-1 text-sm", dark ? "text-slate-400" : "text-muted")}>
                <MapPin className="size-4" /> {p.location}
              </span>
            </span>
            <ul className={cn("space-y-1 text-sm", dark ? "text-slate-300" : "text-ink-soft")}>
              {p.docs.map((d) => (
                <li key={d}>• {SAMPLE_DOCS[d].label}</li>
              ))}
            </ul>
            <span
              className={cn(
                "mt-auto inline-flex items-center gap-2 pt-2 text-base font-bold",
                dark ? "text-scan" : "text-savings-strong",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Loading policies…
                </>
              ) : (
                <>
                  Run live audit <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
          </button>
        );
      })}

      <Link
        href="/samples"
        className={cn(
          "group flex flex-col items-start gap-3 rounded-2xl border border-dashed p-6 transition-all",
          dark ? "border-slate-600 hover:border-scan/60 hover:bg-white/[0.02]" : "border-line-strong bg-canvas hover:border-ink/30 hover:bg-surface",
        )}
      >
        <span className={cn("block text-xl font-bold", dark ? "text-white" : "text-ink")}>Browse sample PDFs</span>
        <span className={cn("text-sm", dark ? "text-slate-300" : "text-ink-soft")}>
          Preview and download all 6 generated declarations pages, then drag them into the uploader yourself.
        </span>
        <span className={cn("mt-auto inline-flex items-center gap-2 pt-2 text-base font-bold", dark ? "text-white" : "text-ink")}>
          Open library <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </div>
  );
}
