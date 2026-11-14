import type { Metadata } from "next";
import Link from "next/link";
import { TERMS, TERMS_UPDATED } from "@/lib/product-info";

export const metadata: Metadata = { title: "Terms & subscription policy" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">Terms of use</p>
      <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Terms & subscription policy</h1>
      <p className="mt-3 text-lg text-muted">Plain-English rules for using InsuraUS. Last updated {TERMS_UPDATED}.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav aria-label="On this page" className="h-fit lg:sticky lg:top-24">
          <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            {TERMS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="block rounded-lg px-3 py-2 text-base font-semibold text-ink-soft transition hover:bg-surface hover:text-ink"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          {TERMS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className={`scroll-mt-24 rounded-3xl border bg-surface p-6 shadow-card sm:p-8 ${
                s.id === "cancel" ? "border-savings/40" : "border-line"
              }`}
            >
              <h2 className="text-2xl font-extrabold text-ink">{s.title}</h2>
              <ul className="mt-4 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3 text-base leading-relaxed text-ink-soft">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-savings" />
                    {p}
                  </li>
                ))}
              </ul>
              {s.id === "cancel" && (
                <Link
                  href="/account"
                  className="mt-5 inline-flex rounded-xl bg-ink px-5 py-3 text-base font-bold text-white transition hover:bg-ink-soft"
                >
                  Go to Account
                </Link>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
