import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Link from "next/link";
import { AuditProvider } from "@/components/providers/AuditProvider";
import { BillingProvider } from "@/components/providers/BillingProvider";
import { Logo } from "@/components/site/Logo";
import { SiteHeader } from "@/components/site/SiteHeader";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: "InsuraUS — AI Insurance Audit", template: "%s · InsuraUS" },
  description:
    "See through your insurance. Upload auto, health and home policy PDFs and get an instant AI audit: hidden overpayments, duplicate coverage, a claim stress test and a negotiation script.",
  openGraph: {
    title: "InsuraUS — See through your insurance",
    description: "Instant AI audit of your auto, health and home insurance policies.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#070D1A" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="flex min-h-dvh flex-col">
        <BillingProvider>
        <AuditProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-line bg-surface">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-md">
                <Logo />
                <p className="mt-3 text-sm text-muted">
                  An independent, educational insurance auditor. Not a broker, no commissions. Savings are estimates — confirm
                  changes with your carrier in writing.
                </p>
              </div>
              <nav className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm font-medium text-ink-soft" aria-label="Footer">
                <Link href="/audit" className="hover:text-ink">Start an audit</Link>
                <Link href="/samples" className="hover:text-ink">Sample policies</Link>
                <Link href="/results" className="hover:text-ink">My results</Link>
                <Link href="/pricing" className="hover:text-ink">Pricing</Link>
                <Link href="/account" className="hover:text-ink">Account</Link>
                <Link href="/terms" className="hover:text-ink">Terms & cancellation</Link>
                <Link href="/#how-it-works" className="hover:text-ink">How it works</Link>
              </nav>
            </div>
          </footer>
        </AuditProvider>
        </BillingProvider>
      </body>
    </html>
  );
}
