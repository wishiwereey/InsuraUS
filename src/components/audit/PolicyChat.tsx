"use client";

import { ArrowUp, Bot, Loader2, Sparkles } from "lucide-react";
import { Fragment, useEffect, useRef, useState } from "react";
import type { AuditResult, ChatMessage, UserContext } from "@/types/insurance";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useBilling } from "@/components/providers/BillingProvider";

/** Minimal, safe markdown: **bold**, bullet lists and paragraphs. No HTML injection. */
function RichText({ text }: { text: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="money font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <Fragment key={i}>{part.replace(/(^|\s)_([^_]+)_/g, "$1$2")}</Fragment>
      ),
    );
  return (
    <div className="space-y-2">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
          return (
            <ul key={bi} className="list-disc space-y-1 pl-5 marker:text-subtle">
              {lines.map((l, li) => (
                <li key={li}>{inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""))}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function suggestions(audit: AuditResult): string[] {
  const types = new Set(audit.policies.map((p) => p.type));
  const out: string[] = [];
  if (types.has("auto")) out.push("Does my policy cover rental cars?", "What happens if I raise my deductible to $1,500?");
  if (types.has("health")) out.push("Should I switch to the HSA plan at open enrollment?");
  if (types.has("home")) out.push("Am I covered if my water heater floods the kitchen?");
  if (types.has("renters")) out.push("Is my laptop covered if it's stolen from my car?");
  out.push("What's the single change that saves me the most?");
  return out.slice(0, 4);
}

interface PolicyChatProps {
  files: File[];
  context: UserContext;
  audit: AuditResult;
  /** Demo (sample) documents are never metered. */
  demo?: boolean;
}

export function PolicyChat({ files, context, audit, demo = false }: PolicyChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [limited, setLimited] = useState(false);
  const billing = useBilling();
  const metered = !demo && !billing.isPro;
  const left = billing.status?.trialChatsLeft ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;
    const history: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("messages", JSON.stringify(history));
    form.append("context", JSON.stringify(context));
    form.append("audit", JSON.stringify(audit));

    const write = (content: string) =>
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", content }]);

    try {
      const res = await fetch("/api/chat", { method: "POST", body: form });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Something went wrong." }));
        if (res.status === 402) setLimited(true);
        write(`⚠️ ${err.error ?? "Something went wrong."}`);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        write(acc);
      }
      if (!acc.trim()) write("I couldn't generate an answer — please try rephrasing.");
    } catch {
      write("⚠️ Network error — please try again.");
    } finally {
      setBusy(false);
      if (metered) void billing.refresh();
    }
  }

  return (
    <Card className="flex h-[560px] flex-col overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-ink text-white">
          <Sparkles className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Policy Copilot</p>
          <p className="text-xs text-muted">Answers grounded in your {files.length} uploaded {files.length === 1 ? "document" : "documents"}</p>
          {metered && left !== null && (
            <p className="mt-0.5 text-xs font-semibold text-info">
              {left} free {left === 1 ? "question" : "questions"} left ·{" "}
              <Link href="/pricing" className="underline-offset-2 hover:underline">
                Pro is unlimited
              </Link>
            </p>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <Bot className="size-8 text-subtle" />
            <p className="mt-2 text-sm font-medium text-ink">Ask anything about your policies</p>
            <p className="mt-1 max-w-xs text-xs text-muted">
              Coverage questions, “what if” math, or what a clause actually means.
            </p>
            <div className="mt-4 flex max-w-md flex-wrap justify-center gap-2">
              {suggestions(audit).map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft shadow-card transition hover:border-ink/25 hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[88%] min-w-0 rounded-2xl px-4 py-2.5 text-base leading-relaxed break-words",
                m.role === "user" ? "rounded-br-md bg-ink text-white" : "rounded-bl-md border border-line bg-canvas text-ink-soft",
              )}
            >
              {m.role === "assistant" && !m.content ? (
                <span className="flex items-center gap-2 text-muted">
                  <Loader2 className="size-3.5 animate-spin" /> Reading your policy…
                </span>
              ) : m.role === "assistant" ? (
                <RichText text={m.content} />
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}
      </div>

      {limited && metered && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-info-soft px-5 py-3 text-base text-ink">
          <span>You&apos;ve used your free Copilot questions.</span>
          <Link href="/checkout" className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white hover:bg-ink-soft">
            Upgrade · $12/mo
          </Link>
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-line p-3"
      >
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-1.5 focus-within:border-ink/30 focus-within:ring-2 focus-within:ring-ink/5">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Does my policy cover rental cars?"
            maxLength={2000}
            className="h-9 flex-1 bg-transparent text-sm text-ink placeholder:text-subtle focus:outline-none"
            aria-label="Ask a question about your policies"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="flex size-8 items-center justify-center rounded-lg bg-ink text-white transition hover:bg-ink-soft disabled:opacity-30"
            aria-label="Send"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
          </button>
        </div>
      </form>
    </Card>
  );
}
