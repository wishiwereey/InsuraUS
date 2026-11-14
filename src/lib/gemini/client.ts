import "server-only";
import { ApiError as GenAIApiError, GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
/** Used automatically if the primary model is unavailable (404) for this key/region. */
export const GEMINI_FALLBACK_MODEL = "gemini-flash-latest";

let client: GoogleGenAI | null = null;

export class MissingApiKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not configured on the server. Add it to .env.local (see .env.example) and restart the server.");
  }
}

export function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new MissingApiKeyError();
  // @google/genai 3.x defaults to API v1, which rejects systemInstruction and
  // responseSchema ("Developer instruction is not enabled for api version v1").
  client ??= new GoogleGenAI({ apiKey, apiVersion: "v1beta" });
  return client;
}

/**
 * The SDK's ApiError.message is usually the raw JSON body from Google, e.g.
 * `{"error":{"code":400,"message":"…","status":"INVALID_ARGUMENT"}}`.
 * Pull out the human-readable part.
 */
export function geminiErrorDetail(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const jsonStart = raw.indexOf("{");
  if (jsonStart >= 0) {
    try {
      const parsed = JSON.parse(raw.slice(jsonStart));
      const msg = parsed?.error?.message ?? parsed?.message;
      if (typeof msg === "string") return msg;
    } catch {
      /* not JSON — fall through */
    }
  }
  return raw;
}

export const isApiError = (err: unknown): err is GenAIApiError => err instanceof GenAIApiError;

/** 400s that mean "your request shape is wrong" (schema, params) rather than auth/location problems. */
export function isRequestShapeError(err: unknown): boolean {
  if (!isApiError(err) || err.status !== 400) return false;
  const d = geminiErrorDetail(err).toLowerCase();
  return !d.includes("api key") && !d.includes("location") && !d.includes("billing");
}

/** Turn SDK / network errors into a message that is safe and useful to show users. */
export function describeGeminiError(err: unknown): { status: number; message: string } {
  if (err instanceof MissingApiKeyError) return { status: 500, message: err.message };
  if (isApiError(err)) {
    const detail = geminiErrorDetail(err).slice(0, 300);
    const d = detail.toLowerCase();
    if (err.status === 429) return { status: 429, message: "Gemini rate limit reached. Wait ~30 seconds and try again." };
    if (d.includes("api key") || err.status === 401)
      return { status: 500, message: "Your Gemini API key was rejected. Check GEMINI_API_KEY in .env.local (no quotes or spaces) and restart the server." };
    if (d.includes("location is not supported"))
      return {
        status: 500,
        message: "Gemini API isn't available from your current region. Deploy to Vercel (US servers) or use a VPN for local testing.",
      };
    if (err.status === 403) return { status: 500, message: `Gemini refused the request (403): ${detail}` };
    if (err.status >= 500) return { status: 502, message: "Gemini is temporarily unavailable. Please try again in a moment." };
    return { status: 502, message: `Gemini request failed (${err.status}): ${detail}` };
  }
  return { status: 500, message: `Unexpected error while contacting Gemini: ${geminiErrorDetail(err).slice(0, 200)}` };
}
