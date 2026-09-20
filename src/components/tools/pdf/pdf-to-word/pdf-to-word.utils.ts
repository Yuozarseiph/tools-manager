import {
  dataUrlToBytes,
  extractEmbeddedImages,
  parsePageRange,
} from "@/components/tools/pdf/pdf-to-image/pdf-image-utils";

export type PdfToWordMode = "editable" | "layout";
export type PdfToWordQuality = "fast" | "balanced" | "high";

export type PdfToWordProgressPhase =
  | "loading"
  | "analyzing"
  | "images"
  | "rendering"
  | "building"
  | "done";

export interface PdfToWordProgress {
  phase: PdfToWordProgressPhase;
  done: number;
  total: number;
  page?: number;
}

export interface PdfToWordOptions {
  mode: PdfToWordMode;
  pageRange: string;
  includeImages: boolean;
  quality: PdfToWordQuality;
  signal?: AbortSignal;
  onProgress?: (progress: PdfToWordProgress) => void;
}

export interface PdfInspection {
  pages: number;
  title?: string;
  author?: string;
}

export interface PdfToWordResult {
  blob: Blob;
  totalPages: number;
  convertedPages: number;
  textCharacters: number;
  embeddedImages: number;
  imageFallbackPages: number;
  mode: PdfToWordMode;
}

type PdfJsModule = any;
type PdfDocumentProxy = any;
type PdfPageProxy = any;

type TextFragment = {
  text: string;
  dir: "ltr" | "rtl";
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontName: string;
  fontFamily: string;
  hasEOL: boolean;
};

type TextLine = {
  items: TextFragment[];
  y: number;
  dir: "ltr" | "rtl";
  width: number;
  minX: number;
  maxX: number;
};

type EditablePage = {
  pageNumber: number;
  width: number;
  height: number;
  lines: TextLine[];
  textCharacters: number;
  renderedFallback?: RenderedPageImage;
};

type RenderedPageImage = {
  pageNumber: number;
  bytes: Uint8Array<ArrayBuffer>;
  width: number;
  height: number;
  type: "jpg";
};

const LIB_URL = "/pdfjs/pdf.min.js";
const WORKER_URL = "/pdfjs/pdf.worker.min.js";
const DEFAULT_FONT = "Arial";
const A4_CONTENT_MAX_WIDTH_PX = 720;
const A4_CONTENT_MAX_HEIGHT_PX = 1018;

type QualityPreset = {
  layoutScale: number;
  fallbackScale: number;
  pageJpegQuality: number;
  embeddedMaxWidth: number;
  embeddedMaxHeight: number;
  embeddedJpegQuality: number;
};

const QUALITY_PRESETS: Record<PdfToWordQuality, QualityPreset> = {
  fast: {
    layoutScale: 1.15,
    fallbackScale: 1.05,
    pageJpegQuality: 0.78,
    embeddedMaxWidth: 1100,
    embeddedMaxHeight: 1100,
    embeddedJpegQuality: 0.78,
  },
  balanced: {
    layoutScale: 1.7,
    fallbackScale: 1.45,
    pageJpegQuality: 0.9,
    embeddedMaxWidth: 1700,
    embeddedMaxHeight: 1700,
    embeddedJpegQuality: 0.9,
  },
  high: {
    layoutScale: 2.35,
    fallbackScale: 2,
    pageJpegQuality: 0.96,
    embeddedMaxWidth: 2600,
    embeddedMaxHeight: 2600,
    embeddedJpegQuality: 0.96,
  },
};

function getQualityPreset(quality: PdfToWordQuality): QualityPreset {
  return QUALITY_PRESETS[quality] ?? QUALITY_PRESETS.balanced;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    throw new DOMException("The operation was aborted.", "AbortError");
  }
}

function report(
  onProgress: PdfToWordOptions["onProgress"],
  phase: PdfToWordProgressPhase,
  done: number,
  total: number,
  page?: number,
) {
  onProgress?.({ phase, done, total, page });
}

async function loadPdfJs(): Promise<PdfJsModule> {
  const mod: any = await import(/* webpackIgnore: true */ LIB_URL);
  const pdfjs = mod.getDocument ? mod : mod.default;
  if (!pdfjs?.getDocument) {
    throw new Error("PDF.js could not be loaded.");
  }
  pdfjs.GlobalWorkerOptions.workerSrc = WORKER_URL;
  return pdfjs;
}

async function openPdf(file: File, signal?: AbortSignal) {
  throwIfAborted(signal);
  const pdfjs = await loadPdfJs();
  throwIfAborted(signal);
  const buffer = await file.arrayBuffer();
  throwIfAborted(signal);
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  throwIfAborted(signal);
  return { pdfjs, doc, loadingTask };
}

export async function inspectPdfFile(file: File): Promise<PdfInspection> {
  const { doc, loadingTask } = await openPdf(file);
  try {
    let title: string | undefined;
    let author: string | undefined;
    try {
      const metadata = await doc.getMetadata?.();
      title =
        metadata?.info?.Title ||
        metadata?.metadata?.get?.("dc:title") ||
        undefined;
      author =
        metadata?.info?.Author ||
        metadata?.metadata?.get?.("dc:creator") ||
        undefined;
    } catch {
      // Metadata is optional; page count is enough for the UI.
    }
    return { pages: doc.numPages, title, author };
  } finally {
    try {
      await loadingTask.destroy?.();
    } catch {}
  }
}

function isTextItem(item: any): boolean {
  return item && typeof item.str === "string" && Array.isArray(item.transform);
}

function normalizeFontFamily(input?: string): string {
  if (!input) return DEFAULT_FONT;
  const first = input
    .split(",")[0]
    ?.trim()
    .replace(/^['"]|['"]$/g, "");
  if (!first) return DEFAULT_FONT;
  return first.replace(/^[A-Z]{6}\+/, "").trim() || DEFAULT_FONT;
}

function normalizeFontName(input?: string): string {
  return (input || "").replace(/^[A-Z]{6}\+/, "");
}

function detectStrongRtl(text: string): boolean {
  return /[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/.test(text);
}

function fragmentFromPdfItem(
  item: any,
  styles: Record<string, any>,
): TextFragment {
  const t = item.transform as number[];
  const fontSize = Math.max(
    1,
    Math.hypot(Number(t?.[0]) || 0, Number(t?.[1]) || 0),
    Math.hypot(Number(t?.[2]) || 0, Number(t?.[3]) || 0),
    Number(item.height) || 0,
  );
  const style = styles?.[item.fontName] || {};
  const text = String(item.str ?? "");
  const dir = item.dir === "rtl" || detectStrongRtl(text) ? "rtl" : "ltr";

  return {
    text,
    dir,
    x: Number(t?.[4]) || 0,
    y: Number(t?.[5]) || 0,
    width: Math.abs(Number(item.width) || 0),
    height: Math.abs(Number(item.height) || fontSize),
    fontSize,
    fontName: normalizeFontName(item.fontName),
    fontFamily: normalizeFontFamily(style.fontFamily),
    hasEOL: Boolean(item.hasEOL),
  };
}

function lineDirection(items: TextFragment[]): "ltr" | "rtl" {
  let rtl = 0;
  let ltr = 0;
  for (const item of items) {
    const weight = Math.max(1, item.text.trim().length);
    if (item.dir === "rtl") rtl += weight;
    else ltr += weight;
  }
  return rtl > ltr ? "rtl" : "ltr";
}

function groupIntoLines(items: TextFragment[]): TextLine[] {
  const clean = items.filter((item) => item.text.length > 0);
  if (!clean.length) return [];

  const sorted = [...clean].sort((a, b) => {
    const yDiff = b.y - a.y;
    if (Math.abs(yDiff) > 0.5) return yDiff;
    return a.x - b.x;
  });

  const lines: TextFragment[][] = [];
  const lineYs: number[] = [];

  for (const item of sorted) {
    let best = -1;
    let bestDelta = Infinity;
    for (let i = 0; i < lines.length; i++) {
      const refFont = Math.max(
        item.fontSize,
        ...lines[i].slice(0, 3).map((x) => x.fontSize),
      );
      const tolerance = Math.max(2.2, Math.min(6, refFont * 0.32));
      const delta = Math.abs(lineYs[i] - item.y);
      if (delta <= tolerance && delta < bestDelta) {
        best = i;
        bestDelta = delta;
      }
    }

    if (best === -1) {
      lines.push([item]);
      lineYs.push(item.y);
    } else {
      lines[best].push(item);
      lineYs[best] =
        lines[best].reduce((sum, x) => sum + x.y, 0) / lines[best].length;
    }
  }

  return lines
    .map((lineItems, index) => {
      const dir = lineDirection(lineItems);
      const ordered = [...lineItems].sort((a, b) =>
        dir === "rtl" ? b.x - a.x : a.x - b.x,
      );
      const minX = Math.min(...ordered.map((x) => x.x));
      const maxX = Math.max(...ordered.map((x) => x.x + x.width));
      return {
        items: ordered,
        y: lineYs[index],
        dir,
        minX,
        maxX,
        width: Math.max(0, maxX - minX),
      };
    })
    .sort((a, b) => b.y - a.y);
}

function shouldInsertSpace(
  current: TextFragment,
  next: TextFragment,
  dir: "ltr" | "rtl",
): boolean {
  if (!current.text || !next.text) return false;
  if (/\s$/.test(current.text) || /^\s/.test(next.text)) return false;

  const noSpaceBefore = /^[,.;:!?،؛؟)\]\}٪%]/.test(next.text);
  const noSpaceAfter = /[(\[\{]$/.test(current.text);
  if (noSpaceBefore || noSpaceAfter) return false;

  const font = Math.max(4, Math.min(current.fontSize, next.fontSize));
  const gap =
    dir === "rtl"
      ? current.x - (next.x + next.width)
      : next.x - (current.x + current.width);

  return gap > font * 0.15;
}

function inferAlignment(line: TextLine, pageWidth: number) {
  const center = (line.minX + line.maxX) / 2;
  const centered =
    line.width < pageWidth * 0.78 &&
    Math.abs(center - pageWidth / 2) < pageWidth * 0.06;
  if (centered) return "center" as const;
  return line.dir === "rtl" ? ("right" as const) : ("left" as const);
}

function runFontSizeHalfPoints(fontSize: number): number {
  const points = Math.max(7, Math.min(30, fontSize));
  return Math.round(points * 2);
}

function fontLooksBold(fontName: string, fontFamily: string): boolean {
  return /(bold|black|heavy|semibold|demi)/i.test(`${fontName} ${fontFamily}`);
}

function fontLooksItalic(fontName: string, fontFamily: string): boolean {
  return /(italic|oblique)/i.test(`${fontName} ${fontFamily}`);
}

async function renderPageToImage(
  page: PdfPageProxy,
  pageNumber: number,
  signal?: AbortSignal,
  scale = 1.7,
  jpegQuality = 0.9,
): Promise<RenderedPageImage> {
  throwIfAborted(signal);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, viewport }).promise;
  throwIfAborted(signal);

  const width = canvas.width;
  const height = canvas.height;
  const dataUrl = canvas.toDataURL("image/jpeg", jpegQuality);
  const bytes = dataUrlToBytes(dataUrl);

  // Release the backing pixel buffer as soon as the encoded bytes exist.
  canvas.width = 1;
  canvas.height = 1;

  return {
    pageNumber,
    bytes,
    width,
    height,
    type: "jpg",
  };
}

function fitImage(
  width: number,
  height: number,
  maxWidth = A4_CONTENT_MAX_WIDTH_PX,
  maxHeight = A4_CONTENT_MAX_HEIGHT_PX,
) {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function encodeCanvasForDocx(
  source: HTMLCanvasElement,
  preset: QualityPreset,
): { data: Uint8Array<ArrayBuffer>; width: number; height: number } {
  const ratio = Math.min(
    preset.embeddedMaxWidth / source.width,
    preset.embeddedMaxHeight / source.height,
    1,
  );
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);

  const dataUrl = canvas.toDataURL("image/jpeg", preset.embeddedJpegQuality);
  const data = dataUrlToBytes(dataUrl);
  canvas.width = 1;
  canvas.height = 1;
  return { data, width, height };
}

async function buildLayoutMode(
  doc: PdfDocumentProxy,
  pages: number[],
  options: PdfToWordOptions,
): Promise<{ images: RenderedPageImage[]; textCharacters: number }> {
  const out: RenderedPageImage[] = [];
  const preset = getQualityPreset(options.quality);
  for (let i = 0; i < pages.length; i++) {
    throwIfAborted(options.signal);
    const pageNumber = pages[i];
    report(options.onProgress, "rendering", i, pages.length, pageNumber);
    const page = await doc.getPage(pageNumber);
    try {
      out.push(
        await renderPageToImage(
          page,
          pageNumber,
          options.signal,
          preset.layoutScale,
          preset.pageJpegQuality,
        ),
      );
    } finally {
      page.cleanup?.();
    }
    report(options.onProgress, "rendering", i + 1, pages.length, pageNumber);
  }
  return { images: out, textCharacters: 0 };
}

async function buildEditableMode(
  pdfjs: PdfJsModule,
  doc: PdfDocumentProxy,
  pages: number[],
  options: PdfToWordOptions,
) {
  const pageModels: EditablePage[] = [];
  const preset = getQualityPreset(options.quality);
  let textCharacters = 0;
  let fallbackPages = 0;

  for (let i = 0; i < pages.length; i++) {
    throwIfAborted(options.signal);
    const pageNumber = pages[i];
    report(options.onProgress, "analyzing", i, pages.length, pageNumber);
    const page = await doc.getPage(pageNumber);
    try {
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent({
        disableNormalization: false,
      });
      const fragments = (textContent.items || [])
        .filter(isTextItem)
        .map((item: any) =>
          fragmentFromPdfItem(item, textContent.styles || {}),
        );
      const chars = fragments.reduce(
        (sum: number, item: TextFragment) => sum + item.text.trim().length,
        0,
      );
      textCharacters += chars;

      const model: EditablePage = {
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        lines: groupIntoLines(fragments),
        textCharacters: chars,
      };

      if (chars === 0) {
        model.renderedFallback = await renderPageToImage(
          page,
          pageNumber,
          options.signal,
          preset.fallbackScale,
          preset.pageJpegQuality,
        );
        fallbackPages += 1;
      }
      pageModels.push(model);
    } finally {
      page.cleanup?.();
    }
    report(options.onProgress, "analyzing", i + 1, pages.length, pageNumber);
  }

  const imagesByPage = new Map<number, HTMLCanvasElement[]>();
  let embeddedImageCount = 0;

  if (options.includeImages) {
    report(options.onProgress, "images", 0, pages.length);
    const extracted = await extractEmbeddedImages(pdfjs, doc, {
      pageList: pages,
      minSize: 32,
      dedupe: false,
      onProgress: (done, total) => {
        throwIfAborted(options.signal);
        report(options.onProgress, "images", done, total);
      },
    });
    throwIfAborted(options.signal);
    for (const item of extracted) {
      if (
        pageModels.find((p) => p.pageNumber === item.pageIndex)
          ?.renderedFallback
      ) {
        continue;
      }
      const list = imagesByPage.get(item.pageIndex) || [];
      list.push(item.canvas);
      imagesByPage.set(item.pageIndex, list);
      embeddedImageCount += 1;
    }
  }

  return {
    pageModels,
    textCharacters,
    fallbackPages,
    imagesByPage,
    embeddedImageCount,
  };
}

export async function convertPdfToWord(
  file: File,
  options: PdfToWordOptions,
): Promise<PdfToWordResult> {
  throwIfAborted(options.signal);
  report(options.onProgress, "loading", 0, 1);

  const { pdfjs, doc, loadingTask } = await openPdf(file, options.signal);
  try {
    report(options.onProgress, "loading", 1, 1);
    const pages = parsePageRange(options.pageRange, doc.numPages);
    if (!pages.length) {
      throw new Error("INVALID_PAGE_RANGE");
    }

    const docx = await import("docx");
    throwIfAborted(options.signal);

    const {
      AlignmentType,
      Document,
      ImageRun,
      PageBreak,
      Packer,
      Paragraph,
      TextRun,
    } = docx;

    const children: any[] = [];
    let textCharacters = 0;
    let embeddedImages = 0;
    let imageFallbackPages = 0;

    if (options.mode === "layout") {
      const built = await buildLayoutMode(doc, pages, options);
      textCharacters = built.textCharacters;
      for (let i = 0; i < built.images.length; i++) {
        throwIfAborted(options.signal);
        if (i > 0)
          children.push(new Paragraph({ children: [new PageBreak()] }));
        const img = built.images[i];
        const fitted = fitImage(img.width, img.height, 720, 1018);
        children.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [
              new ImageRun({
                data: img.bytes,
                type: img.type,
                transformation: fitted,
              }),
            ],
          }),
        );
      }
      imageFallbackPages = built.images.length;
    } else {
      const built = await buildEditableMode(pdfjs, doc, pages, options);
      textCharacters = built.textCharacters;
      embeddedImages = built.embeddedImageCount;
      imageFallbackPages = built.fallbackPages;

      for (
        let pageIndex = 0;
        pageIndex < built.pageModels.length;
        pageIndex++
      ) {
        throwIfAborted(options.signal);
        const pageModel = built.pageModels[pageIndex];
        if (pageIndex > 0)
          children.push(new Paragraph({ children: [new PageBreak()] }));

        if (pageModel.renderedFallback) {
          const fallback = pageModel.renderedFallback;
          const fitted = fitImage(fallback.width, fallback.height);
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 0, after: 0 },
              children: [
                new ImageRun({
                  data: fallback.bytes,
                  type: fallback.type,
                  transformation: fitted,
                }),
              ],
            }),
          );
          continue;
        }

        for (const line of pageModel.lines) {
          const runs: any[] = [];
          for (let i = 0; i < line.items.length; i++) {
            const item = line.items[i];
            const next = line.items[i + 1];
            runs.push(
              new TextRun({
                text: item.text,
                font: item.fontFamily || DEFAULT_FONT,
                size: runFontSizeHalfPoints(item.fontSize),
                bold: fontLooksBold(item.fontName, item.fontFamily),
                italics: fontLooksItalic(item.fontName, item.fontFamily),
                rightToLeft: item.dir === "rtl",
              }),
            );
            if (next && shouldInsertSpace(item, next, line.dir)) {
              runs.push(
                new TextRun({
                  text: " ",
                  font: item.fontFamily || DEFAULT_FONT,
                  size: runFontSizeHalfPoints(item.fontSize),
                  rightToLeft: line.dir === "rtl",
                }),
              );
            }
          }

          const alignment = inferAlignment(line, pageModel.width);
          children.push(
            new Paragraph({
              children: runs,
              bidirectional: line.dir === "rtl",
              alignment:
                alignment === "center"
                  ? AlignmentType.CENTER
                  : alignment === "right"
                    ? AlignmentType.RIGHT
                    : AlignmentType.LEFT,
              spacing: { before: 0, after: 0 },
              wordWrap: true,
            }),
          );
        }

        const embedded = built.imagesByPage.get(pageModel.pageNumber) || [];
        for (const canvas of embedded) {
          throwIfAborted(options.signal);
          const encoded = encodeCanvasForDocx(
            canvas,
            getQualityPreset(options.quality),
          );
          const fitted = fitImage(encoded.width, encoded.height, 560, 720);
          children.push(
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 80, after: 80 },
              children: [
                new ImageRun({
                  data: encoded.data,
                  type: "jpg",
                  transformation: fitted,
                }),
              ],
            }),
          );
          canvas.width = 1;
          canvas.height = 1;
        }

        if (!pageModel.lines.length && !embedded.length) {
          children.push(new Paragraph({ text: "" }));
        }
      }
    }

    throwIfAborted(options.signal);
    report(options.onProgress, "building", 0, 1);

    const wordDocument = new Document({
      creator: "QodeForge",
      title: file.name.replace(/\.pdf$/i, ""),
      description: "Converted from PDF to DOCX locally in the browser.",
      sections: [
        {
          properties: {
            page: {
              margin:
                options.mode === "layout"
                  ? { top: "5mm", right: "5mm", bottom: "5mm", left: "5mm" }
                  : {
                      top: "12mm",
                      right: "12mm",
                      bottom: "12mm",
                      left: "12mm",
                    },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(wordDocument);
    throwIfAborted(options.signal);
    report(options.onProgress, "building", 1, 1);
    report(options.onProgress, "done", 1, 1);

    return {
      blob,
      totalPages: doc.numPages,
      convertedPages: pages.length,
      textCharacters,
      embeddedImages,
      imageFallbackPages,
      mode: options.mode,
    };
  } finally {
    try {
      await loadingTask.destroy?.();
    } catch {}
  }
}

