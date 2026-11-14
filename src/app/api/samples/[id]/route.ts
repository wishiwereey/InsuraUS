import { NextResponse } from "next/server";
import { SAMPLE_DOCS, generateSamplePdf, isSampleId } from "@/lib/sample-pdfs";

export const runtime = "nodejs";

/**
 * GET /api/samples/:id            → inline PDF (used by the 1-click presets)
 * GET /api/samples/:id?download=1 → forces a file download
 *
 * PDFs are generated on the fly with pdf-lib; nothing is stored on disk.
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSampleId(id)) return NextResponse.json({ error: "Unknown sample document." }, { status: 404 });

  const bytes = await generateSamplePdf(id);
  const { fileName } = SAMPLE_DOCS[id];
  const download = new URL(req.url).searchParams.has("download");

  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(bytes.length),
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
