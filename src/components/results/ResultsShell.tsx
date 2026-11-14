"use client";

import { ArrowRight, Bot, FileStack, LayoutDashboard, Loader2, Mail, RotateCcw, Siren } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAudit } from "@/components/providers/AuditProvider";
import { DemoPresets } from "@/components/landing/DemoPresets";
import { scoreTone } from "@/components/audit/HealthScoreCard";
import { cn, formatUSD } from "@/lib/utils";

export function ResultsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { result, hydrated, reset, status } = useAudit();

  if (!hydrated || status === "analyzing") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-3 text-lg text-muted">
        <Loader2 className="size-5 animate-spin" /> Loading your report…
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6">
        <FileStack className="mx-auto size-12 text-subtle" />
        <h1 className="mt-5 text-4xl font-extrabold text-ink">No report yet</h1>
        <p className="mx-auto mt-3 max-w-lg text-lg text-muted">
          Upload your policies or run a sample household to generate your Policy X-Ray report.
        </p>
        <Link
          href="/audit"
          className="mt-8 inline-flex h-13 items-center gap-2 rounded-xl bg-ink px-7 py-3.5 text-lg font-bold text-white hover:bg-ink-soft"
        >
          Start an audit <ArrowRight className="size-5" />
        </Link>
        <div className="mt-16 text-left">
          <DemoPresets />
        </div>
      </div>
    );
  }

  const { audit, meta } = result;
  const savings = Math.max(0, audit.totalPotentialAnnualSavings);
  const findings = audit.policies.reduce((n, p) => n + p.issues.length, 0);
  const tone = scoreTone(audit.insuranceHealthScore);

  const tabs = [
    { href: "/results", label: "Overview", Icon: LayoutDashboard },
    { href: "/results/policies", label: "Policies", Icon: FileStack, count: findings },
    { href: "/results/stress-test", label: "Stress test", Icon: Siren },
    { href: "/results/negotiate", label: "Negotiate", Icon: Mail },
    { href: "/results/copilot", label: "Ask Copilot", Icon: Bot },
  ];

  return (
    <div>
      {/* Report header */}
      <section className="relative overflow-hidden bg-night text-white">
        <div className="absolute inset-0 bg-grid opacity-70" />
        <div className="absolute -right-40 -top-40 size-[520px] rounded-full bg-savings/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 pb-8 sm:px-6 sm:pt-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-bold tracking-widest text-scan uppercase">
                Your X-Ray report · {audit.policies.length} policies · {findings} findings
              </p>
              <p className="mt-4 text-xl leading-snug font-semibold text-white sm:text-2xl">{audit.summaryVerdict}</p>
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3 lg:w-[520px]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">Health score</p>
                <p className="money mt-1 text-3xl font-extrabold" style={{ color: tone.color }}>
                  {audit.insuranceHealthScore}
                  <span className="text-lg text-slate-500">/100</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm text-slate-400">You pay</p>
                <p className="money mt-1 text-3xl font-extrabold text-white">{formatUSD(audit.totalCurrentAnnualSpend)}</p>
              </div>
              <div className="col-span-2 rounded-2xl border border-scan/40 bg-scan/10 p-4 sm:col-span-1">
                <p className="text-sm text-scan">You could save</p>
                <p className="money mt-1 text-3xl font-extrabold text-scan">{formatUSD(savings)}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
            <span className="truncate">Analyzed: {meta.fileNames.join(" · ")}</span>
            <button onClick={reset} className="inline-flex items-center gap-1.5 font-semibold text-slate-200 hover:text-white">
              <RotateCcw className="size-4" /> Start a new audit
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <nav className="sticky top-16 z-30 border-b border-line bg-surface/90 backdrop-blur-xl" aria-label="Report sections">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
          {tabs.map(({ href, label, Icon, count }) => {
            const active = href === "/results" ? pathname === "/results" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 px-4 py-4 text-base font-semibold transition",
                  active ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                <Icon className="size-5" />
                {label}
                {count ? (
                  <span className="money rounded-full bg-risk-soft px-2 py-0.5 text-xs font-bold text-risk-strong">{count}</span>
                ) : null}
                {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t-full bg-savings" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl animate-fade-up px-4 py-10 sm:px-6 sm:py-12">{children}</div>
    </div>
  );
}

/** Consistent page title inside a results tab. */
export function ResultsSectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 text-lg text-muted">{description}</p>}
    </div>
  );
}
