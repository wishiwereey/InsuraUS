import { NextResponse } from "next/server";
import type { Content } from "@google/genai";
import { describeGeminiError, geminiErrorDetail, getGemini, withModelFallback } from "@/lib/gemini/client";
import { CHAT_SYSTEM_PROMPT, auditDigest, formatUserContext } from "@/lib/gemini/prompts";
import { RequestValidationError, parseUserContext, readPdfUploads } from "@/lib/request";
import type { ApiError, AuditResult, ChatMessage } from "@/types/insurance";
import { FREE_TRIAL, PAYWALL_COPY } from "@/lib/billing/plans";
import { sampleHashes } from "@/lib/billing/samples";
import { readBilling, trialCookie } from "@/lib/billing/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_TURNS = 20;
const MAX_MESSAGE_CHARS = 2000;

const fail = (status: number, error: string, code?: ApiError["code"]) =>
  NextResponse.json<ApiError>({ error, code }, { status });

function parseMessages(raw: FormDataEntryValue | null): ChatMessage[] {
  if (typeof raw !== "string") return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((m): m is ChatMessage => (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_TURNS)
      .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));
  } catch {
    return [];
  }
}

function parseAudit(raw: FormDataEntryValue | null): AuditResult | undefined {
  if (typeof raw !== "string") return undefined;
  try {
    return JSON.parse(raw) as AuditResult;
  } catch {
    return undefined;
  }
}

/**
 * Streams a plain-text answer grounded in the user's PDFs + their audit.
 * The client re-sends the PDFs each turn so the server stays stateless (no
 * accounts, no storage — the policy documents never persist).
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Expected multipart/form-data.", "BAD_REQUEST");
  }

  const messages = parseMessages(form.get("messages"));
  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return fail(400, "The last message must be a user question.", "BAD_REQUEST");
  }

  let pdfs;
  try {
    pdfs = await readPdfUploads(form);
  } catch (err) {
    if (err instanceof RequestValidationError) return fail(err.code === "FILE_TOO_LARGE" ? 413 : 400, err.message, err.code);
    throw err;
  }
  const context = parseUserContext(form.get("context"));

  // Billing gate: free Copilot questions on the user's own documents are limited; demo docs are unlimited.
  const billing = readBilling(req);
  const samples = await sampleHashes();
  const metered = !billing.pro && pdfs.some((p) => !samples.has(p.sha256));
  if (metered && billing.trial.chats >= FREE_TRIAL.chatQuestions) {
    return NextResponse.json<ApiError>(
      { error: PAYWALL_COPY.chat_limit, code: "PAYWALL", reason: "chat_limit" },
      { status: 402 },
    );
  }
  const audit = parseAudit(form.get("audit"));

  let ai;
  try {
    ai = getGemini();
  } catch (err) {
    return fail(500, describeGeminiError(err).message, "MISSING_API_KEY");
  }

  // The documents + audit go in a grounding turn, followed by the real conversation.
  const contents: Content[] = [
    {
      role: "user",
      parts: [
        ...pdfs.flatMap((pdf) => [
          { text: `Policy document: "${pdf.name}"` },
          { inlineData: { mimeType: "application/pdf", data: pdf.base64 } },
        ]),
        { text: `${formatUserContext(context)}\n\n${auditDigest(audit)}` },
      ],
    },
    { role: "model", parts: [{ text: "I've reviewed your documents and audit. What would you like to know?" }] },
    ...messages.map<Content>((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
  ];

  let stream: AsyncGenerator<{ text?: string }>;
  try {
    const start = (model: string) =>
      ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: CHAT_SYSTEM_PROMPT,
          temperature: 0.3,
          thinkingConfig: { thinkingBudget: 1024 },
        },
      });
    // Overloaded → retry; rate-limited or unavailable → next model (see withModelFallback).
    stream = (await withModelFallback(start)).result;
  } catch (err) {
    console.error("[chat] Gemini error:", geminiErrorDetail(err));
    const { status, message } = describeGeminiError(err);
    return fail(status, message, "UPSTREAM_ERROR");
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
      } catch (err) {
        console.error("[chat] stream error:", err);
        controller.enqueue(encoder.encode("\n\n_(The answer was interrupted. Please try again.)_"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      ...(metered ? { "Set-Cookie": trialCookie({ ...billing.trial, chats: billing.trial.chats + 1 }) } : {}),
    },
  });
}
