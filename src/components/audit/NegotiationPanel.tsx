"use client";

import { Check, CheckCircle2, Copy, Mail, Phone } from "lucide-react";
import { useState } from "react";
import type { NegotiationScript } from "@/types/insurance";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatUSD } from "@/lib/utils";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for insecure contexts / older browsers.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };
  return { copied, copy };
}

const CHECKLIST = [
  "Have your policy number and renewal date in front of you",
  "Ask for the Customer Retention or Loyalty department",
  "Request every change and discount in one call",
  "Ask for a revised declarations page by email before you hang up",
  "If they say no, ask when your policy is next eligible for re-rating",
];

export function NegotiationPanel({ script, savings }: { script: NegotiationScript; savings: number }) {
  const { copied, copy } = useCopy();
  const [done, setDone] = useState<Set<number>>(new Set());
  const fullEmail = `Subject: ${script.emailSubject}\n\n${script.emailBody}`;
  const phoneText = script.phoneTalkingPoints.map((p, i) => `${i + 1}. ${p}`).join("\n");
  const mailto = `mailto:?subject=${encodeURIComponent(script.emailSubject)}&body=${encodeURIComponent(script.emailBody)}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-base text-muted">
            Send to <span className="font-bold text-ink">{script.recipient}</span>
          </p>
          <span className="money rounded-full bg-savings-soft px-4 py-1.5 text-base font-bold text-savings-strong">
            Targets {formatUSD(savings)}/yr
          </span>
        </div>
        <Tabs defaultValue="email">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="email" className="flex-1 px-5 py-2.5 text-base">
              <Mail className="size-5" /> Email
            </TabsTrigger>
            <TabsTrigger value="phone" className="flex-1 px-5 py-2.5 text-base">
              <Phone className="size-5" /> Phone call
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="mt-6">
            <div className="overflow-hidden rounded-2xl border border-line">
              <div className="border-b border-line bg-canvas px-5 py-3.5 text-base">
                <span className="text-muted">Subject: </span>
                <span className="font-semibold text-ink">{script.emailSubject}</span>
              </div>
              <pre className="whitespace-pre-wrap px-5 py-5 font-sans text-base leading-relaxed text-ink-soft">{script.emailBody}</pre>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => copy("email", fullEmail)}>
                {copied === "email" ? <Check /> : <Copy />} {copied === "email" ? "Copied!" : "Copy email"}
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={mailto}>
                  <Mail /> Open in mail app
                </a>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="phone" className="mt-6">
            <ol className="space-y-3">
              {script.phoneTalkingPoints.map((p, i) => (
                <li key={i} className="flex gap-4 rounded-2xl border border-line p-4 text-base text-ink-soft">
                  <span className="money flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
            <Button size="lg" className="mt-5" onClick={() => copy("phone", phoneText)}>
              {copied === "phone" ? <Check /> : <Copy />} {copied === "phone" ? "Copied!" : "Copy talking points"}
            </Button>
          </TabsContent>
        </Tabs>
      </div>

      <aside className="h-fit rounded-3xl bg-night p-6 text-white sm:p-7">
        <h2 className="text-xl font-extrabold">Before you call</h2>
        <p className="mt-1 text-base text-slate-400">Tick them off as you go</p>
        <ul className="mt-5 space-y-2">
          {CHECKLIST.map((item, i) => {
            const checked = done.has(i);
            return (
              <li key={item}>
                <button
                  onClick={() =>
                    setDone((d) => {
                      const next = new Set(d);
                      if (next.has(i)) next.delete(i);
                      else next.add(i);
                      return next;
                    })
                  }
                  aria-pressed={checked}
                  className="flex w-full items-start gap-3 rounded-xl p-2.5 text-left text-base transition hover:bg-white/5"
                >
                  <CheckCircle2 className={`mt-0.5 size-5 shrink-0 ${checked ? "text-scan" : "text-slate-600"}`} />
                  <span className={checked ? "text-slate-500 line-through" : "text-slate-200"}>{item}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
