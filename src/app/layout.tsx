import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "CoverLens — AI Insurance Policy Auditor",
  description:
    "Upload your auto, health and home insurance PDFs and get an instant AI audit: hidden overpayments, duplicate coverage, a claim stress test and a negotiation script. No sign-up.",
  openGraph: {
    title: "CoverLens — Stop silently overpaying for insurance",
    description: "Instant AI audit of your insurance policies. No sign-up.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#F8FAFC" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
