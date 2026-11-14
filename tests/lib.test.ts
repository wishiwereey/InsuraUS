import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";
import { futureValueOfAnnualSavings, growthSeries } from "@/lib/finance";
import { sampleHashes } from "@/lib/billing/samples";
import { SAMPLE_DOCS, generateSamplePdf, type SampleId } from "@/lib/sample-pdfs";
import { formatCompactUSD, formatSignedUSD, formatUSD, shortTitle } from "@/lib/utils";
import { DEMO_PRESETS } from "@/lib/presets";

describe("finance — 5-year wealth impact", () => {
  it("matches the ordinary-annuity future value at 7%", () => {
    // 1000 * ((1.07^5 - 1) / 0.07) = 5750.74
    expect(futureValueOfAnnualSavings(1000)).toBeCloseTo(5750.74, 2);
  });

  it("is zero for no or negative savings", () => {
    expect(futureValueOfAnnualSavings(0)).toBe(0);
    expect(futureValueOfAnnualSavings(-500)).toBe(0);
  });

  it("produces a monotonically growing series ending at the FV", () => {
    const s = growthSeries(1858);
    expect(s).toHaveLength(6);
    for (let i = 1; i < s.length; i++) expect(s[i].balance).toBeGreaterThan(s[i - 1].balance);
    expect(s[5].balance).toBeCloseTo(futureValueOfAnnualSavings(1858), 6);
  });
});

describe("formatting helpers", () => {
  it("formats whole dollars", () => {
    expect(formatUSD(8640.4)).toBe("$8,640");
    expect(formatSignedUSD(-180)).toBe("−$180");
    expect(formatSignedUSD(1240)).toBe("+$1,240");
    expect(formatCompactUSD(7500)).toBe("$7.5k");
    expect(formatCompactUSD(10000)).toBe("$10k");
  });

  it("trims the trailing amount from scenario titles", () => {
    expect(shortTitle("Minor Auto Collision (Ford F-150) - $3,000")).toBe("Minor Auto Collision (Ford F-150)");
    expect(shortTitle("Fender Bender ($4,200 repair)")).toBe("Fender Bender");
    expect(shortTitle("At-Fault Auto Accident")).toBe("At-Fault Auto Accident");
  });
});

describe("sample PDF generator", () => {
  const ids = Object.keys(SAMPLE_DOCS) as SampleId[];

  it.each(ids)("%s is a valid multi-section PDF", async (id) => {
    const doc = await PDFDocument.load(await generateSamplePdf(id));
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(1);
    expect(doc.getTitle()).toMatch(/—/);
  });

  it("is deterministic, so demo documents can be recognized by hash", async () => {
    const hashes = await sampleHashes();
    expect(hashes.size).toBe(ids.length);
  });

  it("presets add up to the advertised household spend", () => {
    for (const p of DEMO_PRESETS) {
      const total = p.docs.reduce((sum, id) => sum + SAMPLE_DOCS[id].annualPremium, 0);
      expect(total).toBe(p.annualSpend);
    }
  });
});
