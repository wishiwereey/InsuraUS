import { cn } from "@/lib/utils";

/** Mark: a document with a scan line through it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("relative flex size-9 items-center justify-center rounded-xl bg-night shadow-glow", className)}>
      <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
        <path d="M7 3h7l4 4v14H7z" stroke="#e2e8f0" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M14 3v4h4" stroke="#e2e8f0" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M4 13h16" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark />
      <span className={cn("text-lg font-extrabold tracking-tight", dark ? "text-white" : "text-ink")}>
        Policy<span className="text-savings">X-Ray</span>
      </span>
    </span>
  );
}
