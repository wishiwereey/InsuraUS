import { US_STATES, type UserContext } from "@/types/insurance";
import { MAX_FILES, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from "./request-limits";

export class RequestValidationError extends Error {
  constructor(
    message: string,
    public code: "BAD_REQUEST" | "FILE_TOO_LARGE" = "BAD_REQUEST",
  ) {
    super(message);
  }
}

export interface PdfPayload {
  name: string;
  base64: string;
}

/** Read, validate and base64-encode PDF uploads from multipart form data. */
export async function readPdfUploads(form: FormData, field = "files"): Promise<PdfPayload[]> {
  const files = form.getAll(field).filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f);
  if (files.length === 0) throw new RequestValidationError("Please upload at least one PDF policy document.");
  if (files.length > MAX_FILES) throw new RequestValidationError(`Upload at most ${MAX_FILES} PDFs at a time.`);

  let total = 0;
  const out: PdfPayload[] = [];
  for (const file of files) {
    if (file.size > MAX_FILE_BYTES) {
      throw new RequestValidationError(`"${file.name}" is larger than 10 MB.`, "FILE_TOO_LARGE");
    }
    total += file.size;
    if (total > MAX_TOTAL_BYTES) throw new RequestValidationError("Total upload size exceeds 18 MB.", "FILE_TOO_LARGE");
    const buf = Buffer.from(await file.arrayBuffer());
    // Validate by magic bytes, not by the (spoofable) extension or MIME type.
    if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new RequestValidationError(`"${file.name}" is not a valid PDF file.`);
    }
    out.push({ name: file.name, base64: buf.toString("base64") });
  }
  return out;
}

/** Parse and whitelist the optional household context. Unknown / invalid values are dropped. */
export function parseUserContext(raw: FormDataEntryValue | null): UserContext {
  if (typeof raw !== "string" || !raw) return {};
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  const ctx: UserContext = {};
  const int = (v: unknown, lo: number, hi: number) => {
    const n = Math.round(Number(v));
    return v !== "" && v != null && Number.isFinite(n) && n >= lo && n <= hi ? n : undefined;
  };
  if (typeof data.state === "string" && (US_STATES as readonly string[]).includes(data.state)) {
    ctx.state = data.state as UserContext["state"];
  }
  ctx.age = int(data.age, 16, 110);
  ctx.householdSize = int(data.householdSize, 1, 15);
  ctx.emergencyFund = int(data.emergencyFund, 0, 100_000_000);
  if (data.doctorVisits === "low" || data.doctorVisits === "medium" || data.doctorVisits === "high") {
    ctx.doctorVisits = data.doctorVisits;
  }
  return Object.fromEntries(Object.entries(ctx).filter(([, v]) => v !== undefined)) as UserContext;
}
