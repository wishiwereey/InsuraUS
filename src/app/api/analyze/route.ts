import { NextResponse } from "next/server";
import { normalizeAudit } from "@/lib/audit/normalize";
import {
  GEMINI_FALLBACK_MODEL,
  GEMINI_MODEL,
  describeGeminiError,
  geminiErrorDetail,
  getGemini,
  isApiError,
  isRequestShapeError,
} from "@/lib/gemini/client";
import { AUDITOR_SYSTEM_PROMPT, AUDIT_JSON_SHAPE, formatUserContext } from "@/lib/gemini/prompts";
import { auditResponseSchema } from "@/lib/gemini/schema";
import { RequestValidationError, parseUserContext, readPdfUploads } from "@/lib/request";
import type { AnalyzeResponse, ApiError, AuditResult } from "@/types/insurance";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Multi-document audits with reasoning typically take 15–45 s.
export const maxDuration = 120;

const fail = (status: number, error: string, code?: ApiError["code"]) =>
  NextResponse.json<ApiError>({ error, code }, { status });

export async function POST(req: Request) {
  const started = Date.now();

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "Expected multipart/form-data with PDF files.", "BAD_REQUEST");
  }

  let pdfs;
  try {
    pdfs = await readPdfUploads(form);
  } catch (err) {
    if (err instanceof RequestValidationError) return fail(err.code === "FILE_TOO_LARGE" ? 413 : 400, err.message, err.code);
    throw err;
  }
  const context = parseUserContext(form.get("context"));

  let ai;
  try {
    ai = getGemini();
  } catch (err) {
    return fail(500, describeGeminiError(err).message, "MISSING_API_KEY");
  }

  const parts = [
    ...pdfs.flatMap((pdf, i) => [
      { text: `Document ${i + 1}: "${pdf.name}"` },
      { inlineData: { mimeType: "application/pdf", data: pdf.base64 } },
    ]),
    { text: formatUserContext(context) },
    { text: "Audit these policies now. Return only JSON that matches the schema." },
  ];

  /**
   * 1st try: strict responseSchema (structured output).
   * If Gemini rejects the request shape (400 — e.g. schema too complex for the
   * model/version), retry in JSON mode with the schema described in the prompt;
   * normalizeAudit() still enforces types and recomputes all math.
   * If the model id is unavailable (404), retry on the fallback model.
   */
  const call = (model: string, strict: boolean) =>
    ai.models.generateContent({
      model,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction: strict ? AUDITOR_SYSTEM_PROMPT : `${AUDITOR_SYSTEM_PROMPT}\n\n${AUDIT_JSON_SHAPE}`,
        responseMimeType: "application/json",
        ...(strict ? { responseSchema: auditResponseSchema } : {}),
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 4096 },
      },
    });

  try {
    let model = GEMINI_MODEL;
    let response;
    try {
      response = await call(model, true);
    } catch (err) {
      if (isApiError(err) && err.status === 404) {
        console.warn(`[analyze] ${model} unavailable, falling back to ${GEMINI_FALLBACK_MODEL}`);
        model = GEMINI_FALLBACK_MODEL;
        response = await call(model, true).catch((e) => {
          if (isRequestShapeError(e)) return call(model, false);
          throw e;
        });
      } else if (isRequestShapeError(err)) {
        console.warn("[analyze] strict schema rejected, retrying in JSON mode:", geminiErrorDetail(err));
        response = await call(model, false);
      } else {
        throw err;
      }
    }

    const raw = response.text;
    if (!raw) return fail(502, "Gemini returned an empty response. Please try again.", "INVALID_AI_OUTPUT");

    let parsed: Partial<AuditResult>;
    try {
      parsed = JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    } catch {
      return fail(502, "Gemini returned malformed JSON. Please try again.", "INVALID_AI_OUTPUT");
    }

    const audit = normalizeAudit(parsed);
    if (audit.policies.length === 0) {
      return fail(
        422,
        audit.disclaimers[0] ?? "We couldn't find an insurance policy in these documents. Try a declarations page or summary of benefits.",
        "INVALID_AI_OUTPUT",
      );
    }

    return NextResponse.json<AnalyzeResponse>({
      audit,
      meta: { model, fileNames: pdfs.map((p) => p.name), durationMs: Date.now() - started },
    });
  } catch (err) {
    console.error("[analyze] Gemini error:", geminiErrorDetail(err));
    const { status, message } = describeGeminiError(err);
    return fail(status, message, "UPSTREAM_ERROR");
  }
}
