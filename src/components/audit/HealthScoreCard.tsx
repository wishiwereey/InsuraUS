import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { ScoreFactor } from "@/types/insurance";
import { Card, Eyebrow } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function scoreTone(score: number) {
  if (score >= 75) return { color: "var(--color-savings)", text: "text-savings-strong", label: "Healthy", Icon: CheckCircle2 };
  if (score >= 50) return { color: "var(--color-warn)", text: "text-warn-strong", label: "Needs attention", Icon: AlertTriangle };
  return { color: "var(--color-risk)", text: "text-risk-strong", label: "At risk", Icon: XCircle };
}

/** Semicircle gauge. Pure SVG so it renders crisply and server-side. */
function Gauge({ score }: { score: number }) {
  const r = 70;
  const circumference = Math.PI * r;
  const offset = circumference * (1 - score / 100);
  const tone = scoreTone(score);
  return (
    <svg viewBox="0 0 180 104" className="w-full max-w-[200px]" role="img" aria-label={`Insurance Health Score ${score} out of 100`}>
      <path d="M 20 90 A 70 70 0 0 1 160 90" fill="none" stroke="var(--color-line)" strokeWidth="12" strokeLinecap="round" />
      <path
        d="M 20 90 A 70 70 0 0 1 160 90"
        fill="none"
        stroke={tone.color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)" }}
      />
      <text x="90" y="80" textAnchor="middle" className="money fill-ink" style={{ fontSize: 38, fontWeight: 700 }}>
        {score}
      </text>
      <text x="90" y="99" textAnchor="middle" className="fill-muted" style={{ fontSize: 10, fontWeight: 500 }}>
        out of 100
      </text>
    </svg>
  );
}

export function HealthScoreCard({ score, factors }: { score: number; factors: ScoreFactor[] }) {
  const tone = scoreTone(score);
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-center justify-between">
        <Eyebrow>Insurance Health Score</Eyebrow>
        <span className={cn("flex items-center gap-1 text-xs font-semibold", tone.text)}>
          <tone.Icon className="size-3.5" /> {tone.label}
        </span>
      </div>
      <div className="flex justify-center pt-2">
        <Gauge score={score} />
      </div>
      {factors.length > 0 && (
        <ul className="mt-3 space-y-2">
          {factors.map((f) => (
            <li key={f.label} title={f.note}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-soft">{f.label}</span>
                <span className="money font-semibold text-ink">{f.score}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-canvas">
                <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: scoreTone(f.score).color }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
