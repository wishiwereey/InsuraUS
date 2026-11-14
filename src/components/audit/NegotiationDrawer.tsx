"use client";

import { Check, Copy, Mail, MessageSquareQuote, Phone } from "lucide-react";
import { useState } from "react";
import type { NegotiationScript } from "@/types/insurance";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export function NegotiationDrawer({ script, savings }: { script: NegotiationScript; savings: number }) {
  const { copied, copy } = useCopy();
  const fullEmail = `Subject: ${script.emailSubject}\n\n${script.emailBody}`;
  const phoneText = script.phoneTalkingPoints.map((p, i) => `${i + 1}. ${p}`).join("\n");
  const mailto = `mailto:?subject=${encodeURIComponent(script.emailSubject)}&body=${encodeURIComponent(script.emailBody)}`;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="savings" size="lg" className="w-full sm:w-auto">
          <MessageSquareQuote /> Get my negotiation script
        </Button>
      </SheetTrigger>
      <SheetContent title="Negotiation script" description={`Send to ${script.recipient}`}>
        <div className="p-6">
          <div className="mb-5 rounded-lg border border-savings/30 bg-savings-soft p-4 text-sm text-savings-strong">
            Carriers keep retention budgets for customers who ask. This script targets{" "}
            <span className="money font-semibold">${Math.round(savings).toLocaleString("en-US")}/yr</span> using the exact
            coverages in your documents.
          </div>
          <Tabs defaultValue="email">
            <TabsList className="w-full">
              <TabsTrigger value="email" className="flex-1">
                <Mail className="size-4" /> Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex-1">
                <Phone className="size-4" /> Phone call
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-4">
              <div className="rounded-lg border border-line">
                <div className="border-b border-line bg-canvas px-4 py-2.5 text-sm">
                  <span className="text-muted">Subject: </span>
                  <span className="font-medium text-ink">{script.emailSubject}</span>
                </div>
                <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap px-4 py-3 font-sans text-sm leading-relaxed text-ink-soft">
                  {script.emailBody}
                </pre>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => copy("email", fullEmail)}>
                  {copied === "email" ? <Check /> : <Copy />} {copied === "email" ? "Copied!" : "Copy email"}
                </Button>
                <Button variant="outline" asChild>
                  <a href={mailto}>
                    <Mail /> Open in mail app
                  </a>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="mt-4">
              <ol className="space-y-2.5">
                {script.phoneTalkingPoints.map((p, i) => (
                  <li key={i} className="flex gap-3 rounded-lg border border-line p-3 text-sm text-ink-soft">
                    <span className="money flex size-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-white">
                      {i + 1}
                    </span>
                    {p}
                  </li>
                ))}
              </ol>
              <Button className="mt-4" onClick={() => copy("phone", phoneText)}>
                {copied === "phone" ? <Check /> : <Copy />} {copied === "phone" ? "Copied!" : "Copy talking points"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
