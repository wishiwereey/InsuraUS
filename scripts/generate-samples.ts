/**
 * Writes every demo policy PDF to ./sample-pdfs so you can inspect them or
 * drag them into the uploader manually.  Usage: npm run samples
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { SAMPLE_DOCS, generateSamplePdf, type SampleId } from "../src/lib/sample-pdfs";

async function main() {
  const outDir = path.resolve(process.cwd(), "sample-pdfs");
  await mkdir(outDir, { recursive: true });
  for (const id of Object.keys(SAMPLE_DOCS) as SampleId[]) {
    const bytes = await generateSamplePdf(id);
    const file = path.join(outDir, SAMPLE_DOCS[id].fileName);
    await writeFile(file, bytes);
    console.log(`✓ ${SAMPLE_DOCS[id].fileName} (${(bytes.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
