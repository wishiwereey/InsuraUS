import { beforeEach, describe, expect, it, vi } from "vitest";
import { FREE_TRIAL } from "@/lib/billing/plans";
import { clearProCookie, proCookie, readBilling, toStatus, trialCookie } from "@/lib/billing/server";
import type { ProSubscription } from "@/lib/billing/plans";

const reqWith = (cookie: string) => new Request("http://localhost/", { headers: { cookie } });
const pair = (setCookie: string) => setCookie.split(";")[0];

const sub = (over: Partial<ProSubscription> = {}): ProSubscription => ({
  since: new Date().toISOString(),
  renewsAt: new Date(Date.now() + 30 * 864e5).toISOString(),
  last4: "4242",
  brand: "Visa",
  invoiceId: "INV-TEST",
  ...over,
});

beforeEach(() => {
  vi.stubEnv("BILLING_SECRET", "test-secret");
});

describe("signed billing cookies", () => {
  it("round-trips trial usage", () => {
    const state = readBilling(reqWith(pair(trialCookie({ audits: 1, chats: 3 }))));
    expect(state.trial).toEqual({ audits: 1, chats: 3 });
    expect(state.pro).toBeNull();
  });

  it("round-trips a Pro subscription", () => {
    const s = sub();
    const state = readBilling(reqWith(pair(proCookie(s))));
    expect(state.pro).toEqual(s);
  });

  it("rejects a tampered payload (client can't grant itself Pro)", () => {
    const [name, value] = pair(proCookie(sub())).split("=");
    const [, sig] = decodeURIComponent(value).split(".");
    const forgedBody = Buffer.from(JSON.stringify(sub({ last4: "0000" }))).toString("base64url");
    const state = readBilling(reqWith(`${name}=${encodeURIComponent(`${forgedBody}.${sig}`)}`));
    expect(state.pro).toBeNull();
  });

  it("rejects a cookie signed with a different secret", () => {
    const cookie = pair(trialCookie({ audits: 0, chats: 0 }));
    vi.stubEnv("BILLING_SECRET", "another-secret");
    // A forged "fresh trial" cookie from another key must not reset usage.
    expect(readBilling(reqWith(cookie)).trial).toEqual({ audits: 0, chats: 0 });
    const used = pair(trialCookie({ audits: 1, chats: 5 }));
    vi.stubEnv("BILLING_SECRET", "test-secret");
    expect(readBilling(reqWith(used)).trial).toEqual({ audits: 0, chats: 0 }); // unverifiable → default
  });

  it("ignores garbage and missing cookies", () => {
    expect(readBilling(reqWith("insuraus_pro=not-a-token; insuraus_trial=abc.def")).pro).toBeNull();
    expect(readBilling(new Request("http://localhost/")).trial).toEqual({ audits: 0, chats: 0 });
  });

  it("treats an expired subscription as free", () => {
    const expired = sub({ renewsAt: new Date(Date.now() - 1000).toISOString() });
    expect(readBilling(reqWith(pair(proCookie(expired)))).pro).toBeNull();
  });

  it("sets httpOnly, SameSite=Lax cookies and clears with Max-Age=0", () => {
    expect(trialCookie({ audits: 0, chats: 0 })).toMatch(/HttpOnly; SameSite=Lax/);
    expect(clearProCookie()).toMatch(/Max-Age=0/);
  });
});

describe("toStatus", () => {
  it("reports remaining trial allowance and never goes negative", () => {
    expect(toStatus({ pro: null, trial: { audits: 0, chats: 2 } })).toMatchObject({
      plan: "free",
      trialAuditsLeft: FREE_TRIAL.audits,
      trialChatsLeft: FREE_TRIAL.chatQuestions - 2,
    });
    expect(toStatus({ pro: null, trial: { audits: 9, chats: 99 } })).toMatchObject({ trialAuditsLeft: 0, trialChatsLeft: 0 });
  });

  it("reports Pro when subscribed", () => {
    expect(toStatus({ pro: sub(), trial: { audits: 1, chats: 5 } }).plan).toBe("pro");
  });
});
