import "server-only";
import { createHash } from "node:crypto";
import { SAMPLE_DOCS, generateSamplePdf, type SampleId } from "@/lib/sample-pdfs";

/**
 * SHA-256 of every generated sample PDF. Sample generation is deterministic
 * (fixed metadata dates), so the server can recognize demo documents and keep
 * them free without trusting anything the client says.
 */
let hashes: Promise<Set<string>> | null = null;

export function sampleHashes(): Promise<Set<string>> {
  hashes ??= Promise.all(
    (Object.keys(SAMPLE_DOCS) as SampleId[]).map(async (id) =>
      createHash("sha256").update(await generateSamplePdf(id)).digest("hex"),
    ),
  ).then((list) => new Set(list));
  return hashes;
}
