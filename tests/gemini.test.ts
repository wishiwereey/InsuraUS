/**
 * The Gemini call itself, with the SDK replaced by a fake client so the tests
 * are deterministic and need no API key. Covers the success path, the
 * structured-output fallbacks and the user-facing error messages.
 */
import { ApiError } from "@google/genai";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookiesFrom, form, ownFile, post, sampleFile } from "./helpers";

const generateContent = vi.fn();
const generateContentStream = vi.fn();

vi.mock("@/lib/gemini/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/gemini/client")>();
  return { ...actual, getGemini: () => ({ models: { generateContent, generateContentStream } }) };
});

const { POST: analyze } = await import("@/app/api/analyze/route");
const { POST: chat } = await import("@/app/api/chat/route");
const { describeGeminiError, geminiErrorDetail, isRequestShapeError } = await import("@/lib/gemini/client");
const { clearAuditCache } = await import("@/lib/audit/cache");

const modelAudit = {
  insuranceHealthScore: 58,
  scoreFactors: [{ label: "Cost Efficiency", score: 40, note: "" }],
  totalCurrentAnnualSpend: 1,
  totalPotentialAnnualSavings: 1,
  summaryVerdict: "Raise the Civic's deductibles to save $380/yr. Also bundle.",
  policies: [
    {
      type: "auto",
      carrier: "Lone Star Mutual",
      policyNumber: "LSM-TX-4471-208815",
      insuredItem: "2 cars",
      currentAnnualPremium: 2760,
      optimizedAnnualPremium: 0,
      deductible: "$250",
      coverageLimit: "100/300/100",
      status: "overpaying",
      plainEnglishSummary: "Covers both cars.",
      coverageLines: [{ term: "Collision", value: "$250 deductible", plainEnglish: "Repairs your car." }],
      issues: [
        { title: "$250 deductible", category: "deductible", severity: "high", explanation: "x", annualSavings: 380, actionItem: "Raise it." },
      ],
    },
  ],
  whatIfScenarios: [{ title: "Fender bender", policyType: "auto", eventCost: 4200, description: "x", currentPlanOutOfPocket: 250, optimizedPlanOutOfPocket: 1000, currentAnnualPremiums: 0, optimizedAnnualPremiums: 0, verdict: "Ahead." }],
  negotiationScript: { recipient: "Retention", emailSubject: "LSM-TX-4471-208815", emailBody: "Hi", phoneTalkingPoints: ["Ask"] },
  disclaimers: [],
};

const ok = (payload: unknown) => ({ text: JSON.stringify(payload) });
const apiError = (status: number, message: string) =>
  new ApiError({ status, message: JSON.stringify({ error: { code: status, message, status: "X" } }) });

beforeEach(() => {
  generateContent.mockReset();
  generateContentStream.mockReset();
  clearAuditCache();
  vi.stubEnv("BILLING_SECRET", "test-secret");
  vi.stubEnv("GEMINI_RETRY_DELAY_MS", "0");
});

describe("POST /api/analyze with Gemini", () => {
  it("returns a normalized audit and consumes the free trial for own documents", async () => {
    generateContent.mockResolvedValueOnce(ok(modelAudit));
    const res = await analyze(post("/api/analyze", form([await ownFile("miller-auto")])));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.audit.totalCurrentAnnualSpend).toBe(2760); // recomputed, not the model's "1"
    expect(body.audit.totalPotentialAnnualSavings).toBe(380);
    expect(body.audit.summaryVerdict).toBe("Raise the Civic's deductibles to save $380/yr.");
    expect(body.meta.demo).toBe(false);
    expect(cookiesFrom(res)).toMatch(/^insuraus_trial=/);

    // The request sends the PDF inline with the strict schema.
    const call = generateContent.mock.calls[0][0];
    expect(call.model).toBe("gemini-2.5-flash");
    expect(call.config.responseSchema).toBeDefined();
    expect(call.contents[0].parts.some((p: { inlineData?: { mimeType: string } }) => p.inlineData?.mimeType === "application/pdf")).toBe(true);
  });

  it("does not consume the trial for sample documents", async () => {
    generateContent.mockResolvedValueOnce(ok(modelAudit));
    const res = await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])));
    expect((await res.json()).meta.demo).toBe(true);
    expect(res.headers.getSetCookie()).toHaveLength(0);
  });

  it("retries in JSON mode when Gemini rejects the response schema (400)", async () => {
    generateContent
      .mockRejectedValueOnce(apiError(400, "The specified schema produces a constraint that has too many states"))
      .mockResolvedValueOnce({ text: "```json\n" + JSON.stringify(modelAudit) + "\n```" });
    const res = await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])));

    expect(res.status).toBe(200);
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(generateContent.mock.calls[1][0].config.responseSchema).toBeUndefined();
  });

  it("falls back to another model when the configured one is unavailable (404)", async () => {
    generateContent.mockRejectedValueOnce(apiError(404, "models/gemini-2.5-flash is not found")).mockResolvedValueOnce(ok(modelAudit));
    const res = await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(generateContent.mock.calls[1][0].model).toBe("gemini-2.5-flash-lite");
    expect(body.meta.model).toBe("gemini-2.5-flash-lite");
  });

  it("switches to Flash-Lite (separate quota) when the main model is rate-limited (429)", async () => {
    generateContent.mockRejectedValueOnce(apiError(429, "Resource has been exhausted")).mockResolvedValueOnce(ok(modelAudit));
    const res = await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])));

    expect(res.status).toBe(200);
    expect(generateContent.mock.calls.map((c) => c[0].model)).toEqual(["gemini-2.5-flash", "gemini-2.5-flash-lite"]);
  });

  it("retries the same model once when Gemini is overloaded (503)", async () => {
    generateContent.mockRejectedValueOnce(apiError(503, "The model is overloaded")).mockResolvedValueOnce(ok(modelAudit));
    const res = await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])));

    expect(res.status).toBe(200);
    expect(generateContent.mock.calls.map((c) => c[0].model)).toEqual(["gemini-2.5-flash", "gemini-2.5-flash"]);
  });

  it("returns a friendly 429 only when every model is rate-limited", async () => {
    generateContent.mockRejectedValue(apiError(429, "Resource has been exhausted"));
    const res = await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])));

    expect(res.status).toBe(429);
    expect((await res.json()).error).toMatch(/try again in about 30 seconds/);
    expect(generateContent).toHaveBeenCalledTimes(3); // flash → flash-lite → flash-latest
  });

  it("serves identical documents from the cache without calling Gemini again", async () => {
    generateContent.mockResolvedValueOnce(ok(modelAudit));
    const first = await (await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])))).json();
    const second = await (await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])))).json();

    expect(generateContent).toHaveBeenCalledTimes(1);
    expect(first.meta.cachedAt).toBeUndefined();
    expect(second.meta.cachedAt).toEqual(expect.any(String));
    expect(second.audit).toEqual(first.audit);
  });

  it("does not reuse a cached audit when the household context differs", async () => {
    generateContent.mockResolvedValue(ok(modelAudit));
    await analyze(post("/api/analyze", form([await sampleFile("miller-auto")], { context: JSON.stringify({ state: "TX" }) })));
    await analyze(post("/api/analyze", form([await sampleFile("miller-auto")], { context: JSON.stringify({ state: "CA" }) })));

    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("still meters the free trial when an own-document audit comes from the cache", async () => {
    generateContent.mockResolvedValueOnce(ok(modelAudit));
    await analyze(post("/api/analyze", form([await ownFile("miller-home")])));
    const cached = await analyze(post("/api/analyze", form([await ownFile("miller-home")])));

    expect((await cached.json()).meta.cachedAt).toEqual(expect.any(String));
    expect(cookiesFrom(cached)).toMatch(/^insuraus_trial=/);
  });

  it("surfaces Gemini's own reason for other errors and does not consume the trial", async () => {
    generateContent.mockRejectedValueOnce(apiError(400, "API key not valid. Please pass a valid API key."));
    const res = await analyze(post("/api/analyze", form([await ownFile("miller-auto")])));

    expect(res.status).toBe(500);
    expect((await res.json()).error).toMatch(/API key was rejected/);
    expect(res.headers.getSetCookie()).toHaveLength(0);
  });

  it("returns 502 for malformed JSON and 422 when no policy is found", async () => {
    generateContent.mockResolvedValueOnce({ text: "{oops" });
    expect((await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])))).status).toBe(502);

    generateContent.mockResolvedValueOnce(ok({ ...modelAudit, policies: [], disclaimers: ["This is a pizza menu."] }));
    const res = await analyze(post("/api/analyze", form([await sampleFile("miller-auto")])));
    expect(res.status).toBe(422);
    expect((await res.json()).error).toBe("This is a pizza menu.");
  });
});

describe("POST /api/chat with Gemini", () => {
  it("streams the answer and meters questions on own documents", async () => {
    generateContentStream.mockResolvedValueOnce(
      (async function* () {
        yield { text: "Yes — **$40/day** " };
        yield { text: "for up to 30 days." };
      })(),
    );
    const fd = form([await ownFile("miller-auto")], { messages: JSON.stringify([{ role: "user", content: "Rental?" }]) });
    const res = await chat(post("/api/chat", fd));

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Yes — **$40/day** for up to 30 days.");
    expect(cookiesFrom(res)).toMatch(/^insuraus_trial=/);
    expect(generateContentStream.mock.calls[0][0].config.systemInstruction).toMatch(/How to cancel/);
  });
});

describe("Gemini error helpers", () => {
  it("extracts the human-readable message from Google's JSON error body", () => {
    expect(geminiErrorDetail(apiError(400, "Developer instruction is not enabled for api version v1"))).toBe(
      "Developer instruction is not enabled for api version v1",
    );
  });

  it("classifies only request-shape 400s as retryable", () => {
    expect(isRequestShapeError(apiError(400, "schema too complex"))).toBe(true);
    expect(isRequestShapeError(apiError(400, "API key not valid"))).toBe(false);
    expect(isRequestShapeError(apiError(400, "User location is not supported for the API use."))).toBe(false);
    expect(isRequestShapeError(apiError(429, "quota"))).toBe(false);
  });

  it("maps errors to safe, actionable messages", () => {
    expect(describeGeminiError(apiError(429, "quota")).status).toBe(429);
    expect(describeGeminiError(apiError(400, "User location is not supported for the API use.")).message).toMatch(/region/);
    expect(describeGeminiError(apiError(503, "overloaded")).status).toBe(502);
    expect(describeGeminiError(new Error("boom")).message).toMatch(/Unexpected error/);
  });
});
