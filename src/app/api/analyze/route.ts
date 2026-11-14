import { NextResponse } from "next/server";
import { normalizeAudit } from "@/lib/audit/normalize";
import { GEMINI_MODEL, describeGeminiError, getGemini } from "@/lib/gemini/client";
import { AUDITOR_SYSTEM_PROMPT, formatUserContext } from "@/lib/gemini/prompts";
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

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            ...pdfs.flatMap((pdf, i) => [
              { text: `Document ${i + 1}: "${pdf.name}"` },
              { inlineData: { mimeType: "application/pdf", data: pdf.base64 } },
            ]),
            { text: formatUserContext(context) },
            { text: "Audit these policies now. Return only JSON that matches the schema." },
          ],
        },
      ],
      config: {
        systemInstruction: AUDITOR_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: auditResponseSchema,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 4096 },
      },
    });

    const raw = response.text;
    if (!raw) return fail(502, "Gemini returned an empty response. Please try again.", "INVALID_AI_OUTPUT");

    let parsed: Partial<AuditResult>;
    try {
      parsed = JSON.parse(raw);
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
      meta: { model: GEMINI_MODEL, fileNames: pdfs.map((p) => p.name), durationMs: Date.now() - started },
    });
  } catch (err) {
    console.error("[analyze] Gemini error:", err);
    const { status, message } = describeGeminiError(err);
    return fail(status, message, "UPSTREAM_ERROR");
  }
}
