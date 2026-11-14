import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { FREE_TRIAL, type BillingStatus, type ProSubscription } from "./plans";

/**
 * Prototype billing state with no database and no accounts: two HMAC-signed,
 * httpOnly cookies. The server trusts only what it signed, so the client can't
 * grant itself Pro or reset its trial counter by editing a cookie.
 * (Clearing cookies does reset the trial — acceptable for a prototype; a real
 * product would tie this to an account.)
 */

const PRO_COOKIE = "insuraus_pro";
const TRIAL_COOKIE = "insuraus_trial";
const YEAR = 60 * 60 * 24 * 365;

export interface TrialUsage {
  audits: number;
  chats: number;
}

export interface BillingState {
  pro: ProSubscription | null;
  trial: TrialUsage;
}

function secret(): string {
  if (process.env.BILLING_SECRET) return process.env.BILLING_SECRET;
  // Stable across serverless instances without extra config; never exposes the key itself.
  if (process.env.GEMINI_API_KEY) return createHash("sha256").update(`insuraus-billing:${process.env.GEMINI_API_KEY}`).digest("hex");
  return "insuraus-dev-only-secret";
}

function sign(payload: object): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

function readCookies(req: Request): Record<string, string> {
  const header = req.headers.get("cookie") ?? "";
  return Object.fromEntries(
    header
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k, v]) => k && v)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join("="))]),
  );
}

export function readBilling(req: Request): BillingState {
  const cookies = readCookies(req);
  let pro = verify<ProSubscription>(cookies[PRO_COOKIE]);
  if (pro && new Date(pro.renewsAt).getTime() < Date.now()) pro = null; // expired prototype sub
  const trial = verify<TrialUsage>(cookies[TRIAL_COOKIE]) ?? { audits: 0, chats: 0 };
  return { pro, trial };
}

export function toStatus(state: BillingState): BillingStatus {
  return {
    plan: state.pro ? "pro" : "free",
    trialAuditsLeft: Math.max(0, FREE_TRIAL.audits - state.trial.audits),
    trialChatsLeft: Math.max(0, FREE_TRIAL.chatQuestions - state.trial.chats),
    pro: state.pro,
  };
}

function cookie(name: string, value: string, maxAge: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

export const trialCookie = (usage: TrialUsage) => cookie(TRIAL_COOKIE, sign(usage), YEAR);
export const proCookie = (sub: ProSubscription) => cookie(PRO_COOKIE, sign(sub), YEAR);
export const clearProCookie = () => cookie(PRO_COOKIE, "", 0);
export const clearTrialCookie = () => cookie(TRIAL_COOKIE, "", 0);
