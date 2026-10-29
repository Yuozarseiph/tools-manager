"use client";
import { saveFile } from "@/lib/file-export";
import { outputFilename } from "@/lib/output-name";
import { AccessibleInput, AccessibleTextarea } from "@/components/ui/AccessibleControls";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ClipboardPaste,
  Copy,
  Download,
  FileImage,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { startActivity } from "@/lib/transfer";
import { prepareOcrResources } from "@/lib/ocr-resources";
import { useImageToTextContent } from "./image-to-text.content";

type OcrLanguage = "fa" | "en" | "faEn";
type OcrQuality = "fast" | "balanced" | "accurate";
type OcrMode = "auto" | "document" | "stylized";

type OcrWorker = {
  recognize: (
    image: string | File | Blob | HTMLCanvasElement,
    options?: Record<string, unknown>,
  ) => Promise<{ data: { text?: string; confidence?: number } }>;
  setParameters: (params: Record<string, string>) => Promise<{ data: { text?: string; confidence?: number } }>;
  terminate: () => Promise<{ data: { text?: string; confidence?: number } }>;
};

type OcrCandidate = {
  text: string;
  confidence: number;
  score: number;
  regionOrder?: number;
  regionCandidate?: boolean;
};

type PreparedVariant = {
  name: string;
  canvas: HTMLCanvasElement;
};

type PsmValue = string | number;

type PsmMap = {
  AUTO?: PsmValue;
  SPARSE_TEXT?: PsmValue;
  SINGLE_BLOCK?: PsmValue;
  SINGLE_LINE?: PsmValue;
};

type OcrTask = {
  canvas: HTMLCanvasElement;
  psm: PsmValue;
  label: string;
  regionOrder?: number;
  regionCandidate?: boolean;
};

const OCR_LANG: Record<OcrLanguage, string | string[]> = {
  fa: "fas",
  en: "eng",
  faEn: ["fas", "eng"],
};

const MAX_PREPROCESS_PIXELS = 14_000_000;
const MIN_TARGET_WIDTH = 1800;
const WHITE_BORDER = 28;

function isSupportedImage(file: File) {
  return (
    ["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    /\.(jpe?g|png|webp)$/i.test(file.name)
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function loadImageBitmapSafe(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fallback below for browsers/files where createImageBitmap fails.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Unable to load image."));
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function closeBitmap(source: ImageBitmap | HTMLImageElement) {
  if ("close" in source && typeof source.close === "function") {
    source.close();
  }
}

function getImageSize(source: ImageBitmap | HTMLImageElement) {
  if (source instanceof HTMLImageElement) {
    return {
      width: source.naturalWidth || source.width,
      height: source.naturalHeight || source.height,
    };
  }

  return { width: source.width, height: source.height };
}

function buildBaseCanvas(
  source: ImageBitmap | HTMLImageElement,
  quality: OcrQuality,
): HTMLCanvasElement {
  const { width: sourceWidth, height: sourceHeight } = getImageSize(source);

  let scale = 1;
  if (quality !== "fast" && sourceWidth < MIN_TARGET_WIDTH) {
    scale = MIN_TARGET_WIDTH / Math.max(1, sourceWidth);
  }
  if (quality === "accurate") scale = Math.max(scale, 1.35);
  scale = clamp(scale, 1, quality === "accurate" ? 3 : 2.3);

  const maxScaleByPixels = Math.sqrt(
    MAX_PREPROCESS_PIXELS / Math.max(1, sourceWidth * sourceHeight),
  );
  scale = Math.min(scale, Math.max(1, maxScaleByPixels));

  const drawWidth = Math.max(1, Math.round(sourceWidth * scale));
  const drawHeight = Math.max(1, Math.round(sourceHeight * scale));
  const border = quality === "fast" ? 12 : WHITE_BORDER;

  const canvas = document.createElement("canvas");
  canvas.width = drawWidth + border * 2;
  canvas.height = drawHeight + border * 2;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is not available.");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, border, border, drawWidth, drawHeight);

  return canvas;
}

function enhanceGrayscale(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is not available.");
  ctx.drawImage(source, 0, 0);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  // Contrast stretch based on luminance percentiles. This is much safer for
  // Persian anti-aliased glyphs than a hard threshold as the only pass.
  const histogram = new Uint32Array(256);
  for (let i = 0; i < data.length; i += 4) {
    const y = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    histogram[y] += 1;
  }

  const total = canvas.width * canvas.height;
  const lowTarget = total * 0.01;
  const highTarget = total * 0.99;
  let sum = 0;
  let low = 0;
  let high = 255;

  for (let i = 0; i < 256; i++) {
    sum += histogram[i];
    if (sum >= lowTarget) {
      low = i;
      break;
    }
  }

  sum = 0;
  for (let i = 0; i < 256; i++) {
    sum += histogram[i];
    if (sum >= highTarget) {
      high = i;
      break;
    }
  }

  const range = Math.max(18, high - low);
  for (let i = 0; i < data.length; i += 4) {
    const y = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    let v = ((y - low) * 255) / range;
    v = clamp(v, 0, 255);
    // Slightly deepen dark strokes while preserving anti-aliasing.
    v = 255 * Math.pow(v / 255, 0.9);
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function otsuThreshold(gray: Uint8ClampedArray) {
  const hist = new Uint32Array(256);
  for (let i = 0; i < gray.length; i += 4) hist[gray[i]] += 1;

  const total = gray.length / 4;
  let weightedSum = 0;
  for (let i = 0; i < 256; i++) weightedSum += i * hist[i];

  let backgroundWeight = 0;
  let backgroundSum = 0;
  let bestVariance = -1;
  let threshold = 160;

  for (let i = 0; i < 256; i++) {
    backgroundWeight += hist[i];
    if (backgroundWeight === 0) continue;

    const foregroundWeight = total - backgroundWeight;
    if (foregroundWeight === 0) break;

    backgroundSum += i * hist[i];
    const meanBg = backgroundSum / backgroundWeight;
    const meanFg = (weightedSum - backgroundSum) / foregroundWeight;
    const between = backgroundWeight * foregroundWeight * (meanBg - meanFg) ** 2;

    if (between > bestVariance) {
      bestVariance = between;
      threshold = i;
    }
  }

  return threshold;
}

function makeBinaryVariant(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is not available.");
  ctx.drawImage(source, 0, 0);

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const threshold = otsuThreshold(image.data);

  for (let i = 0; i < image.data.length; i += 4) {
    const value = image.data[i] <= threshold ? 0 : 255;
    image.data[i] = value;
    image.data[i + 1] = value;
    image.data[i + 2] = value;
    image.data[i + 3] = 255;
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function cloneCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is not available.");
  ctx.drawImage(source, 0, 0);
  return canvas;
}

function invertCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = cloneCanvas(source);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is not available.");
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < image.data.length; i += 4) {
    image.data[i] = 255 - image.data[i];
    image.data[i + 1] = 255 - image.data[i + 1];
    image.data[i + 2] = 255 - image.data[i + 2];
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

function sharpenCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const canvas = cloneCanvas(source);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is not available.");

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const src = new Uint8ClampedArray(image.data);
  const dst = image.data;
  const w = canvas.width;
  const h = canvas.height;

  // Lightweight 3x3 unsharp kernel. Skip the outer pixel ring.
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const center = src[idx + c] * 5;
        const left = src[idx - 4 + c];
        const right = src[idx + 4 + c];
        const up = src[idx - w * 4 + c];
        const down = src[idx + w * 4 + c];
        dst[idx + c] = clamp(center - left - right - up - down, 0, 255);
      }
      dst[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function makeAdaptiveVariant(source: HTMLCanvasElement, inverted = false): HTMLCanvasElement {
  const canvas = cloneCanvas(source);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is not available.");

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  const w = canvas.width;
  const h = canvas.height;
  const gray = new Uint8Array(w * h);
  const integral = new Float64Array((w + 1) * (h + 1));

  for (let y = 0; y < h; y++) {
    let rowSum = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const g = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
      gray[y * w + x] = g;
      rowSum += g;
      integral[(y + 1) * (w + 1) + (x + 1)] = integral[y * (w + 1) + (x + 1)] + rowSum;
    }
  }

  const radius = Math.max(10, Math.round(Math.min(w, h) * 0.018));
  const bias = 13;
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - radius);
    const y1 = Math.min(h - 1, y + radius);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - radius);
      const x1 = Math.min(w - 1, x + radius);
      const A = integral[y0 * (w + 1) + x0];
      const B = integral[y0 * (w + 1) + (x1 + 1)];
      const C = integral[(y1 + 1) * (w + 1) + x0];
      const D = integral[(y1 + 1) * (w + 1) + (x1 + 1)];
      const count = (x1 - x0 + 1) * (y1 - y0 + 1);
      const mean = (D - B - C + A) / Math.max(1, count);
      const darkInk = gray[y * w + x] < mean - bias;
      const value = inverted ? (darkInk ? 255 : 0) : (darkInk ? 0 : 255);
      const i = (y * w + x) * 4;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

function cropCanvas(
  source: HTMLCanvasElement,
  y: number,
  height: number,
): HTMLCanvasElement {
  const padY = Math.max(10, Math.round(height * 0.16));
  const sy = Math.max(0, y - padY);
  const sh = Math.min(source.height - sy, height + padY * 2);
  const sidePad = Math.max(14, Math.round(source.width * 0.03));

  const canvas = document.createElement("canvas");
  canvas.width = source.width + sidePad * 2;
  canvas.height = sh + sidePad * 2;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context is not available.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, sy, source.width, sh, sidePad, sidePad, source.width, sh);
  return canvas;
}

function detectHorizontalTextRegions(source: HTMLCanvasElement): { y: number; height: number }[] {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  const { width: w, height: h } = source;
  const image = ctx.getImageData(0, 0, w, h).data;
  const activity = new Float64Array(h);

  // Horizontal edge activity is a useful cheap proxy for text rows.
  for (let y = 1; y < h - 1; y++) {
    let sum = 0;
    for (let x = 1; x < w - 1; x += 2) {
      const i = (y * w + x) * 4;
      const ir = (y * w + x + 1) * 4;
      const id = ((y + 1) * w + x) * 4;
      const lum = 0.2126 * image[i] + 0.7152 * image[i + 1] + 0.0722 * image[i + 2];
      const lumR = 0.2126 * image[ir] + 0.7152 * image[ir + 1] + 0.0722 * image[ir + 2];
      const lumD = 0.2126 * image[id] + 0.7152 * image[id + 1] + 0.0722 * image[id + 2];
      sum += Math.abs(lum - lumR) + Math.abs(lum - lumD);
    }
    activity[y] = sum / Math.max(1, w / 2);
  }

  const radius = Math.max(2, Math.round(h * 0.006));
  const smooth = new Float64Array(h);
  let rolling = 0;
  for (let y = 0; y < h; y++) {
    rolling += activity[y];
    if (y - radius * 2 - 1 >= 0) rolling -= activity[y - radius * 2 - 1];
    smooth[y] = rolling / Math.min(y + 1, radius * 2 + 1);
  }

  let mean = 0;
  for (const v of smooth) mean += v;
  mean /= Math.max(1, h);
  let variance = 0;
  for (const v of smooth) variance += (v - mean) ** 2;
  const std = Math.sqrt(variance / Math.max(1, h));
  const threshold = mean + std * 0.2;

  const raw: { y: number; height: number; strength: number }[] = [];
  let start = -1;
  let strength = 0;
  for (let y = 0; y <= h; y++) {
    const active = y < h && smooth[y] > threshold;
    if (active && start < 0) {
      start = y;
      strength = 0;
    }
    if (active) strength += smooth[y];
    if ((!active || y === h) && start >= 0) {
      const end = y - 1;
      const regionHeight = end - start + 1;
      if (regionHeight >= Math.max(10, h * 0.018) && regionHeight <= h * 0.42) {
        raw.push({ y: start, height: regionHeight, strength });
      }
      start = -1;
      strength = 0;
    }
  }

  // Merge close rows that likely belong to one visual line.
  raw.sort((a, b) => a.y - b.y);
  const merged: typeof raw = [];
  for (const region of raw) {
    const prev = merged[merged.length - 1];
    if (prev && region.y - (prev.y + prev.height) < h * 0.035) {
      const end = Math.max(prev.y + prev.height, region.y + region.height);
      prev.height = end - prev.y;
      prev.strength += region.strength;
    } else {
      merged.push({ ...region });
    }
  }

  return merged
    .filter((r) => r.height >= 12 && r.height <= h * 0.35)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5)
    .sort((a, b) => a.y - b.y)
    .map(({ y, height }) => ({ y, height }));
}

async function prepareOcrVariants(file: File, quality: OcrQuality) {
  const source = await loadImageBitmapSafe(file);
  try {
    const base = buildBaseCanvas(source, quality);
    const variants: PreparedVariant[] = [{ name: "base", canvas: base }];
    if (quality === "fast") return variants;

    const grayscale = enhanceGrayscale(base);
    variants.unshift({ name: "gray", canvas: grayscale });
    if (quality === "balanced") return variants;

    const binary = makeBinaryVariant(grayscale);
    variants.splice(1, 0, { name: "binary", canvas: binary });
    return variants;
  } finally {
    closeBitmap(source);
  }
}

function buildStylizedTasks(
  variants: PreparedVariant[],
  PSM: PsmMap,
  quality: OcrQuality,
): { tasks: OcrTask[]; ownedCanvases: HTMLCanvasElement[] } {
  const tasks: OcrTask[] = [];
  const ownedCanvases: HTMLCanvasElement[] = [];
  const gray = variants.find((v) => v.name === "gray")?.canvas ?? enhanceGrayscale(variants[0].canvas);
  if (!variants.some((v) => v.canvas === gray)) ownedCanvases.push(gray);

  const sharp = sharpenCanvas(gray);
  const adaptive = makeAdaptiveVariant(sharp, false);
  const adaptiveInv = makeAdaptiveVariant(sharp, true);
  const inverted = invertCanvas(gray);
  ownedCanvases.push(sharp, adaptive, adaptiveInv, inverted);

  const sparse = PSM.SPARSE_TEXT ?? 11;
  const block = PSM.SINGLE_BLOCK ?? 6;
  const line = PSM.SINGLE_LINE ?? 7;

  tasks.push(
    { canvas: sharp, psm: sparse, label: "logo-sharp" },
    { canvas: adaptive, psm: sparse, label: "logo-adaptive" },
    { canvas: adaptiveInv, psm: sparse, label: "logo-adaptive-invert" },
  );

  if (quality === "accurate") {
    tasks.push({ canvas: inverted, psm: sparse, label: "logo-invert" });
  }

  const regions = detectHorizontalTextRegions(sharp);
  regions.forEach((region, index) => {
    const crop = cropCanvas(sharp, region.y, region.height);
    const cropAdaptive = makeAdaptiveVariant(crop, false);
    const cropAdaptiveInv = makeAdaptiveVariant(crop, true);
    ownedCanvases.push(crop, cropAdaptive, cropAdaptiveInv);
    const psm = region.height < sharp.height * 0.14 ? line : block;
    tasks.push(
      { canvas: crop, psm, label: `region-${index + 1}`, regionOrder: index, regionCandidate: true },
      { canvas: cropAdaptive, psm, label: `region-${index + 1}-adaptive`, regionOrder: index, regionCandidate: true },
    );
    if (quality === "accurate") {
      tasks.push({
        canvas: cropAdaptiveInv,
        psm,
        label: `region-${index + 1}-invert`,
        regionOrder: index,
        regionCandidate: true,
      });
    }
  });

  return { tasks, ownedCanvases };
}

function releaseCanvases(canvases: HTMLCanvasElement[]) {
  for (const canvas of canvases) {
    canvas.width = 1;
    canvas.height = 1;
  }
}

function normalizePersianOutput(value: string, language: OcrLanguage) {
  let result = value.normalize("NFC").replace(/\u0640/g, "");

  if (language !== "en") {
    result = result
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/ۀ/g, "هٔ");
  }

  return result
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function candidateScore(text: string, confidence: number, language: OcrLanguage) {
  if (!text.trim()) return -1000;

  let score = confidence;
  const letters = text.match(/[\p{L}\p{N}]/gu) ?? [];
  if (!letters.length) return score - 25;

  const persianChars = text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  const latinChars = text.match(/[A-Za-z]/g)?.length ?? 0;
  const weird = text.match(/[�□]/g)?.length ?? 0;

  if (language === "fa") {
    score += (persianChars / Math.max(1, letters.length)) * 18;
    score -= (latinChars / Math.max(1, letters.length)) * 12;
  } else if (language === "faEn") {
    score += Math.min(7, (persianChars / Math.max(1, letters.length)) * 8);
  }

  score -= weird * 2;
  return score;
}

function isWeakCandidate(candidate: OcrCandidate | undefined, language: OcrLanguage) {
  if (!candidate?.text.trim()) return true;
  const chars = candidate.text.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  const persian = candidate.text.match(/[\u0600-\u06FF]/g)?.length ?? 0;
  if (chars < 3) return true;
  if (candidate.confidence < 32) return true;
  if (language !== "en" && persian < 2) return true;
  return false;
}

function chooseFinalCandidate(candidates: OcrCandidate[], language: OcrLanguage) {
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  const best = sorted[0];
  if (!best) return { text: "", confidence: 0 };

  // For stylized/logo text, separate horizontal regions can each contain a
  // valid line. Keep the strongest candidate for every region and join them
  // in visual top-to-bottom order when that is more informative than the
  // single best full-image pass.
  const regionMap = new Map<number, OcrCandidate>();
  for (const candidate of sorted) {
    if (!candidate.regionCandidate || candidate.regionOrder == null) continue;
    if (!candidate.text.trim()) continue;
    const current = regionMap.get(candidate.regionOrder);
    if (!current || candidate.score > current.score) {
      regionMap.set(candidate.regionOrder, candidate);
    }
  }

  const regionCandidates = [...regionMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, candidate]) => candidate)
    .filter((candidate) => !isWeakCandidate(candidate, language));

  const uniqueLines: string[] = [];
  const used = new Set<string>();
  let confidenceTotal = 0;
  let confidenceCount = 0;

  for (const candidate of regionCandidates) {
    const normalized = candidate.text.replace(/\s+/g, " ").trim();
    if (!normalized || used.has(normalized)) continue;
    if ([...used].some((line) => line.includes(normalized) || normalized.includes(line))) continue;
    used.add(normalized);
    uniqueLines.push(normalized);
    confidenceTotal += candidate.confidence;
    confidenceCount += 1;
  }

  const regionText = uniqueLines.join("\n").trim();
  const regionChars = regionText.match(/[\p{L}\p{N}]/gu)?.length ?? 0;
  const bestChars = best.text.match(/[\p{L}\p{N}]/gu)?.length ?? 0;

  if (regionChars >= 3 && (isWeakCandidate(best, language) || regionChars > bestChars * 1.15)) {
    return {
      text: regionText,
      confidence: confidenceCount ? Math.round(confidenceTotal / confidenceCount) : best.confidence,
    };
  }

  return { text: best.text, confidence: best.confidence };
}

export default function ImageToTextTool() {
  const theme = useThemeColors();
  const t = useImageToTextContent();
  const inputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<OcrWorker | null>(null);
  const runIdRef = useRef(0);
  const resourceController = useRef<AbortController | null>(null);
  const processTask = useRef<ReturnType<typeof startActivity> | null>(null);
  useEffect(() => () => { resourceController.current?.abort(); processTask.current?.fail(new DOMException("Cancelled", "AbortError")); }, []);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [language, setLanguage] = useState<OcrLanguage>("fa");
  const [quality, setQuality] = useState<OcrQuality>("balanced");
  const [mode, setMode] = useState<OcrMode>("auto");
  const [text, setText] = useState("");
  const [confidence, setConfidence] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const releasePreview = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const setSelectedFile = useCallback(
    (nextFile: File) => {
      if (!isSupportedImage(nextFile)) {
        setError(t.invalidType);
        return;
      }
      releasePreview();
      setFile(nextFile);
      setPreviewUrl(URL.createObjectURL(nextFile));
      setText("");
      setConfidence(null);
      setProgress(0);
      setStatus("");
      setError("");
      if (inputRef.current) inputRef.current.value = "";
    },
    [releasePreview, t.invalidType],
  );

  const removeFile = useCallback(() => {
    resourceController.current?.abort();
    processTask.current?.fail(new DOMException("Cancelled", "AbortError"));
    runIdRef.current += 1;
    workerRef.current?.terminate().catch(() => undefined);
    workerRef.current = null;
    releasePreview();
    setFile(null);
    setPreviewUrl(null);
    setText("");
    setConfidence(null);
    setProgress(0);
    setStatus("");
    setBusy(false);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }, [releasePreview]);

  const pasteImage = useCallback(async () => {
    setError("");
    try {
      if (!navigator.clipboard?.read) throw new Error("clipboard-unavailable");
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith("image/"));
        if (!imageType) continue;
        const blob = await item.getType(imageType);
        const ext = imageType.split("/")[1]?.replace("jpeg", "jpg") || "png";
        setSelectedFile(
          new File([blob], `clipboard-${Date.now()}.${ext}`, { type: imageType }),
        );
        return;
      }
      setError(t.noClipboardImage);
    } catch {
      setError(t.clipboardDenied);
    }
  }, [setSelectedFile, t.clipboardDenied, t.noClipboardImage]);

  const cancel = useCallback(() => {
    resourceController.current?.abort();
    processTask.current?.fail(new DOMException("Cancelled", "AbortError"));
    runIdRef.current += 1;
    workerRef.current?.terminate().catch(() => undefined);
    workerRef.current = null;
    setBusy(false);
    setStatus("");
    setProgress(0);
  }, []);

  const extractText = useCallback(async () => {
    if (!file || busy) return;

    const runId = ++runIdRef.current;
    setBusy(true);
    setError("");
    setText("");
    setConfidence(null);
    setProgress(0);
    setStatus(t.preparing);

    resourceController.current = new AbortController();
    processTask.current = startActivity("OCR", "process", undefined, cancel);
    let resources: Awaited<ReturnType<typeof prepareOcrResources>> | null = null;
    let worker: OcrWorker | null = null;
    let prepared: PreparedVariant[] = [];
    const ownedCanvases: HTMLCanvasElement[] = [];

    try {
      const Tesseract = await import("tesseract.js");
      if (runId !== runIdRef.current) return;

      prepared = await prepareOcrVariants(file, quality);
      if (runId !== runIdRef.current) return;

      const langPath = `${window.location.origin}/runtime/ocr-v7/languages/${quality === "accurate" ? "accurate" : "balanced"}`;

      resources = await prepareOcrResources(Array.isArray(OCR_LANG[language]) ? (OCR_LANG[language] as string[]).join("+") : OCR_LANG[language] as string, quality === "accurate", resourceController.current.signal);
      if (runId !== runIdRef.current) return;
      worker = (await Tesseract.createWorker(
        OCR_LANG[language],
        Tesseract.OEM.LSTM_ONLY,
        {
          ...(langPath ? { langPath } : {}),
          workerPath: resources.workerPath, corePath: resources.corePath, cachePath: resources.cachePath,
          logger: (message: { status?: string; progress?: number }) => {
            if (runId !== runIdRef.current) return;

            const loggerProgress = message.progress;
            if (typeof loggerProgress === "number") {
              const scaledProgress = Math.max(
                0,
                Math.min(0.94, loggerProgress * 0.82),
              );
              setProgress((current) => Math.max(current, scaledProgress));
            }

            if (message.status) { setStatus(message.status); processTask.current?.progress(message.progress ?? 0, 1, message.status); }
          },
        },
      )) as unknown as OcrWorker;

      workerRef.current = worker;
      if (runId !== runIdRef.current) {
        await worker.terminate();
        return;
      }

      await worker.setParameters({
        preserve_interword_spaces: "1",
        user_defined_dpi: "300",
      });

      const PSM: PsmMap = {
        AUTO: Tesseract.PSM.AUTO,
        SPARSE_TEXT: Tesseract.PSM.SPARSE_TEXT,
        SINGLE_BLOCK: Tesseract.PSM.SINGLE_BLOCK,
        SINGLE_LINE: Tesseract.PSM.SINGLE_LINE,
      };
      const autoPsm = PSM.AUTO ?? 3;
      const candidates: OcrCandidate[] = [];

      const runTasks = async (tasks: OcrTask[], progressStart: number, progressEnd: number) => {
        for (let i = 0; i < tasks.length; i++) {
          if (runId !== runIdRef.current) return;
          const task = tasks[i];
          setStatus(
            tasks.length > 1
              ? `${t.recognizingPass} ${i + 1}/${tasks.length}`
              : t.extracting,
          );

          await worker!.setParameters({
            tessedit_pageseg_mode: String(task.psm),
            preserve_interword_spaces: "1",
            user_defined_dpi: "300",
          });

          const result = await worker!.recognize(task.canvas, { rotateAuto: true });
          if (runId !== runIdRef.current) return;

          const rawText = String(result?.data?.text ?? "");
          const normalized = normalizePersianOutput(rawText, language);
          const candidateConfidence =
            typeof result?.data?.confidence === "number"
              ? Math.round(result.data.confidence)
              : 0;

          candidates.push({
            text: normalized,
            confidence: candidateConfidence,
            score: candidateScore(normalized, candidateConfidence, language),
            regionOrder: task.regionOrder,
            regionCandidate: task.regionCandidate,
          });

          const local = (i + 1) / Math.max(1, tasks.length);
          setProgress(Math.min(0.98, progressStart + (progressEnd - progressStart) * local));
        }
      };

      const normalTasks: OcrTask[] = prepared.map((variant) => ({
        canvas: variant.canvas,
        psm: autoPsm,
        label: `document-${variant.name}`,
      }));

      if (mode !== "stylized") {
        await runTasks(normalTasks, 0.08, mode === "auto" ? 0.48 : 0.96);
      }

      const currentBest = [...candidates].sort((a, b) => b.score - a.score)[0];
      const shouldRunStylized =
        mode === "stylized" ||
        (mode === "auto" && isWeakCandidate(currentBest, language));

      if (shouldRunStylized && runId === runIdRef.current) {
        setStatus(t.stylizedFallback);
        const stylized = buildStylizedTasks(prepared, PSM, quality);
        ownedCanvases.push(...stylized.ownedCanvases);
        await runTasks(stylized.tasks, mode === "stylized" ? 0.08 : 0.5, 0.98);
      }

      const final = chooseFinalCandidate(candidates, language);
      setText(final.text);
      setConfidence(final.text ? final.confidence : null);
      setProgress(1);
      processTask.current?.finish();
      setStatus("");
      if (!final.text) setError(t.noText);
    } catch (err) {
      if (runId === runIdRef.current) {
        console.error("[image-to-text]", err);
        setError(t.error); processTask.current?.fail(err);
      }
    } finally {
      resources?.release();
      releaseCanvases([...prepared.map((variant) => variant.canvas), ...ownedCanvases]);
      if (worker) {
        await worker.terminate().catch(() => undefined);
        if (workerRef.current === worker) workerRef.current = null;
      }
      if (runId === runIdRef.current) setBusy(false);
    }
  }, [
    busy,
    file,
    language,
    mode,
    quality,
    t.error,
    t.extracting,
    t.noText,
    t.preparing,
    t.recognizingPass,
    t.stylizedFallback,
    cancel,
  ]);

  const copyText = useCallback(async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [text]);

  const downloadText = useCallback(() => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const base = file?.name.replace(/\.[^.]+$/, "") || "extracted-text";
    a.href = url;
    a.download = outputFilename(`${base}.txt`);
    document.body.appendChild(a);
    void saveFile(a.href, a.download);
    a.remove();
    URL.revokeObjectURL(url);
  }, [file, text]);

  useEffect(() => {
    return () => {
      resourceController.current?.abort();
    processTask.current?.fail(new DOMException("Cancelled", "AbortError"));
    runIdRef.current += 1;
      workerRef.current?.terminate().catch(() => undefined);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const languageOptions = [
    { value: "fa", label: t.languages.fa },
    { value: "faEn", label: t.languages.faEn },
    { value: "en", label: t.languages.en },
  ];

  const qualityOptions = [
    { value: "fast", label: t.qualities.fast },
    { value: "balanced", label: t.qualities.balanced },
    { value: "accurate", label: t.qualities.accurate },
  ];

  const modeOptions = [
    { value: "auto", label: t.modes.auto },
    { value: "document", label: t.modes.document },
    { value: "stylized", label: t.modes.stylized },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
              {t.language}
            </label>
            <CustomDropdown
              options={languageOptions}
              value={language}
              onChange={(value) => setLanguage(value as OcrLanguage)}
              searchable={false}
            />
          </div>
          <div>
            <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
              {t.mode}
            </label>
            <CustomDropdown
              options={modeOptions}
              value={mode}
              onChange={(value) => setMode(value as OcrMode)}
              searchable={false}
            />
          </div>
          <div>
            <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
              {t.quality}
            </label>
            <CustomDropdown
              options={qualityOptions}
              value={quality}
              onChange={(value) => setQuality(value as OcrQuality)}
              searchable={false}
            />
          </div>
        </div>

        {language !== "en" && (
          <div className={`p-3 rounded-xl border text-xs ${theme.secondary} ${theme.border} ${theme.textMuted}`}>
            {t.persianHint}
            {mode === "stylized" && <p className="mt-2">{t.stylizedHint}</p>}
          </div>
        )}

        <AccessibleInput
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
        />

        {!file ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) setSelectedFile(dropped);
            }}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${theme.border} ${theme.bg} hover:border-[var(--app-accent)]`}
          >
            <UploadCloud size={42} className={`mx-auto mb-4 ${theme.accent}`} />
            <p className={`text-lg font-bold ${theme.text}`}>{t.uploadTitle}</p>
            <p className={`text-sm mt-2 ${theme.textMuted}`}>{t.uploadHint}</p>
            <span className={`inline-flex mt-4 px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}>
              {t.selectFile}
            </span>
          </div>
        ) : (
          <div className={`rounded-2xl border p-4 ${theme.card} ${theme.border}`}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-3">
                <FileImage size={24} className={theme.accent} />
                <div className="min-w-0">
                  <p className={`font-medium truncate ${theme.text}`}>{file.name}</p>
                  <p className={`text-xs ${theme.textMuted}`}>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button aria-label={t.remove}
                type="button"
                onClick={removeFile}
                disabled={busy}
                title={t.remove}
                className="p-2 text-[var(--app-error-text)] disabled:opacity-40"
              >
                <X size={19} />
              </button>
            </div>
          </div>
        )}

        {!file && (
          <button
            type="button"
            onClick={pasteImage}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium ${theme.border} ${theme.card} ${theme.text}`}
          >
            <ClipboardPaste size={18} /> {t.pasteImage}
          </button>
        )}

        {error && (
          <div role="alert" className="p-4 rounded-xl border border-[var(--app-error-border)] bg-[var(--app-error-bg)] flex gap-3 text-[var(--app-error-text)]">
            <AlertCircle size={19} className="shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {busy && (
          <div className={`p-4 rounded-xl border ${theme.secondary} ${theme.border}`}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className={`text-sm font-medium ${theme.text}`}>
                {status || t.extracting}
              </span>
              <span className={`text-xs ${theme.textMuted}`}>{Math.round(progress * 100)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${theme.gradient} transition-all`}
                style={{ width: `${Math.max(3, progress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {file && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={busy ? cancel : extractText}
              className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold ${busy ? "bg-red-500 text-white" : theme.primary}`}
            >
              {busy ? <X size={18} /> : <Loader2 size={18} />}
              {busy ? t.cancel : t.extract}
            </button>
            {!busy && (
              <button aria-label={t.pasteImage}
                type="button"
                onClick={pasteImage}
                className={`px-4 py-3 rounded-xl border ${theme.border} ${theme.card} ${theme.text}`}
                title={t.pasteImage}
              >
                <ClipboardPaste size={18} />
              </button>
            )}
          </div>
        )}

        <div className={`p-4 rounded-xl border text-sm ${theme.secondary} ${theme.border} ${theme.textMuted}`}>
          <p>{t.privacy}</p>
          <p className="mt-2">{t.firstRun}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`rounded-2xl border overflow-hidden ${theme.card} ${theme.border}`}>
          <div className={`px-4 py-3 border-b ${theme.border} ${theme.text} font-medium text-sm`}>
            {t.previewTitle}
          </div>
          <div className="min-h-[260px] bg-white flex items-center justify-center p-4">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={file?.name || "OCR preview"} className="max-h-[420px] max-w-full object-contain" />
            ) : (
              <FileImage size={48} className="text-slate-300" />
            )}
          </div>
        </div>

        <div className={`rounded-2xl border overflow-hidden ${theme.card} ${theme.border}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${theme.border}`}>
            <div>
              <p className={`font-medium text-sm ${theme.text}`}>{t.resultTitle}</p>
              {confidence !== null && (
                <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
                  {t.confidence}: {confidence}%
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyText}
                disabled={!text}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border disabled:opacity-40 ${theme.border} ${theme.text}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? t.copied : t.copy}
              </button>
              <button data-testid="download-result"
                type="button"
                onClick={downloadText}
                disabled={!text}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs disabled:opacity-40 ${theme.primary}`}
              >
                <Download size={14} /> {t.download}
              </button>
            </div>
          </div>
          <AccessibleTextarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.emptyResult}
            dir={language === "en" ? "ltr" : "rtl"}
            className={`w-full min-h-[300px] p-4 resize-y focus:outline-none bg-transparent leading-8 ${theme.text}`}
          />
          {text && (
            <div className="px-4 pb-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setText("");
                  setConfidence(null);
                  setError("");
                }}
                className={`text-xs ${theme.textMuted} hover:opacity-70`}
              >
                {t.clear}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
