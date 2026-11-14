"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAudit } from "@/components/providers/AuditProvider";
import { useBilling } from "@/components/providers/BillingProvider";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

export function SiteHeader() {
  const pathname = usePathname();
  const { result } = useAudit();
  const billing = useBilling();
  const [open, setOpen] = useState(false);
  const dark = pathname === "/";

  useEffect(() => setOpen(false), [pathname]);

  const links = [
    { href: "/", label: "Overview" },
    { href: "/audit", label: "Start audit" },
    ...(result ? [{ href: "/results", label: "My results" }] : []),
    { href: "/samples", label: "Samples" },
    { href: "/pricing", label: "Pricing" },
    { href: "/account", label: "Account" },
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-xl",
        dark ? "border-night-line bg-night/80" : "border-line bg-canvas/85",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link href="/" aria-label="InsuraUS home">
          <Logo dark={dark} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.filter((l) => l.href !== "/" && l.href !== "/account").map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-semibold whitespace-nowrap transition",
                dark
                  ? isActive(l.href)
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                  : isActive(l.href)
                    ? "bg-ink/[0.06] text-ink"
                    : "text-muted hover:bg-ink/[0.04] hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {billing.status && (
            <Link
              href={billing.isPro ? "/account" : "/pricing"}
              className={cn(
                "hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap lg:inline-flex",
                billing.isPro
                  ? "bg-scan/15 text-savings-strong"
                  : dark
                    ? "bg-white/10 text-slate-200"
                    : "bg-info-soft text-info",
                billing.isPro && dark && "text-scan",
              )}
            >
              {billing.isPro ? (
                <>
                  <Crown className="size-4" /> Pro
                </>
              ) : (
                `Free · ${billing.status.trialAuditsLeft} audit left`
              )}
            </Link>
          )}
          <Link
            href={result ? "/results" : "/audit"}
            className={cn(
              "hidden items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap transition sm:inline-flex",
              dark ? "bg-scan text-night hover:bg-white" : "bg-ink text-white hover:bg-ink-soft",
            )}
          >
            {result ? "View my audit" : "Audit my policies"} <ArrowRight className="size-4" />
          </Link>
          <button
            className={cn("rounded-lg p-2 lg:hidden", dark ? "text-white" : "text-ink")}
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className={cn("border-t px-4 py-3 lg:hidden", dark ? "border-night-line bg-night" : "border-line bg-surface")}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "block rounded-lg px-3 py-3 text-base font-semibold",
                dark ? "text-slate-200" : "text-ink",
                isActive(l.href) && (dark ? "bg-white/10" : "bg-canvas"),
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
