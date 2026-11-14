import type { Metadata } from "next";
import { SampleLibrary } from "./SampleLibrary";

export const metadata: Metadata = { title: "Sample policies" };

export default function SamplesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-bold tracking-widest text-savings-strong uppercase">Sample library</p>
        <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">Realistic US policy documents</h1>
        <p className="mt-4 text-lg text-muted">
          Six multi-page declarations pages and benefit summaries for two fictional households, generated on the fly. Preview
          them, download them and drag them into the uploader, or audit a whole household in one click.
        </p>
      </div>
      <SampleLibrary />
    </div>
  );
}
