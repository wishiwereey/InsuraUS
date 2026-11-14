import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { RequestValidationError, parseUserContext, readPdfUploads } from "@/lib/request";
import { MAX_FILES } from "@/lib/request-limits";
import { form, sampleFile } from "./helpers";

describe("parseUserContext — whitelists household context", () => {
  it("keeps valid fields", () => {
    expect(
      parseUserContext(JSON.stringify({ state: "TX", age: "42", householdSize: 4, doctorVisits: "low", emergencyFund: 15000 })),
    ).toEqual({ state: "TX", age: 42, householdSize: 4, doctorVisits: "low", emergencyFund: 15000 });
  });

  it("drops unknown states, out-of-range numbers and unexpected keys", () => {
    expect(
      parseUserContext(JSON.stringify({ state: "ZZ", age: 7, householdSize: 99, doctorVisits: "always", emergencyFund: -1, evil: "x" })),
    ).toEqual({});
  });

  it("survives malformed or missing input", () => {
    expect(parseUserContext("{not json")).toEqual({});
    expect(parseUserContext(null)).toEqual({});
  });
});

describe("readPdfUploads — validates uploads", () => {
  it("accepts real PDFs and returns base64 + sha256", async () => {
    const file = await sampleFile("rivera-renters");
    const [pdf] = await readPdfUploads(form([file]));
    const bytes = Buffer.from(await file.arrayBuffer());
    expect(pdf.name).toBe(file.name);
    expect(Buffer.from(pdf.base64, "base64").equals(bytes)).toBe(true);
    expect(pdf.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
  });

  it("rejects a non-PDF even with a .pdf name and PDF MIME type (magic-byte check)", async () => {
    const fake = new File(["hello world"], "policy.pdf", { type: "application/pdf" });
    await expect(readPdfUploads(form([fake]))).rejects.toThrow(/not a valid PDF/);
  });

  it("requires at least one file", async () => {
    await expect(readPdfUploads(new FormData())).rejects.toBeInstanceOf(RequestValidationError);
  });

  it(`rejects more than ${MAX_FILES} files`, async () => {
    const f = await sampleFile("rivera-renters");
    await expect(readPdfUploads(form(Array(MAX_FILES + 1).fill(f)))).rejects.toThrow(/at most/);
  });

  it("rejects files over 10 MB with FILE_TOO_LARGE", async () => {
    const big = new File([Buffer.concat([Buffer.from("%PDF-"), Buffer.alloc(10 * 1024 * 1024)])], "big.pdf");
    const err = await readPdfUploads(form([big])).catch((e) => e);
    expect(err).toBeInstanceOf(RequestValidationError);
    expect(err.code).toBe("FILE_TOO_LARGE");
  });
});
