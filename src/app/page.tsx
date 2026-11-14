import { Aperture } from "lucide-react";
import { CoverLensApp } from "@/components/CoverLensApp";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Subtle top glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(16,185,129,0.10),transparent_70%)]"
      />
      <header className="sticky top-0 z-30 border-b border-line/70 bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="/" className="flex items-center gap-2 font-semibold tracking-tight text-ink">
            <span className="flex size-7 items-center justify-center rounded-lg bg-ink text-white">
              <Aperture className="size-4" />
            </span>
            CoverLens
          </a>
          <span className="hidden text-xs text-muted sm:block">AI insurance policy auditor for US households</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <CoverLensApp />
      </main>
    </div>
  );
}
