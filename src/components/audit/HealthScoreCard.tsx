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

export function HealthScoreCard({ score }: { score: number }) {
  const tone = scoreTone(score);
  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center justify-between gap-2">
        <Eyebrow>Health score</Eyebrow>
        <span className={cn("flex items-center gap-1 text-sm font-bold", tone.text)}>
          <tone.Icon className="size-4" /> {tone.label}
        </span>
      </div>
      <div className="flex flex-1 items-end justify-center pt-3">
        <Gauge score={score} />
      </div>
    </Card>
  );
}

/** The four sub-scores behind the headline number. */
export function ScoreFactorsCard({ factors }: { factors: ScoreFactor[] }) {
  if (!factors.length) return null;
  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-2xl font-extrabold text-ink">What drives your score</h2>
      <ul className="mt-6 space-y-5">
        {factors.map((f) => (
          <li key={f.label}>
            <div className="flex items-center justify-between text-base">
              <span className="font-bold text-ink">{f.label}</span>
              <span className={cn("money font-extrabold", scoreTone(f.score).text)}>{f.score}</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: scoreTone(f.score).color }} />
            </div>
            {f.note && <p className="mt-1.5 text-sm text-muted">{f.note}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}
