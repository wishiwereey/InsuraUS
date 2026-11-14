import { AlertTriangle, Copy, HeartPulse } from "lucide-react";

/**
 * Decorative hero illustration: a declarations page being "X-rayed", with the
 * kinds of findings the audit surfaces. Labeled as an example — real results
 * always come from the user's own documents.
 */
export function HeroXray() {
  return (
    <div className="relative mx-auto w-full max-w-[460px]" aria-hidden>
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(52,211,153,0.22),transparent)] blur-2xl" />

      {/* Document */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#121c33] to-[#0b1324] p-6 pb-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-2.5 w-28 rounded bg-slate-500/50" />
            <div className="mt-2 h-2 w-40 rounded bg-slate-600/40" />
          </div>
          <span className="rounded-md border border-slate-600/60 px-2 py-1 text-[0.8rem] font-bold tracking-wider text-slate-300">
            AUTO DECLARATIONS
          </span>
        </div>

        <div className="mt-6 space-y-2.5">
          {[
            ["Bodily Injury Liability", "$100k / $300k"],
            ["Collision deductible", "$250"],
            ["Comprehensive deductible", "$250"],
            ["Towing & Labor", "$100"],
            ["Premier Roadside Plus", "$72/yr"],
            ["Rental Reimbursement", "$40/day"],
          ].map(([k, v], i) => (
            <div
              key={k}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-[0.9rem] ${
                i === 1 || i === 4 ? "bg-risk/15 ring-1 ring-risk/40" : "bg-white/[0.03]"
              }`}
            >
              <span className="text-slate-300">{k}</span>
              <span className="money font-semibold text-white">{v}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-white/10 pt-4">
          <span className="text-sm text-slate-400">Total annual premium</span>
          <span className="money text-2xl font-bold text-white">$2,760</span>
        </div>

        {/* Scan line */}
        <div className="pointer-events-none absolute inset-x-0 h-16 animate-scan bg-gradient-to-b from-transparent via-scan/25 to-transparent">
          <div className="absolute inset-x-0 top-1/2 h-px bg-scan shadow-[0_0_18px_4px_rgba(52,211,153,0.6)]" />
        </div>
      </div>

      {/* Findings — stacked under the document like notifications */}
      <div className="relative z-10 -mt-6 space-y-2.5 px-4 sm:px-8">
        {[
          { Icon: AlertTriangle, tone: "text-risk-strong", t: "$250 deductible, 12-yr-old car", s: "Save ~$380/yr", d: "0s" },
          { Icon: Copy, tone: "text-warn-strong", t: "Duplicate roadside cover", s: "Save $72/yr", d: "1.5s" },
          { Icon: HeartPulse, tone: "text-info", t: "PPO used twice a year", s: "Save ~$980/yr", d: "3s" },
        ].map(({ Icon, tone, t, s, d }, i) => (
          <div
            key={t}
            className="flex animate-float items-center justify-between gap-4 rounded-xl border border-white/10 bg-white px-4 py-3 shadow-lift"
            style={{ animationDelay: d, marginLeft: `${i * 14}px`, marginRight: `${(2 - i) * 14}px` }}
          >
            <span className={`flex items-center gap-2 text-[0.95rem] font-bold ${tone}`}>
              <Icon className="size-4 shrink-0" /> {t}
            </span>
            <span className="money shrink-0 text-[0.95rem] font-bold text-savings-strong">{s}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-sm text-slate-500">Illustration · real findings come from your own PDFs</p>
    </div>
  );
}
