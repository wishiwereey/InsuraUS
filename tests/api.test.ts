/**
 * Integration tests that call the real Next.js route handlers.
 * They run without a Gemini key: the billing gate and validation happen
 * before any AI call, so "MISSING_API_KEY" (500) means "passed the gate".
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as analyze } from "@/app/api/analyze/route";
import { POST as chat } from "@/app/api/chat/route";
import { POST as cancel } from "@/app/api/billing/cancel/route";
import { POST as checkout } from "@/app/api/billing/checkout/route";
import { POST as reset } from "@/app/api/billing/reset/route";
import { GET as status } from "@/app/api/billing/status/route";
import { GET as sample } from "@/app/api/samples/[id]/route";
import { trialCookie } from "@/lib/billing/server";
import { cookiesFrom, form, ownFile, post, sampleFile } from "./helpers";

const usedTrial = () => trialCookie({ audits: 1, chats: 5 }).split(";")[0];
const passedGate = (body: { code?: string }) => body.code === "MISSING_API_KEY";

beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "");
  vi.stubEnv("BILLING_SECRET", "test-secret");
});

describe("POST /api/analyze — free trial gate", () => {
  it("lets a free user audit up to 2 of their own PDFs", async () => {
    const res = await analyze(post("/api/analyze", form([await ownFile("miller-auto"), await ownFile("miller-home")])));
    expect(passedGate(await res.json())).toBe(true);
  });

  it("returns 402 file_limit for 3 own PDFs on the free trial", async () => {
    const res = await analyze(
      post("/api/analyze", form([await ownFile("miller-auto"), await ownFile("miller-home"), await ownFile("miller-health")])),
    );
    expect(res.status).toBe(402);
    expect(await res.json()).toMatchObject({ code: "PAYWALL", reason: "file_limit" });
  });

  it("returns 402 trial_used once the free audit is spent", async () => {
    const res = await analyze(post("/api/analyze", form([await ownFile("miller-auto")]), usedTrial()));
    expect(res.status).toBe(402);
    expect(await res.json()).toMatchObject({ reason: "trial_used" });
  });

  it("keeps sample households free — even 3 files with a used-up trial", async () => {
    const files = await Promise.all((["miller-auto", "miller-health", "miller-home"] as const).map((id) => sampleFile(id)));
    const res = await analyze(post("/api/analyze", form(files), usedTrial()));
    expect(passedGate(await res.json())).toBe(true);
  });

  it("lets Pro users audit 3+ own PDFs after the trial is used", async () => {
    const paid = await checkout(post("/api/billing/checkout", { last4: "4242", brand: "Visa" }));
    const cookie = `${cookiesFrom(paid)}; ${usedTrial()}`;
    const files = [await ownFile("miller-auto"), await ownFile("miller-home"), await ownFile("miller-health")];
    const res = await analyze(post("/api/analyze", form(files), cookie));
    expect(passedGate(await res.json())).toBe(true);
  });

  it("rejects a fake PDF with 400 before touching billing or Gemini", async () => {
    const res = await analyze(post("/api/analyze", form([new File(["nope"], "x.pdf")])));
    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("POST /api/chat — Copilot question limit", () => {
  const ask = (files: File[], cookie?: string) =>
    chat(post("/api/chat", form(files, { messages: JSON.stringify([{ role: "user", content: "Does my policy cover rentals?" }]) }), cookie));

  it("returns 402 chat_limit after the free questions on own documents", async () => {
    const res = await ask([await ownFile("rivera-auto")], usedTrial());
    expect(res.status).toBe(402);
    expect(await res.json()).toMatchObject({ reason: "chat_limit" });
  });

  it("never meters questions about sample documents", async () => {
    const res = await ask([await sampleFile("rivera-auto")], usedTrial());
    expect(passedGate(await res.json())).toBe(true);
  });

  it("requires the last message to be from the user", async () => {
    const res = await chat(post("/api/chat", form([await sampleFile("rivera-auto")], { messages: "[]" })));
    expect(res.status).toBe(400);
  });
});

describe("billing endpoints", () => {
  it("checkout → status → cancel lifecycle", async () => {
    const paid = await checkout(post("/api/billing/checkout", { last4: "4242", brand: "Visa" }));
    expect(paid.status).toBe(200);
    const cookie = cookiesFrom(paid);

    const s = await (await status(new Request("http://localhost/api/billing/status", { headers: { cookie } }))).json();
    expect(s.plan).toBe("pro");
    expect(s.pro).toMatchObject({ last4: "4242", brand: "Visa" });
    expect(new Date(s.pro.renewsAt).getTime()).toBeGreaterThan(Date.now());

    const cancelled = await cancel(post("/api/billing/cancel", {}, cookie));
    expect((await cancelled.json()).plan).toBe("free");
    expect(cancelled.headers.getSetCookie().join()).toMatch(/insuraus_pro=; .*Max-Age=0/);
  });

  it("rejects checkout without valid test-card details", async () => {
    expect((await checkout(post("/api/billing/checkout", { last4: "42", brand: "Visa" }))).status).toBe(400);
    expect((await checkout(post("/api/billing/checkout", { last4: "4242", brand: "Amex" }))).status).toBe(400);
  });

  it("reset restores a fresh trial", async () => {
    const res = await reset();
    expect(await res.json()).toMatchObject({ plan: "free", trialAuditsLeft: 1, trialChatsLeft: 5 });
    expect(res.headers.getSetCookie()).toHaveLength(2);
  });
});

describe("GET /api/samples/:id", () => {
  it("serves a generated PDF inline or as a download", async () => {
    const params = Promise.resolve({ id: "miller-auto" });
    const inline = await sample(new Request("http://localhost/api/samples/miller-auto"), { params });
    expect(inline.headers.get("content-type")).toBe("application/pdf");
    expect(Buffer.from(await inline.arrayBuffer()).subarray(0, 5).toString()).toBe("%PDF-");

    const dl = await sample(new Request("http://localhost/api/samples/miller-auto?download=1"), {
      params: Promise.resolve({ id: "miller-auto" }),
    });
    expect(dl.headers.get("content-disposition")).toMatch(/^attachment;/);
  });

  it("404s for unknown ids", async () => {
    const res = await sample(new Request("http://localhost/api/samples/nope"), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);
  });
});
