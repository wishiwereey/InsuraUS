import { generateSamplePdf, type SampleId } from "@/lib/sample-pdfs";

/** A real generated sample PDF as an upload-ready File. */
export async function sampleFile(id: SampleId, name = `${id}.pdf`): Promise<File> {
  return new File([Buffer.from(await generateSamplePdf(id))], name, { type: "application/pdf" });
}

/**
 * A "user's own" PDF: a valid PDF whose bytes differ from every sample
 * (appending a PDF comment keeps it valid but changes the hash).
 */
export async function ownFile(id: SampleId, name = `own-${id}.pdf`): Promise<File> {
  const bytes = Buffer.concat([Buffer.from(await generateSamplePdf(id)), Buffer.from("\n% user copy\n")]);
  return new File([bytes], name, { type: "application/pdf" });
}

export function form(files: File[], extra: Record<string, string> = {}): FormData {
  const fd = new FormData();
  files.forEach((f) => fd.append("files", f));
  Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
  return fd;
}

export function post(url: string, body: FormData | object, cookie?: string): Request {
  const isForm = body instanceof FormData;
  return new Request(`http://localhost${url}`, {
    method: "POST",
    body: isForm ? body : JSON.stringify(body),
    headers: { ...(isForm ? {} : { "content-type": "application/json" }), ...(cookie ? { cookie } : {}) },
  });
}

/** Turn a response's Set-Cookie headers into a Cookie request header. */
export function cookiesFrom(res: Response): string {
  return res.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .filter((c) => !c.endsWith("="))
    .join("; ");
}
