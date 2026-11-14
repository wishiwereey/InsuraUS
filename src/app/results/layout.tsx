import type { Metadata } from "next";
import { ResultsShell } from "@/components/results/ResultsShell";

export const metadata: Metadata = { title: "Your report" };

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <ResultsShell>{children}</ResultsShell>;
}
