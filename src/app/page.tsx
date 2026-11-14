import {
  ArrowRight,
  BadgeDollarSign,
  CarFront,
  CopyX,
  FileSearch,
  HeartPulse,
  MessageSquareQuote,
  ShieldCheck,
  Siren,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { DemoPresets } from "@/components/landing/DemoPresets";
import { HeroXray } from "@/components/landing/HeroXray";

const LEAKS = [
  {
    Icon: CarFront,
    title: "Tiny deductibles on old cars",
    body: "A $250 collision deductible on a car worth $7,000 can cost $300–$600 a year for almost no real protection.",
    range: "$300–600/yr",
  },
  {
    Icon: CopyX,
    title: "Coverage you bought twice",
    body: "Roadside help on two policies, identity-theft add-ons on both auto and home, rental cover you'll never use.",
    range: "$50–200/yr",
  },
  {
    Icon: HeartPulse,
    title: "The wrong health plan",
    body: "Paying for a rich PPO when your family sees a doctor twice a year — while a cheaper HSA plan sits unused.",
    range: "$800–2,000/yr",
  },
  {
    Icon: BadgeDollarSign,
    title: "Discounts nobody applied",
    body: "Bundling, alarm credits, low-mileage and defensive-driving discounts your carrier won't volunteer.",
    range: "$150–500/yr",
  },
];

const STEPS = [
  {
    Icon: Upload,
    title: "Upload your policies",
    body: "Drop in the declarations pages for your auto, home or renters policy and your health plan summary.",
  },
  {
    Icon: FileSearch,
    title: "We read the fine print",
    body: "Gemini reads every limit, deductible and add-on, translates the jargon and checks it against your state.",
  },
  {
    Icon: Siren,
    title: "We test real emergencies",
    body: "Every cut is stress-tested against realistic claims, so a cheaper plan never leaves you exposed.",
  },
  {
    Icon: MessageSquareQuote,
    title: "You make one call",
    body: "Get a personalized email and phone script that quotes your exact policy numbers.",
  },
];

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-night text-white">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
        <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-savings/15 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24 lg:pb-32">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-scan/30 bg-scan/10 px-4 py-1.5 text-sm font-semibold text-scan">
              <ShieldCheck className="size-4" /> Independent AI audit · no commissions
            </span>
            <h1 className="mt-6 text-5xl leading-[1.05] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Stop silently overpaying for <span className="text-gradient">insurance</span> you don&apos;t understand.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              InsuraUS reads your auto, health and home policies line by line, finds the money you&apos;re wasting, and
              hands you the script to get it back.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-scan px-7 text-lg font-bold text-night transition hover:bg-white"
              >
                Audit my policies <ArrowRight className="size-5" />
              </Link>
              <a
                href="#demo"
                className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-white/20 px-7 text-lg font-semibold text-white transition hover:bg-white/10"
              >
                Try a sample household
              </a>
            </div>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-8">
              {[
                ["$400–1k", "monthly insurance bill for a typical US family"],
                ["~30 sec", "to audit up to 6 policy PDFs"],
                ["0 files", "stored — PDFs stay in memory"],
              ].map(([n, l]) => (
                <div key={n}>
                  <dt className="money text-2xl font-extrabold text-white">{n}</dt>
                  <dd className="mt-1 text-sm leading-snug text-slate-400">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroXray />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="scroll-mt-16 border-y border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">How it works</p>
            <h2 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">From PDF to savings in four steps</h2>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ Icon, title, body }, i) => (
              <li key={title} className="relative">
                <span className="money text-6xl font-extrabold text-line">0{i + 1}</span>
                <span className="mt-3 flex size-12 items-center justify-center rounded-xl bg-night text-scan">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 text-xl font-bold text-ink">{title}</h3>
                <p className="mt-2 text-base text-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* LEAKS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">What we find</p>
          <h2 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Four leaks hiding in almost every policy</h2>
          <p className="mt-4 text-lg text-muted">
            Brokers earn commission on what you buy, so nobody has a reason to point these out. We do.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LEAKS.map(({ Icon, title, body, range }) => (
            <div key={title} className="group flex flex-col rounded-2xl border border-line bg-surface p-7 shadow-card transition hover:-translate-y-1 hover:shadow-lift">
              <span className="flex size-12 items-center justify-center rounded-xl bg-risk-soft text-risk-strong transition group-hover:bg-risk group-hover:text-white">
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 text-xl font-bold text-ink">{title}</h3>
              <p className="mt-2 flex-1 text-base text-muted">{body}</p>
              <p className="money mt-5 text-lg font-extrabold text-savings-strong">{range}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="relative scroll-mt-16 overflow-hidden bg-night">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-widest text-scan uppercase">Live demo</p>
            <h2 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl">No policy handy? Audit a real-looking household.</h2>
            <p className="mt-4 text-lg text-slate-300">
              Each one generates real multi-page declarations PDFs and runs them through the same AI pipeline as your own
              upload — nothing is pre-computed.
            </p>
          </div>
          <div className="mt-12">
            <DemoPresets variant="dark" />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
        <h2 className="mx-auto max-w-3xl text-4xl font-extrabold text-ink sm:text-5xl">
          Find out what you could <span className="text-savings-strong">keep every year</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted">Upload your declarations pages and get a line-by-line audit in about a minute.</p>
        <Link
          href="/audit"
          className="mt-9 inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-ink px-8 text-lg font-bold text-white transition hover:bg-ink-soft"
        >
          Start my audit <ArrowRight className="size-5" />
        </Link>
      </section>
    </>
  );
}
