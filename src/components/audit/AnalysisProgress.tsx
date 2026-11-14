"use client";

import { Check, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { UserContext } from "@/types/insurance";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

const STATE_NAMES: Record<string, string> = {
  TX: "Texas", CA: "California", NY: "New York", FL: "Florida", IL: "Illinois", PA: "Pennsylvania",
  OH: "Ohio", GA: "Georgia", NC: "North Carolina", WA: "Washington", AZ: "Arizona", CO: "Colorado",
  NJ: "New Jersey", MA: "Massachusetts", MI: "Michigan", VA: "Virginia",
};

interface AnalysisProgressProps {
  fileNames: string[];
  context: UserContext;
}

/**
 * Step-by-step progress while Gemini works. Steps advance on a cadence tuned to
 * typical latency and the final step holds until the response arrives — so the
 * UI never claims to be "done" before it is.
 */
export function AnalysisProgress({ fileNames, context }: AnalysisProgressProps) {
  const steps = useMemo(() => {
    const state = context.state ? STATE_NAMES[context.state] ?? context.state : "your state";
    return [
      `Reading ${fileNames.length} policy document${fileNames.length === 1 ? "" : "s"}…`,
      "Extracting declarations pages & coverage tables…",
      "Translating insurance jargon into plain English…",
      `Benchmarking deductibles & limits for ${state}…`,
      "Detecting duplicate & unnecessary coverages…",
      "Stress-testing 3 real-world claim scenarios…",
      "Drafting your carrier negotiation script…",
    ];
  }, [fileNames.length, context.state]);

  const [active, setActive] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const started = Date.now();
    const tick = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 250);
    const advance = setInterval(() => setActive((a) => Math.min(a + 1, steps.length - 1)), 3800);
    return () => {
      clearInterval(tick);
      clearInterval(advance);
    };
  }, [steps.length]);

  const pct = Math.round(((active + 0.5) / steps.length) * 100);

  return (
    <Card className="mx-auto max-w-2xl animate-fade-up overflow-hidden" role="status" aria-live="polite">
      <div className="h-1 bg-canvas">
        <div className="h-full bg-savings transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldCheck className="size-4 text-savings" /> Auditing your coverage
            </p>
            <p className="mt-1 text-sm text-muted">
              Gemini is reading every line of your policies. This usually takes 20–40 seconds.
            </p>
          </div>
          <span className="money rounded-full bg-canvas px-2.5 py-1 text-xs font-semibold text-ink-soft">{elapsed}s</span>
        </div>

        <ol className="mt-6 space-y-3">
          {steps.map((step, i) => {
            const done = i < active;
            const current = i === active;
            return (
              <li
                key={step}
                className={cn(
                  "flex items-center gap-3 text-sm transition-all duration-500",
                  i > active && "opacity-40",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    done && "border-savings bg-savings text-white",
                    current && "border-ink bg-surface text-ink",
                    !done && !current && "border-line bg-surface text-subtle",
                  )}
                >
                  {done ? <Check className="size-3.5" /> : current ? <Loader2 className="size-3.5 animate-spin" /> : <span className="money text-[10px]">{i + 1}</span>}
                </span>
                <span className={cn(current ? "font-medium text-ink" : "text-ink-soft")}>{step}</span>
              </li>
            );
          })}
        </ol>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {fileNames.map((n) => (
            <span key={n} className="max-w-full truncate rounded-md border border-line bg-canvas px-2 py-1 text-[11px] text-muted">
              {n}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}
