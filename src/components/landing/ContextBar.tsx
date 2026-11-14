"use client";

import { SlidersHorizontal } from "lucide-react";
import type { DoctorVisitFrequency, UserContext, UsState } from "@/types/insurance";
import { US_STATES } from "@/types/insurance";
import { cn } from "@/lib/utils";

const FEATURED_STATES: UsState[] = ["TX", "CA", "NY", "FL", "IL", "PA", "OH", "GA", "NC", "WA"];
const OTHER_STATES = US_STATES.filter((s) => !FEATURED_STATES.includes(s));

const field =
  "h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink shadow-card transition focus:border-ink/40 focus:outline-none focus:ring-2 focus:ring-ink/5 disabled:opacity-60";

interface ContextBarProps {
  value: UserContext;
  onChange: (value: UserContext) => void;
  disabled?: boolean;
}

/** Optional household context that sharpens benchmarks (state rules, HSA math, deductible safety). */
export function ContextBar({ value, onChange, disabled }: ContextBarProps) {
  const set = <K extends keyof UserContext>(key: K, v: UserContext[K]) => onChange({ ...value, [key]: v });
  const num = (s: string) => (s === "" ? undefined : Math.max(0, Number(s.replace(/[^0-9]/g, ""))));

  return (
    <fieldset disabled={disabled} className="rounded-xl border border-line bg-canvas/60 p-4">
      <legend className="sr-only">Household context</legend>
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-ink-soft">
        <SlidersHorizontal className="size-3.5" />
        Sharpen your audit <span className="font-normal text-muted">— optional</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">State</span>
          <select
            className={field}
            value={value.state ?? ""}
            onChange={(e) => set("state", (e.target.value || undefined) as UsState | undefined)}
          >
            <option value="">Auto-detect</option>
            <optgroup label="Popular">
              {FEATURED_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </optgroup>
            <optgroup label="All states">
              {OTHER_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </optgroup>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Age</span>
          <input
            className={cn(field, "money")}
            inputMode="numeric"
            placeholder="34"
            value={value.age ?? ""}
            onChange={(e) => set("age", num(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Household size</span>
          <input
            className={cn(field, "money")}
            inputMode="numeric"
            placeholder="3"
            value={value.householdSize ?? ""}
            onChange={(e) => set("householdSize", num(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] font-medium text-muted">Doctor visits / yr</span>
          <select
            className={field}
            value={value.doctorVisits ?? ""}
            onChange={(e) => set("doctorVisits", (e.target.value || undefined) as DoctorVisitFrequency | undefined)}
          >
            <option value="">Not sure</option>
            <option value="low">Low (0–3)</option>
            <option value="medium">Medium (4–8)</option>
            <option value="high">High (9+)</option>
          </select>
        </label>
        <label className="col-span-2 block md:col-span-1">
          <span className="mb-1 block text-[11px] font-medium text-muted">Emergency fund</span>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">$</span>
            <input
              className={cn(field, "money pl-6")}
              inputMode="numeric"
              placeholder="10,000"
              value={value.emergencyFund != null ? value.emergencyFund.toLocaleString("en-US") : ""}
              onChange={(e) => set("emergencyFund", num(e.target.value))}
            />
          </div>
        </label>
      </div>
    </fieldset>
  );
}
