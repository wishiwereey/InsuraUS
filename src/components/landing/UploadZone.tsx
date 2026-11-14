"use client";

import { FileText, UploadCloud, X } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";
import { MAX_FILES, MAX_FILE_BYTES } from "@/lib/request-limits";
import { cn, formatBytes } from "@/lib/utils";

interface UploadZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

/** Drag & drop (or click/keyboard) PDF picker. Validates type, size and count client-side. */
export function UploadZone({ files, onChange, disabled }: UploadZoneProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const pdfs = list.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
      const tooBig = pdfs.filter((f) => f.size > MAX_FILE_BYTES);
      const ok = pdfs.filter((f) => f.size <= MAX_FILE_BYTES);
      const merged = [...files.filter((f) => !ok.some((n) => n.name === f.name)), ...ok].slice(0, MAX_FILES);

      if (pdfs.length < list.length) setWarning("Only PDF files are supported.");
      else if (tooBig.length) setWarning(`${tooBig[0].name} is over 10 MB.`);
      else if (files.length + ok.length > MAX_FILES) setWarning(`Up to ${MAX_FILES} documents per audit.`);
      else setWarning(null);
      onChange(merged);
    },
    [files, onChange],
  );

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-all",
          dragging
            ? "border-savings bg-savings-soft/60"
            : "border-line-strong/70 bg-canvas/60 hover:border-ink/40 hover:bg-canvas",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        <span
          className={cn(
            "flex size-12 items-center justify-center rounded-full border bg-surface shadow-card transition-transform group-hover:-translate-y-0.5",
            dragging ? "border-savings text-savings" : "border-line text-ink",
          )}
        >
          <UploadCloud className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-ink">
            Drop your policy PDFs here, or <span className="underline underline-offset-4">browse</span>
          </span>
          <span className="mt-1 block text-xs text-muted">
            Declarations pages, summaries of benefits or enrollment forms • Auto, Health, Home, Renters • up to {MAX_FILES} files
          </span>
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          disabled={disabled}
          className="sr-only"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {warning && <p className="mt-2 text-xs font-medium text-risk-strong">{warning}</p>}

      {files.length > 0 && (
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {files.map((f) => (
            <li
              key={f.name}
              className="flex animate-fade-up items-center gap-3 rounded-lg border border-line bg-surface px-3 py-2 shadow-card"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-risk-soft text-risk-strong">
                <FileText className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink">{f.name}</span>
                <span className="money block text-xs text-muted">{formatBytes(f.size)}</span>
              </span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(files.filter((x) => x !== f))}
                className="rounded-md p-1 text-subtle transition hover:bg-canvas hover:text-ink"
                aria-label={`Remove ${f.name}`}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
