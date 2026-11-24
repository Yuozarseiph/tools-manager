/**
 * Shared utilities for the PDF → Image tool:
 *  - page-range parsing (supports Persian digits)
 *  - embedded image extraction via the pdf.js operator list
 *  - pixel-level filters / crop / transform pipeline (no ctx.filter → works in Safari)
 *  - dependency-free ZIP builder (STORE method + CRC32) for "Download all (ZIP)"
 */

export type OutFormat = "png" | "jpeg" | "webp";

export const MIME: Record<OutFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export const EXT: Record<OutFormat, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ToolImage {
  id: string;
  dataUrl: string;
  width: number;
  height: number;
  pageIndex: number;
  source: "page" | "embedded";
  /** used inside ZIP / file names, e.g. "page-2" or "img-3-page-2" */
  fileLabel: string;
  /** localized label shown in the UI */
  displayLabel: string;
}

export interface FilterSettings {
  brightness: number; // 1 = neutral
  contrast: number; // 1 = neutral
  saturate: number; // 1 = neutral
  grayscale: number; // 0..1
  sepia: number; // 0..1
  invert: number; // 0..1
}

export const DEFAULT_FILTERS: FilterSettings = {
  brightness: 1,
  contrast: 1,
  saturate: 1,
  grayscale: 0,
  sepia: 0,
  invert: 0,
};

/** Safety cap so a single huge embedded image can't OOM the tab. */
const MAX_EXTRACT_PIXELS = 32_000_000;

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/* ------------------------------------------------------------------ */
/* Page range                                                          */
/* ------------------------------------------------------------------ */

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";

function normalizeDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

/** Parses "1-3,5,8-10" (empty = every page). Always sorted + unique. */
export function parsePageRange(input: string, total: number): number[] {
  const trimmed = normalizeDigits(input).trim();
  if (!trimmed) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>();
  for (const raw of trimmed.split(",")) {
    const part = raw.trim();
    if (!part) continue;
    const range = part.match(/^(\d+)?\s*-\s*(\d+)?$/);
    if (range) {
      const start = range[1] ? parseInt(range[1], 10) : 1;
      const end = range[2] ? parseInt(range[2], 10) : total;
      const lo = Math.max(1, Math.min(start, end));
      const hi = Math.min(total, Math.max(start, end));
      for (let i = lo; i <= hi; i++) pages.add(i);
    } else if (/^\d+$/.test(part)) {
      const n = parseInt(part, 10);
      if (n >= 1 && n <= total) pages.add(n);
    }
  }
  return [...pages].sort((a, b) => a - b);
}

/* ------------------------------------------------------------------ */
/* Image pipeline (filters / crop / transforms)                        */
/* ------------------------------------------------------------------ */

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

export function isDefaultFilters(f: FilterSettings): boolean {
  return (
    f.brightness === 1 &&
    f.contrast === 1 &&
    f.saturate === 1 &&
    f.grayscale === 0 &&
    f.sepia === 0 &&
    f.invert === 0
  );
}

/** CSS filter string for the live (cheap) preview in the editor. */
export function filtersToCss(f: FilterSettings): string {
  const parts: string[] = [];
  if (f.brightness !== 1) parts.push(`brightness(${f.brightness})`);
  if (f.contrast !== 1) parts.push(`contrast(${f.contrast})`);
  if (f.saturate !== 1) parts.push(`saturate(${f.saturate})`);
  if (f.grayscale > 0) parts.push(`grayscale(${f.grayscale})`);
  if (f.sepia > 0) parts.push(`sepia(${f.sepia})`);
  if (f.invert > 0) parts.push(`invert(${f.invert})`);
  return parts.length ? parts.join(" ") : "none";
}

/** Pixel-level filter application — identical result in every browser. */
export function applyPixelFilters(
  imageData: ImageData,
  f: FilterSettings,
): void {
  const d = imageData.data;
  const {
    brightness: br,
    contrast: co,
    saturate: sa,
    grayscale: gr,
    sepia: se,
    invert: inv,
  } = f;
  const intercept = 128 * (1 - co);
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    if (br !== 1) {
      r *= br;
      g *= br;
      b *= br;
    }
    if (co !== 1) {
      r = r * co + intercept;
      g = g * co + intercept;
      b = b * co + intercept;
    }
    let gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (sa !== 1) {
      r = gray + (r - gray) * sa;
      g = gray + (g - gray) * sa;
      b = gray + (b - gray) * sa;
    }
    if (se > 0) {
      const sr = 0.393 * r + 0.769 * g + 0.189 * b;
      const sg = 0.349 * r + 0.686 * g + 0.168 * b;
      const sb = 0.272 * r + 0.534 * g + 0.131 * b;
      r += (sr - r) * se;
      g += (sg - g) * se;
      b += (sb - b) * se;
    }
    if (gr > 0) {
      gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r += (gray - r) * gr;
      g += (gray - g) * gr;
      b += (gray - b) * gr;
    }
    if (inv > 0) {
      r += (255 - 2 * r) * inv;
      g += (255 - 2 * g) * inv;
      b += (255 - 2 * b) * inv;
    }
    d[i] = r < 0 ? 0 : r > 255 ? 255 : r;
    d[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    d[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
  }
}

export interface ProcessOptions {
  crop: Rect | null; // null → keep the whole image
  filters: FilterSettings;
  format: OutFormat;
  quality: number;
}

export async function processImage(
  src: string,
  opts: ProcessOptions,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("canvas 2d context unavailable");
  // JPEG has no alpha channel — paint white first.
  if (opts.format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  if (!isDefaultFilters(opts.filters)) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    applyPixelFilters(imageData, opts.filters);
    ctx.putImageData(imageData, 0, 0);
  }

  let out = canvas;
  const c = opts.crop;
  const isFull =
    !c ||
    (c.x <= 0 &&
      c.y <= 0 &&
      c.w >= canvas.width - 0.5 &&
      c.h >= canvas.height - 0.5);
  if (!isFull && c) {
    const cx = Math.max(0, Math.round(c.x));
    const cy = Math.max(0, Math.round(c.y));
    const cw = Math.max(1, Math.min(Math.round(c.w), canvas.width - cx));
    const ch = Math.max(1, Math.min(Math.round(c.h), canvas.height - cy));
    out = document.createElement("canvas");
    out.width = cw;
    out.height = ch;
    const octx = out.getContext("2d");
    if (!octx) throw new Error("canvas 2d context unavailable");
    octx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
  }

  const dataUrl = out.toDataURL(
    MIME[opts.format],
    opts.format === "png" ? undefined : opts.quality,
  );
  return { dataUrl, width: out.width, height: out.height };
}

export type TransformOp = "rotate-left" | "rotate-right" | "flip-h" | "flip-v";

/** Lossless (PNG) intermediate transform — committed immediately in the editor. */
export async function transformImage(
  src: string,
  op: TransformOp,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(src);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const swap = op === "rotate-left" || op === "rotate-right";
  const canvas = document.createElement("canvas");
  canvas.width = swap ? h : w;
  canvas.height = swap ? w : h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2d context unavailable");
  ctx.save();
  if (op === "rotate-right") {
    ctx.translate(canvas.width, 0);
    ctx.rotate(Math.PI / 2);
  } else if (op === "rotate-left") {
    ctx.translate(0, canvas.height);
    ctx.rotate(-Math.PI / 2);
  } else if (op === "flip-h") {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }
  ctx.drawImage(img, 0, 0);
  ctx.restore();
  return {
    dataUrl: canvas.toDataURL("image/png"),
    width: canvas.width,
    height: canvas.height,
  };
}

/* ------------------------------------------------------------------ */
/* Dependency-free ZIP (STORE method)                                  */
/* ------------------------------------------------------------------ */

export function dataUrlToBytes(dataUrl: string): Uint8Array<ArrayBuffer> {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export function buildZip(
  entries: { name: string; data: Uint8Array<ArrayBuffer> }[],
): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array<ArrayBuffer>[] = [];
  const centralParts: Uint8Array<ArrayBuffer>[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = encoder.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new DataView(new ArrayBuffer(30 + nameBytes.length));
    local.setUint32(0, 0x04034b50, true); // local file header signature
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // flags: UTF-8 names
    local.setUint16(8, 0, true); // method: store
    local.setUint16(10, 0, true); // mod time
    local.setUint16(12, 0, true); // mod date
    local.setUint32(14, crc, true);
    local.setUint32(18, size, true); // compressed size
    local.setUint32(22, size, true); // uncompressed size
    local.setUint16(26, nameBytes.length, true);
    local.setUint16(28, 0, true); // extra field length
    new Uint8Array(local.buffer).set(nameBytes, 30);
    localParts.push(new Uint8Array(local.buffer), entry.data);

    const central = new DataView(new ArrayBuffer(46 + nameBytes.length));
    central.setUint32(0, 0x02014b50, true); // central directory signature
    central.setUint16(4, 20, true); // version made by
    central.setUint16(6, 20, true); // version needed
    central.setUint16(8, 0x0800, true);
    central.setUint16(10, 0, true);
    central.setUint16(12, 0, true);
    central.setUint16(14, 0, true);
    central.setUint32(16, crc, true);
    central.setUint32(20, size, true);
    central.setUint32(24, size, true);
    central.setUint16(28, nameBytes.length, true);
    central.setUint16(30, 0, true);
    central.setUint16(32, 0, true);
    central.setUint16(34, 0, true);
    central.setUint16(36, 0, true);
    central.setUint32(38, 0, true);
    central.setUint32(42, offset, true); // local header offset
    new Uint8Array(central.buffer).set(nameBytes, 46);
    centralParts.push(new Uint8Array(central.buffer));

    offset += 30 + nameBytes.length + size;
  }

  const centralSize = centralParts.reduce((sum, p) => sum + p.length, 0);
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true); // end of central directory
  eocd.setUint16(4, 0, true);
  eocd.setUint16(6, 0, true);
  eocd.setUint16(8, entries.length, true);
  eocd.setUint16(10, entries.length, true);
  eocd.setUint32(12, centralSize, true);
  eocd.setUint32(16, offset, true);
  eocd.setUint16(20, 0, true);

  return new Blob(
    [...localParts, ...centralParts, new Uint8Array(eocd.buffer)],
    {
      type: "application/zip",
    },
  );
}

/* ------------------------------------------------------------------ */
/* Embedded image extraction (pdf.js operator list)                    */
/* ------------------------------------------------------------------ */

export interface ExtractOptions {
  pageList: number[];
  minSize: number;
  dedupe: boolean;
  onProgress: (done: number, total: number) => void;
}

export interface ExtractedImage {
  pageIndex: number;
  canvas: HTMLCanvasElement;
}

export async function extractEmbeddedImages(
  pdfjs: any,
  doc: any,
  opts: ExtractOptions,
): Promise<ExtractedImage[]> {
  const OPS = pdfjs.OPS;
  const out: ExtractedImage[] = [];
  const seen = new Set<string>();
  const total = opts.pageList.length;
  let done = 0;

  for (const pageNum of opts.pageList) {
    const page = await doc.getPage(pageNum);
    try {
      const opList = await page.getOperatorList();
      const paintFns = new Set<number>([OPS.paintImageXObject]);
      if (OPS.paintJpegXObject != null) paintFns.add(OPS.paintJpegXObject);

      for (let i = 0; i < opList.fnArray.length; i++) {
        const fn = opList.fnArray[i];
        try {
          if (paintFns.has(fn)) {
            const name = opList.argsArray[i][0];
            if (typeof name !== "string") continue;
            const obj = await getPageObject(page, name);
            pushCanvas(obj, pageNum);
          } else if (fn === OPS.paintInlineImageXObject) {
            pushCanvas(opList.argsArray[i][0], pageNum);
          }
        } catch {
          /* skip objects that cannot be resolved */
        }
      }
    } finally {
      page.cleanup?.();
      done += 1;
      opts.onProgress(done, total);
    }
  }

  return out;

  function pushCanvas(imgObj: any, pageNum: number): void {
    const canvas = imageObjectToCanvas(imgObj);
    if (!canvas) return;
    if (
      opts.minSize > 0 &&
      (canvas.width < opts.minSize || canvas.height < opts.minSize)
    )
      return;
    if (opts.dedupe) {
      const hash = hashCanvas(canvas);
      if (seen.has(hash)) return;
      seen.add(hash);
    }
    out.push({ pageIndex: pageNum, canvas });
  }
}

function getPageObject(page: any, name: string): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const objs = page.objs;
      if (!objs) {
        reject(new Error("page objects unavailable"));
        return;
      }
      if (typeof objs.has === "function" && objs.has(name)) {
        resolve(objs.get(name));
        return;
      }
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error("image object timeout"));
        }
      }, 8000);
      objs.get(name, (obj: any) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(obj);
        }
      });
    } catch (e) {
      reject(e as Error);
    }
  });
}

/** Converts a pdf.js internal image object into a canvas (handles all ImageKind values). */
function imageObjectToCanvas(img: any): HTMLCanvasElement | null {
  if (!img) return null;

  // pdf.js v4+ may hand us a ready bitmap when OffscreenCanvas is supported.
  if (img.bitmap) {
    const w = img.bitmap.width;
    const h = img.bitmap.height;
    if (!w || !h || w * h > MAX_EXTRACT_PIXELS) return null;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img.bitmap, 0, 0);
    return canvas;
  }

  const w = img.width;
  const h = img.height;
  const data = img.data;
  if (!w || !h || !data || w * h > MAX_EXTRACT_PIXELS) return null;

  let rgba: Uint8ClampedArray;
  const kind = img.kind;
  if (kind === 3 || data.length === w * h * 4) {
    // RGBA_32BPP
    rgba =
      data instanceof Uint8ClampedArray ? data : new Uint8ClampedArray(data);
  } else if (kind === 2 || data.length === w * h * 3) {
    // RGB_24BPP → add opaque alpha
    rgba = new Uint8ClampedArray(w * h * 4);
    for (let i = 0, j = 0; i + 2 < data.length; i += 3, j += 4) {
      rgba[j] = data[i];
      rgba[j + 1] = data[i + 1];
      rgba[j + 2] = data[i + 2];
      rgba[j + 3] = 255;
    }
  } else if (kind === 1) {
    // GRAYSCALE_1BPP — bit-packed, 1 = white
    rgba = new Uint8ClampedArray(w * h * 4);
    const rowBytes = Math.ceil(w / 8);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const byte = data[y * rowBytes + (x >> 3)];
        const v = (byte >> (7 - (x & 7))) & 1 ? 255 : 0;
        const j = (y * w + x) * 4;
        rgba[j] = v;
        rgba[j + 1] = v;
        rgba[j + 2] = v;
        rgba[j + 3] = 255;
      }
    }
  } else {
    return null;
  }

  if (rgba.length !== w * h * 4) return null;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  // createImageData + set() sidesteps the TS 5.7+ ImageDataArray generic
  // constraint (it rejects Uint8ClampedArray<ArrayBufferLike>).
  const imageData = ctx.createImageData(w, h);
  imageData.data.set(rgba);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/** Cheap perceptual hash: downscale to 32×32 + FNV-1a over quantized pixels. */
function hashCanvas(src: HTMLCanvasElement): string {
  const S = 32;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return `${src.width}x${src.height}`;
  ctx.drawImage(src, 0, 0, S, S);
  const d = ctx.getImageData(0, 0, S, S).data;
  let hash = 0x811c9dc5;
  for (let i = 0; i < d.length; i += 4) {
    hash ^= (d[i] >> 2) | ((d[i + 1] >> 2) << 8) | ((d[i + 2] >> 2) << 16);
    hash = Math.imul(hash, 0x01000193);
  }
  return `${src.width}x${src.height}:${hash >>> 0}`;
}
