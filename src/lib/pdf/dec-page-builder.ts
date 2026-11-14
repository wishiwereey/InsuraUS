import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, type RGB } from "pdf-lib";

/**
 * Tiny layout engine on top of pdf-lib for "insurance declarations page" style
 * documents: branded header on every page, key/value grids, ruled tables,
 * wrapped paragraphs, automatic page breaks and "Page X of Y" footers.
 */

export interface CarrierBrand {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  /** Brand accent as [r, g, b] in 0–255. */
  color: [number, number, number];
  formNumber: string;
}

const PAGE_W = 612; // US Letter
const PAGE_H = 792;
const MARGIN_X = 48;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const HEADER_H = 78;
const FOOTER_H = 44;

const INK = rgb(0.09, 0.11, 0.16);
const MUTED = rgb(0.38, 0.42, 0.5);
const RULE = rgb(0.82, 0.85, 0.89);
const ZEBRA = rgb(0.965, 0.972, 0.98);

export type Align = "left" | "right" | "center";

export interface TableOptions {
  colWidths: number[]; // fractions summing to 1
  align?: Align[];
  fontSize?: number;
  boldLastRow?: boolean;
}

export class DecPageBuilder {
  private doc!: PDFDocument;
  private font!: PDFFont;
  private bold!: PDFFont;
  private oblique!: PDFFont;
  private page!: PDFPage;
  private y = 0;
  private accent: RGB;

  private constructor(
    private brand: CarrierBrand,
    private docTitle: string,
    private docSubtitle: string,
  ) {
    const [r, g, b] = brand.color;
    this.accent = rgb(r / 255, g / 255, b / 255);
  }

  static async create(brand: CarrierBrand, title: string, subtitle: string) {
    const builder = new DecPageBuilder(brand, title, subtitle);
    builder.doc = await PDFDocument.create();
    builder.font = await builder.doc.embedFont(StandardFonts.Helvetica);
    builder.bold = await builder.doc.embedFont(StandardFonts.HelveticaBold);
    builder.oblique = await builder.doc.embedFont(StandardFonts.HelveticaOblique);
    builder.doc.setTitle(`${brand.name} — ${title}`);
    builder.doc.setAuthor(brand.name);
    builder.doc.setSubject(subtitle);
    builder.doc.setProducer("Insura sample generator (fictional specimen)");
    builder.doc.setCreator("Insura");
    builder.newPage();
    return builder;
  }

  // ---------------------------------------------------------------- layout

  private newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.drawHeader();
    this.y = PAGE_H - HEADER_H - 22;
  }

  private ensureSpace(height: number) {
    if (this.y - height < FOOTER_H + 12) this.newPage();
  }

  private drawHeader() {
    const p = this.page;
    p.drawRectangle({ x: 0, y: PAGE_H - 6, width: PAGE_W, height: 6, color: this.accent });
    // Logo mark: rounded-ish square with initials
    const initials = this.brand.name
      .split(/\s+/)
      .filter((w) => /^[A-Z]/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join("");
    p.drawRectangle({ x: MARGIN_X, y: PAGE_H - 58, width: 34, height: 34, color: this.accent });
    p.drawText(initials, {
      x: MARGIN_X + 17 - this.bold.widthOfTextAtSize(initials, 13) / 2,
      y: PAGE_H - 46,
      size: 13,
      font: this.bold,
      color: rgb(1, 1, 1),
    });
    p.drawText(this.brand.name, { x: MARGIN_X + 44, y: PAGE_H - 38, size: 13, font: this.bold, color: INK });
    p.drawText(this.brand.tagline, { x: MARGIN_X + 44, y: PAGE_H - 52, size: 7.5, font: this.font, color: MUTED });

    const right = (text: string, y: number, size: number, f: PDFFont, c: RGB) =>
      p.drawText(text, { x: PAGE_W - MARGIN_X - f.widthOfTextAtSize(text, size), y, size, font: f, color: c });
    right(this.docTitle.toUpperCase(), PAGE_H - 34, 10.5, this.bold, this.accent);
    right(this.docSubtitle, PAGE_H - 47, 7.5, this.font, MUTED);
    right(`${this.brand.address}  |  ${this.brand.phone}`, PAGE_H - 58, 7, this.font, MUTED);
    p.drawLine({
      start: { x: MARGIN_X, y: PAGE_H - HEADER_H + 8 },
      end: { x: PAGE_W - MARGIN_X, y: PAGE_H - HEADER_H + 8 },
      thickness: 0.75,
      color: RULE,
    });
  }

  // ---------------------------------------------------------------- text helpers

  private wrap(text: string, font: PDFFont, size: number, width: number): string[] {
    const lines: string[] = [];
    for (const para of text.split("\n")) {
      let line = "";
      for (const word of para.split(/\s+/)) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) > width && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    return lines;
  }

  private drawAligned(text: string, x: number, width: number, y: number, size: number, font: PDFFont, align: Align, color = INK) {
    const w = font.widthOfTextAtSize(text, size);
    const dx = align === "right" ? width - w : align === "center" ? (width - w) / 2 : 0;
    this.page.drawText(text, { x: x + dx, y, size, font, color });
  }

  // ---------------------------------------------------------------- public blocks

  /** Highlighted banner like "IMPORTANT: Please review…" */
  notice(text: string) {
    const size = 8;
    const lines = this.wrap(text, this.font, size, CONTENT_W - 20);
    const h = lines.length * 11 + 12;
    this.ensureSpace(h + 6);
    const [r, g, b] = this.brand.color;
    this.page.drawRectangle({
      x: MARGIN_X,
      y: this.y - h,
      width: CONTENT_W,
      height: h,
      color: rgb(r / 255 * 0.08 + 0.92, g / 255 * 0.08 + 0.92, b / 255 * 0.08 + 0.92),
      borderColor: this.accent,
      borderWidth: 0.6,
    });
    lines.forEach((l, i) =>
      this.page.drawText(l, { x: MARGIN_X + 10, y: this.y - 14 - i * 11, size, font: this.font, color: INK }),
    );
    this.y -= h + 12;
  }

  section(title: string) {
    // Keep a heading together with at least a few lines of its content.
    this.ensureSpace(80);
    this.y -= 6;
    this.page.drawRectangle({ x: MARGIN_X, y: this.y - 4, width: 3, height: 13, color: this.accent });
    this.page.drawText(title.toUpperCase(), { x: MARGIN_X + 9, y: this.y, size: 9, font: this.bold, color: INK });
    this.y -= 16;
  }

  /** Two (or N) column grid of label/value pairs. */
  keyValues(pairs: [string, string][], columns = 2) {
    const colW = CONTENT_W / columns;
    for (let i = 0; i < pairs.length; i += columns) {
      const row = pairs.slice(i, i + columns).map(([label, value]) => ({
        label,
        lines: this.wrap(value, this.font, 9, colW - 12),
      }));
      const rowH = 14 + Math.max(...row.map((r) => r.lines.length)) * 11;
      this.ensureSpace(rowH);
      row.forEach(({ label, lines }, c) => {
        const x = MARGIN_X + c * colW;
        this.page.drawText(label.toUpperCase(), { x, y: this.y, size: 6.5, font: this.bold, color: MUTED });
        lines.forEach((l, li) => this.page.drawText(l, { x, y: this.y - 11 - li * 11, size: 9, font: this.font, color: INK }));
      });
      this.y -= rowH;
    }
    this.y -= 4;
  }

  table(headers: string[], rows: string[][], opts: TableOptions) {
    const size = opts.fontSize ?? 8;
    const widths = opts.colWidths.map((f) => f * CONTENT_W);
    const align = opts.align ?? headers.map(() => "left" as Align);
    const pad = 5;
    const lineH = size + 3;

    const drawHeaderRow = () => {
      const h = 18;
      this.ensureSpace(h + lineH * 2);
      this.page.drawRectangle({ x: MARGIN_X, y: this.y - h + 5, width: CONTENT_W, height: h, color: this.accent });
      let x = MARGIN_X;
      headers.forEach((hd, i) => {
        this.drawAligned(hd.toUpperCase(), x + pad, widths[i] - pad * 2, this.y - 8, 6.8, this.bold, align[i], rgb(1, 1, 1));
        x += widths[i];
      });
      this.y -= h;
    };

    drawHeaderRow();
    rows.forEach((row, ri) => {
      const isTotal = opts.boldLastRow && ri === rows.length - 1;
      const f = isTotal ? this.bold : this.font;
      const cells = row.map((cell, i) => this.wrap(cell, f, size, widths[i] - pad * 2));
      const h = Math.max(...cells.map((c) => c.length)) * lineH + 6;
      if (this.y - h < FOOTER_H + 12) {
        this.newPage();
        drawHeaderRow();
      }
      if (ri % 2 === 1 || isTotal) {
        this.page.drawRectangle({ x: MARGIN_X, y: this.y - h + 5, width: CONTENT_W, height: h, color: ZEBRA });
      }
      let x = MARGIN_X;
      cells.forEach((lines, i) => {
        lines.forEach((l, li) => this.drawAligned(l, x + pad, widths[i] - pad * 2, this.y - 6 - li * lineH, size, f, align[i]));
        x += widths[i];
      });
      this.page.drawLine({
        start: { x: MARGIN_X, y: this.y - h + 5 },
        end: { x: MARGIN_X + CONTENT_W, y: this.y - h + 5 },
        thickness: 0.4,
        color: RULE,
      });
      this.y -= h;
    });
    this.y -= 10;
  }

  paragraph(text: string, opts: { size?: number; italic?: boolean; muted?: boolean } = {}) {
    const size = opts.size ?? 8;
    const f = opts.italic ? this.oblique : this.font;
    for (const line of this.wrap(text, f, size, CONTENT_W)) {
      this.ensureSpace(size + 4);
      this.page.drawText(line, { x: MARGIN_X, y: this.y, size, font: f, color: opts.muted ? MUTED : INK });
      this.y -= size + 3.5;
    }
    this.y -= 5;
  }

  bullets(items: string[], size = 8) {
    for (const item of items) {
      const lines = this.wrap(item, this.font, size, CONTENT_W - 14);
      lines.forEach((line, i) => {
        this.ensureSpace(size + 4);
        if (i === 0) this.page.drawText("•", { x: MARGIN_X + 2, y: this.y, size, font: this.bold, color: this.accent });
        this.page.drawText(line, { x: MARGIN_X + 14, y: this.y, size, font: this.font, color: INK });
        this.y -= size + 3.5;
      });
      this.y -= 2;
    }
    this.y -= 4;
  }

  /** Big right-aligned "TOTAL PREMIUM" callout. */
  totalBox(label: string, amount: string, sub?: string) {
    const h = sub ? 46 : 34;
    this.ensureSpace(h + 8);
    const w = 220;
    const x = PAGE_W - MARGIN_X - w;
    this.page.drawRectangle({ x, y: this.y - h + 8, width: w, height: h, borderColor: this.accent, borderWidth: 1.2 });
    this.page.drawText(label.toUpperCase(), { x: x + 10, y: this.y - 8, size: 7, font: this.bold, color: MUTED });
    this.drawAligned(amount, x + 10, w - 20, this.y - 13, 15, this.bold, "right", this.accent);
    if (sub) this.page.drawText(sub, { x: x + 10, y: this.y - 32, size: 7, font: this.font, color: MUTED });
    this.y -= h + 10;
  }

  spacer(h = 8) {
    this.y -= h;
  }

  pageBreak() {
    this.newPage();
  }

  /** Signature line block for the bottom of the declarations page. */
  signature(name: string, title: string) {
    this.ensureSpace(46);
    this.y -= 16;
    this.page.drawText(name, { x: MARGIN_X, y: this.y + 4, size: 13, font: this.oblique, color: this.accent });
    this.page.drawLine({ start: { x: MARGIN_X, y: this.y }, end: { x: MARGIN_X + 180, y: this.y }, thickness: 0.6, color: INK });
    this.page.drawText(title, { x: MARGIN_X, y: this.y - 10, size: 7, font: this.font, color: MUTED });
    this.y -= 24;
  }

  async finish(): Promise<Uint8Array> {
    const pages = this.doc.getPages();
    pages.forEach((p, i) => {
      p.drawLine({ start: { x: MARGIN_X, y: FOOTER_H }, end: { x: PAGE_W - MARGIN_X, y: FOOTER_H }, thickness: 0.5, color: RULE });
      p.drawText(`${this.brand.formNumber}`, { x: MARGIN_X, y: FOOTER_H - 13, size: 7, font: this.font, color: MUTED });
      const pg = `Page ${i + 1} of ${pages.length}`;
      p.drawText(pg, {
        x: PAGE_W - MARGIN_X - this.font.widthOfTextAtSize(pg, 7),
        y: FOOTER_H - 13,
        size: 7,
        font: this.font,
        color: MUTED,
      });
      const spec = "SPECIMEN — Fictional sample document generated by Insura for demonstration. Not a real policy or carrier.";
      p.drawText(spec, {
        x: PAGE_W / 2 - this.oblique.widthOfTextAtSize(spec, 6.5) / 2,
        y: FOOTER_H - 26,
        size: 6.5,
        font: this.oblique,
        color: MUTED,
      });
    });
    return this.doc.save();
  }
}
