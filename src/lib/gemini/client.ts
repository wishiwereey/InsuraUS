import "server-only";
import { ApiError as GenAIApiError, GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

export class MissingApiKeyError extends Error {
  constructor() {
    super("GEMINI_API_KEY is not configured on the server. Add it to .env.local (see .env.example).");
  }
}

export function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new MissingApiKeyError();
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

/** Turn SDK / network errors into a message that is safe and useful to show users. */
export function describeGeminiError(err: unknown): { status: number; message: string } {
  if (err instanceof MissingApiKeyError) return { status: 500, message: err.message };
  if (err instanceof GenAIApiError) {
    if (err.status === 429) return { status: 429, message: "Gemini rate limit reached. Please wait ~30 seconds and try again." };
    if (err.status === 400 && /api key/i.test(err.message)) return { status: 500, message: "The server's Gemini API key is invalid." };
    if (err.status === 403) return { status: 500, message: "The server's Gemini API key is not authorized for this model." };
    if (err.status >= 500) return { status: 502, message: "Gemini is temporarily unavailable. Please try again in a moment." };
    return { status: 502, message: `Gemini request failed (${err.status}).` };
  }
  return { status: 500, message: "Unexpected error while contacting Gemini." };
}
