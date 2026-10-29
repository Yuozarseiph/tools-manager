import type { Layer as PsdLayer, BlendMode as PsdBlendMode } from "ag-psd";
import {
  EDITOR_MAX_DIMENSION,
} from "./editor-constants";
import type {
  EditorAdjustmentKind,
  EditorBlendMode,
  EditorDocument,
  EditorFilterKind,
  EditorFilterPreview,
  EditorLayer,
  EditorLayerBounds,
  EditorPoint,
  EditorSelection,
  EditorSelectionRect,
  EditorShapeLayer,
  EditorTextLayer,
} from "./editor-types";

export interface EditorCanvas {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export function createCanvas(width: number, height: number): EditorCanvas {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available in this browser.");
  return { canvas, ctx };
}

export function cloneCanvas(source: HTMLCanvasElement): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(source.width, source.height);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Keeps fractional canvas coordinates stable to two decimals. */
export function normalizePoint(value: number): number {
  return Math.round(value * 100) / 100;
}

export function normaliseRect(x1: number, y1: number, x2: number, y2: number): EditorSelectionRect {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function boundsOfPoints(points: EditorPoint[]): EditorSelectionRect {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

export function rectSelection(rect: EditorSelectionRect): EditorSelection {
  return {
    points: [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height },
    ],
    bounds: rect,
  };
}

export function polygonSelection(points: EditorPoint[]): EditorSelection | null {
  if (points.length < 3) return null;
  return { points, bounds: boundsOfPoints(points) };
}

export function traceSelectionPath(ctx: CanvasRenderingContext2D, selection: EditorSelection) {
  ctx.beginPath();
  selection.points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
}

function withSelection(ctx: CanvasRenderingContext2D, selection: EditorSelection | null, draw: () => void) {
  if (!selection) {
    draw();
    return;
  }
  ctx.save();
  traceSelectionPath(ctx, selection);
  ctx.clip();
  draw();
  ctx.restore();
}

export function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be loaded."));
    image.src = src;
  });
}

export function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } {
  const value = hex.trim();
  if (value.startsWith("#")) {
    let raw = value.slice(1);
    if (raw.length === 3 || raw.length === 4) raw = raw.split("").map((c) => c + c).join("");
    if (raw.length === 6 || raw.length === 8) {
      return {
        r: parseInt(raw.slice(0, 2), 16),
        g: parseInt(raw.slice(2, 4), 16),
        b: parseInt(raw.slice(4, 6), 16),
        a: raw.length === 8 ? parseInt(raw.slice(6, 8), 16) : 255,
      };
    }
  }
  return { r: 0, g: 0, b: 0, a: 255 };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
}

export function blendToComposite(mode: EditorBlendMode): GlobalCompositeOperation {
  return mode as GlobalCompositeOperation;
}

function fontString(layer: EditorTextLayer): string {
  return `${layer.fontStyle} ${layer.fontWeight} ${Math.max(1, layer.fontSize)}px ${layer.fontFamily}`;
}

function textLines(layer: EditorTextLayer): string[] {
  const lines = layer.text.split("\n");
  return lines.length ? lines : [""];
}

function applyFont(ctx: CanvasRenderingContext2D, layer: EditorTextLayer) {
  ctx.font = fontString(layer);
  ctx.textBaseline = "middle";
  ctx.textAlign = layer.align;
  const spacing = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ("letterSpacing" in spacing) spacing.letterSpacing = `${layer.letterSpacing}px`;
}

function lineWidth(ctx: CanvasRenderingContext2D, text: string, letterSpacing: number) {
  const characters = Array.from(text).length;
  return ctx.measureText(text).width + Math.max(0, characters - 1) * letterSpacing;
}

export function measureTextLayer(layer: EditorTextLayer): { width: number; height: number; lineHeight: number } {
  const { ctx } = createCanvas(1, 1);
  applyFont(ctx, layer);
  const lines = textLines(layer);
  const width = Math.max(...lines.map((line) => lineWidth(ctx, line || " ", layer.letterSpacing)), 1);
  const lineHeight = Math.max(1, layer.fontSize * layer.lineHeight);
  return { width, height: lineHeight * lines.length, lineHeight };
}

function textAnchorOffset(layer: EditorTextLayer, width: number): number {
  if (layer.align === "left") return width / 2;
  if (layer.align === "right") return -width / 2;
  return 0;
}

export function getLayerBounds(layer: EditorLayer, doc: EditorDocument): EditorLayerBounds {
  let width: number;
  let height: number;
  let pivotX: number;
  let pivotY: number;
  let localCenterX = 0;

  if (layer.kind === "raster") {
    width = doc.width;
    height = doc.height;
    pivotX = doc.width / 2 + layer.x;
    pivotY = doc.height / 2 + layer.y;
  } else if (layer.kind === "text") {
    const measured = measureTextLayer(layer);
    width = measured.width;
    height = measured.height;
    pivotX = layer.x;
    pivotY = layer.y;
    localCenterX = textAnchorOffset(layer, width);
  } else if (layer.kind === "shape") {
    width = layer.width;
    height = Math.max(layer.height, layer.strokeWidth);
    pivotX = layer.x;
    pivotY = layer.y;
  } else {
    width = doc.width;
    height = doc.height;
    pivotX = doc.width / 2;
    pivotY = doc.height / 2;
  }

  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const cos = Math.cos(layer.rotation);
  const sin = Math.sin(layer.rotation);
  const corners = [
    { x: localCenterX - halfWidth, y: -halfHeight },
    { x: localCenterX + halfWidth, y: -halfHeight },
    { x: localCenterX + halfWidth, y: halfHeight },
    { x: localCenterX - halfWidth, y: halfHeight },
  ].map((corner) => {
    const scaledX = corner.x * layer.scaleX;
    const scaledY = corner.y * layer.scaleY;
    return {
      x: pivotX + scaledX * cos - scaledY * sin,
      y: pivotY + scaledX * sin + scaledY * cos,
    };
  });

  const xs = corners.map((corner) => corner.x);
  const ys = corners.map((corner) => corner.y);
  const x = Math.min(...xs);
  const y = Math.min(...ys);

  return {
    x,
    y,
    width: Math.max(...xs) - x,
    height: Math.max(...ys) - y,
    centerX: pivotX + localCenterX * layer.scaleX * cos,
    centerY: pivotY + localCenterX * layer.scaleX * sin,
    corners,
  };
}

function drawTextLayer(ctx: CanvasRenderingContext2D, layer: EditorTextLayer) {
  const lines = textLines(layer);
  const { lineHeight } = measureTextLayer(layer);
  const startY = -((lines.length - 1) * lineHeight) / 2;
  applyFont(ctx, layer);

  const hasShadow = layer.shadowBlur > 0 || layer.shadowOffsetX !== 0 || layer.shadowOffsetY !== 0;
  if (hasShadow) {
    ctx.save();
    ctx.shadowColor = rgba(layer.shadowColor, 0.7);
    ctx.shadowBlur = layer.shadowBlur;
    ctx.shadowOffsetX = layer.shadowOffsetX;
    ctx.shadowOffsetY = layer.shadowOffsetY;
    ctx.fillStyle = layer.color;
    lines.forEach((line, index) => ctx.fillText(line, 0, startY + index * lineHeight));
    ctx.restore();
  }

  lines.forEach((line, index) => {
    const y = startY + index * lineHeight;
    if (layer.strokeWidth > 0) {
      ctx.lineJoin = "round";
      ctx.lineWidth = layer.strokeWidth;
      ctx.strokeStyle = layer.strokeColor;
      ctx.strokeText(line, 0, y);
    }
    ctx.fillStyle = layer.color;
    ctx.fillText(line, 0, y);
  });
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(Math.abs(radius), Math.abs(width) / 2, Math.abs(height) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawShapeLayer(ctx: CanvasRenderingContext2D, layer: EditorShapeLayer) {
  const { width, height } = layer;
  if (layer.shape === "line") {
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(width / 2, 0);
    ctx.strokeStyle = layer.stroke || layer.fill;
    ctx.lineWidth = Math.max(1, layer.strokeWidth);
    ctx.lineCap = "round";
    ctx.stroke();
    return;
  }

  if (layer.shape === "ellipse") {
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.abs(width) / 2, Math.abs(height) / 2, 0, 0, Math.PI * 2);
  } else {
    roundedRectPath(ctx, -width / 2, -height / 2, width, height, layer.radius);
  }

  if (layer.fill && layer.fill !== "transparent") {
    ctx.fillStyle = layer.fill;
    ctx.fill();
  }
  if (layer.strokeWidth > 0 && layer.stroke && layer.stroke !== "transparent") {
    ctx.strokeStyle = layer.stroke;
    ctx.lineWidth = layer.strokeWidth;
    ctx.stroke();
  }
}

function withLayerTransform(
  ctx: CanvasRenderingContext2D,
  layer: EditorLayer,
  doc: EditorDocument,
  draw: () => void
) {
  ctx.save();
  ctx.globalAlpha *= clamp(layer.opacity, 0, 1);
  ctx.globalCompositeOperation = blendToComposite(layer.blend);
  if (layer.kind === "raster") {
    ctx.translate(doc.width / 2 + layer.x, doc.height / 2 + layer.y);
    ctx.rotate(layer.rotation);
    ctx.scale(layer.scaleX, layer.scaleY);
    ctx.translate(-doc.width / 2, -doc.height / 2);
  } else {
    ctx.translate(layer.x, layer.y);
    ctx.rotate(layer.rotation);
    ctx.scale(layer.scaleX, layer.scaleY);
  }
  draw();
  ctx.restore();
}

export function drawLayer(ctx: CanvasRenderingContext2D, layer: EditorLayer, doc: EditorDocument) {
  if (layer.kind === "adjustment") return;
  withLayerTransform(ctx, layer, doc, () => {
    if (layer.kind === "raster") {
      ctx.drawImage(layer.canvas, 0, 0);
    } else if (layer.kind === "text") {
      drawTextLayer(ctx, layer);
    } else {
      drawShapeLayer(ctx, layer);
    }
  });
}

function drawRasterCanvas(
  ctx: CanvasRenderingContext2D,
  layer: EditorLayer,
  doc: EditorDocument,
  canvas: HTMLCanvasElement
) {
  withLayerTransform(ctx, layer, doc, () => {
    ctx.drawImage(canvas, 0, 0);
  });
}

function renderLayerStack(
  ctx: CanvasRenderingContext2D,
  doc: EditorDocument,
  layers: EditorLayer[],
  preview?: EditorFilterPreview | null
) {
  for (let index = 0; index < layers.length; index += 1) {
    const layer = layers[index];
    if (!layer.visible) continue;

    if (layer.kind === "adjustment") {
      const temp = createCanvas(doc.width, doc.height);
      renderLayerStack(temp.ctx, doc, layers.slice(0, index), preview);
      applyAdjustment(temp.canvas, layer.adjustment, layer.params);
      ctx.save();
      ctx.globalAlpha = clamp(layer.opacity, 0, 1);
      ctx.globalCompositeOperation = blendToComposite(layer.blend);
      ctx.drawImage(temp.canvas, 0, 0);
      ctx.restore();
      continue;
    }

    if (preview && preview.layerId === layer.id) {
      drawRasterCanvas(ctx, layer, doc, preview.canvas);
      continue;
    }

    drawLayer(ctx, layer, doc);
  }
}

export function renderDocument(
  ctx: CanvasRenderingContext2D,
  doc: EditorDocument,
  preview?: EditorFilterPreview | null
) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0, 0, doc.width, doc.height);
  renderLayerStack(ctx, doc, doc.layers, preview);
  ctx.restore();
}

export function renderCompositeCanvas(doc: EditorDocument, background?: string): HTMLCanvasElement {
  const { canvas, ctx } = createCanvas(doc.width, doc.height);
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, doc.width, doc.height);
  }
  renderDocument(ctx, doc);
  return canvas;
}

export function renderLayerCanvas(layer: EditorLayer, doc: EditorDocument): HTMLCanvasElement | null {
  if (layer.kind === "adjustment") return null;
  const { canvas, ctx } = createCanvas(doc.width, doc.height);
  drawLayer(ctx, layer, doc);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("The image could not be encoded."))),
      type,
      quality
    );
  });
}

export function getPixelColor(canvas: HTMLCanvasElement, x: number, y: number): string {
  const ctx = canvas.getContext("2d");
  if (!ctx) return "#ffffff";
  const data = ctx.getImageData(clamp(Math.round(x), 0, canvas.width - 1), clamp(Math.round(y), 0, canvas.height - 1), 1, 1).data;
  return rgbToHex(data[0], data[1], data[2]);
}

/* ------------------------------------------------------------------ */
/* Pixel adjustments and filters                                      */
/* ------------------------------------------------------------------ */

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, lightness];
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;
  if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
  else if (max === green) hue = (blue - red) / delta + 2;
  else hue = (red - green) / delta + 4;
  return [(hue * 60 + 360) % 360, saturation, lightness];
}

function hueToRgb(p: number, q: number, t: number): number {
  let value = t;
  if (value < 0) value += 1;
  if (value > 1) value -= 1;
  if (value < 1 / 6) return p + (q - p) * 6 * value;
  if (value < 1 / 2) return q;
  if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
  return p;
}

function hslToRgb(hue: number, saturation: number, lightness: number): [number, number, number] {
  const h = ((hue % 360) + 360) % 360 / 360;
  if (saturation <= 0) {
    const value = Math.round(lightness * 255);
    return [value, value, value];
  }
  const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;
  return [
    Math.round(hueToRgb(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, h) * 255),
    Math.round(hueToRgb(p, q, h - 1 / 3) * 255),
  ];
}

function param(params: Record<string, number>, key: string, fallback = 0): number {
  const value = params[key];
  return Number.isFinite(value) ? value : fallback;
}

export function applyAdjustment(
  canvas: HTMLCanvasElement,
  kind: EditorAdjustmentKind,
  params: Record<string, number>
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;

  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) continue;
    let r = data[index];
    let g = data[index + 1];
    let b = data[index + 2];

    switch (kind) {
      case "brightness": {
        const shift = param(params, "value") * 2.55;
        r += shift;
        g += shift;
        b += shift;
        break;
      }
      case "contrast": {
        const factor = (259 * (param(params, "value") * 2.55 + 255)) / (255 * (259 - param(params, "value") * 2.55));
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;
        break;
      }
      case "levels": {
        const black = param(params, "black");
        const white = Math.max(black + 1, param(params, "white", 255));
        const gamma = Math.max(10, param(params, "gamma", 100)) / 100;
        const table = (value: number) => {
          const normalised = clamp((value - black) / (white - black), 0, 1);
          return Math.pow(normalised, 1 / gamma) * 255;
        };
        r = table(r);
        g = table(g);
        b = table(b);
        break;
      }
      case "hueSaturation": {
        const [h, s, l] = rgbToHsl(r, g, b);
        const saturation = clamp(s + param(params, "saturation") / 100, 0, 1);
        const lightness = clamp(l + param(params, "lightness") / 100, 0, 1);
        [r, g, b] = hslToRgb(h + param(params, "hue"), saturation, lightness);
        break;
      }
      case "colorBalance": {
        r += param(params, "red") * 1.275;
        g += param(params, "green") * 1.275;
        b += param(params, "blue") * 1.275;
        break;
      }
      case "vibrance": {
        const [h, s, l] = rgbToHsl(r, g, b);
        const amount = param(params, "value") / 100;
        const boost = amount >= 0 ? (1 - s) * amount : s * amount;
        [r, g, b] = hslToRgb(h, clamp(s + boost, 0, 1), l);
        break;
      }
      case "exposure": {
        const factor = Math.pow(2, param(params, "value") / 100);
        r *= factor;
        g *= factor;
        b *= factor;
        break;
      }
      case "grayscale": {
        const amount = clamp(param(params, "amount", 100) / 100, 0, 1);
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r += (gray - r) * amount;
        g += (gray - g) * amount;
        b += (gray - b) * amount;
        break;
      }
      case "invert": {
        const amount = clamp(param(params, "amount", 100) / 100, 0, 1);
        r += (255 - r - r) * amount;
        g += (255 - g - g) * amount;
        b += (255 - b - b) * amount;
        break;
      }
      case "sepia": {
        const amount = clamp(param(params, "amount", 100) / 100, 0, 1);
        const sr = 0.393 * r + 0.769 * g + 0.189 * b;
        const sg = 0.349 * r + 0.686 * g + 0.168 * b;
        const sb = 0.272 * r + 0.534 * g + 0.131 * b;
        r += (sr - r) * amount;
        g += (sg - g) * amount;
        b += (sb - b) * amount;
        break;
      }
      case "threshold": {
        const level = param(params, "level", 128);
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const value = gray >= level ? 255 : 0;
        r = value;
        g = value;
        b = value;
        break;
      }
      case "posterize": {
        const levels = Math.max(2, Math.round(param(params, "levels", 6)));
        const step = 255 / (levels - 1);
        r = Math.round(r / step) * step;
        g = Math.round(g / step) * step;
        b = Math.round(b / step) * step;
        break;
      }
      default:
        break;
    }

    data[index] = clamp(Math.round(r), 0, 255);
    data[index + 1] = clamp(Math.round(g), 0, 255);
    data[index + 2] = clamp(Math.round(b), 0, 255);
  }

  ctx.putImageData(image, 0, 0);
}

function convolve(source: HTMLCanvasElement, kernel: number[], divisor: number, offset: number): HTMLCanvasElement {
  const ctx = source.getContext("2d");
  if (!ctx) return cloneCanvas(source);
  const image = ctx.getImageData(0, 0, source.width, source.height);
  const output = ctx.createImageData(source.width, source.height);
  const size = Math.sqrt(kernel.length);
  const half = Math.floor(size / 2);
  const width = source.width;
  const height = source.height;
  const data = image.data;
  const out = output.data;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let ky = 0; ky < size; ky += 1) {
        for (let kx = 0; kx < size; kx += 1) {
          const px = clamp(x + kx - half, 0, width - 1);
          const py = clamp(y + ky - half, 0, height - 1);
          const index = (py * width + px) * 4;
          const weight = kernel[ky * size + kx];
          r += data[index] * weight;
          g += data[index + 1] * weight;
          b += data[index + 2] * weight;
        }
      }
      const index = (y * width + x) * 4;
      out[index] = clamp(Math.round(r / divisor + offset), 0, 255);
      out[index + 1] = clamp(Math.round(g / divisor + offset), 0, 255);
      out[index + 2] = clamp(Math.round(b / divisor + offset), 0, 255);
      out[index + 3] = data[index + 3];
    }
  }

  const result = createCanvas(width, height);
  result.ctx.putImageData(output, 0, 0);
  return result.canvas;
}

function pixelEffect(source: HTMLCanvasElement, effect: (r: number, g: number, b: number) => [number, number, number]) {
  const { canvas, ctx } = createCanvas(source.width, source.height);
  ctx.drawImage(source, 0, 0);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = image.data;
  for (let index = 0; index < data.length; index += 4) {
    if (data[index + 3] === 0) continue;
    const [r, g, b] = effect(data[index], data[index + 1], data[index + 2]);
    data[index] = clamp(Math.round(r), 0, 255);
    data[index + 1] = clamp(Math.round(g), 0, 255);
    data[index + 2] = clamp(Math.round(b), 0, 255);
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function applyFilter(source: HTMLCanvasElement, kind: EditorFilterKind, amount: number): HTMLCanvasElement {
  switch (kind) {
    case "blur": {
      const { canvas, ctx } = createCanvas(source.width, source.height);
      ctx.filter = `blur(${Math.max(0.1, amount)}px)`;
      ctx.drawImage(source, 0, 0);
      return canvas;
    }
    case "sharpen": {
      const strength = clamp(amount / 100, 0, 1);
      const blurred = convolve(source, [0, -1, 0, -1, 5, -1, 0, -1, 0], 1, 0);
      const { canvas, ctx } = createCanvas(source.width, source.height);
      ctx.drawImage(source, 0, 0);
      ctx.globalAlpha = strength;
      ctx.drawImage(blurred, 0, 0);
      return canvas;
    }
    case "pixelate": {
      const size = Math.max(2, Math.round(amount));
      const small = createCanvas(Math.max(1, source.width / size), Math.max(1, source.height / size));
      small.ctx.imageSmoothingEnabled = true;
      small.ctx.drawImage(source, 0, 0, small.canvas.width, small.canvas.height);
      const { canvas, ctx } = createCanvas(source.width, source.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(small.canvas, 0, 0, canvas.width, canvas.height);
      return canvas;
    }
    case "noise": {
      const strength = clamp(amount, 0, 100) * 1.27;
      const { canvas, ctx } = createCanvas(source.width, source.height);
      ctx.drawImage(source, 0, 0);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = image.data;
      for (let index = 0; index < data.length; index += 4) {
        const noise = (Math.random() * 2 - 1) * strength;
        data[index] = clamp(data[index] + noise, 0, 255);
        data[index + 1] = clamp(data[index + 1] + noise, 0, 255);
        data[index + 2] = clamp(data[index + 2] + noise, 0, 255);
      }
      ctx.putImageData(image, 0, 0);
      return canvas;
    }
    case "vignette": {
      const { canvas, ctx } = createCanvas(source.width, source.height);
      ctx.drawImage(source, 0, 0);
      const radius = Math.hypot(canvas.width, canvas.height) / 2;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        radius * 0.35,
        canvas.width / 2,
        canvas.height / 2,
        radius
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${clamp(amount / 100, 0, 1)})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      return canvas;
    }
    case "emboss": {
      const strength = clamp(amount / 100, 0, 1);
      const embossed = convolve(source, [-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 0);
      const { canvas, ctx } = createCanvas(source.width, source.height);
      ctx.drawImage(source, 0, 0);
      ctx.globalAlpha = strength;
      ctx.drawImage(embossed, 0, 0);
      return canvas;
    }
    case "edge": {
      const strength = clamp(amount / 100, 0, 1);
      const edges = convolve(source, [-1, -1, -1, -1, 8, -1, -1, -1, -1], 1, 0);
      const { canvas, ctx } = createCanvas(source.width, source.height);
      ctx.drawImage(source, 0, 0);
      ctx.globalAlpha = strength;
      ctx.drawImage(edges, 0, 0);
      return canvas;
    }
    case "grayscale": {
      const strength = clamp(amount / 100, 0, 1);
      return pixelEffect(source, (r, g, b) => {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        return [r + (gray - r) * strength, g + (gray - g) * strength, b + (gray - b) * strength];
      });
    }
    case "sepia": {
      const strength = clamp(amount / 100, 0, 1);
      return pixelEffect(source, (r, g, b) => [
        r + (0.393 * r + 0.769 * g + 0.189 * b - r) * strength,
        g + (0.349 * r + 0.686 * g + 0.168 * b - g) * strength,
        b + (0.272 * r + 0.534 * g + 0.131 * b - b) * strength,
      ]);
    }
    case "invert": {
      const strength = clamp(amount / 100, 0, 1);
      return pixelEffect(source, (r, g, b) => [
        r + (255 - r - r) * strength,
        g + (255 - g - g) * strength,
        b + (255 - b - b) * strength,
      ]);
    }
    case "posterize": {
      const levels = Math.max(2, Math.round(amount));
      const step = 255 / (levels - 1);
      return pixelEffect(source, (r, g, b) => [
        Math.round(r / step) * step,
        Math.round(g / step) * step,
        Math.round(b / step) * step,
      ]);
    }
    case "threshold": {
      return pixelEffect(source, (r, g, b) => {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const value = gray >= amount ? 255 : 0;
        return [value, value, value];
      });
    }
    default:
      return cloneCanvas(source);
  }
}

export function applyFilterInSelection(
  source: HTMLCanvasElement,
  kind: EditorFilterKind,
  amount: number,
  selection: EditorSelection | null
): HTMLCanvasElement {
  if (!selection) return applyFilter(source, kind, amount);
  const filtered = applyFilter(source, kind, amount);
  const result = cloneCanvas(source);
  const ctx = result.getContext("2d");
  if (!ctx) return filtered;
  const bounds = selection.bounds;
  withSelection(ctx, selection, () => {
    ctx.clearRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.drawImage(filtered, 0, 0);
  });
  return result;
}

/* ------------------------------------------------------------------ */
/* Painting helpers                                                   */
/* ------------------------------------------------------------------ */

export function stampBrush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  hardness: number,
  color: string,
  opacity: number,
  erase = false
) {
  const safeRadius = Math.max(0.5, radius);
  const gradient = ctx.createRadialGradient(x, y, safeRadius * clamp(hardness, 0, 0.98), x, y, safeRadius);
  const { r, g, b } = hexToRgb(color);
  if (erase) {
    gradient.addColorStop(0, `rgba(0,0,0,${opacity})`);
    gradient.addColorStop(1, "rgba(0,0,0,0)");
  } else {
    gradient.addColorStop(0, `rgba(${r},${g},${b},${opacity})`);
    gradient.addColorStop(clamp(hardness, 0, 0.98), `rgba(${r},${g},${b},${opacity})`);
    gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
  }
  ctx.save();
  ctx.globalCompositeOperation = erase ? "destination-out" : "source-over";
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, safeRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function paintStrokeSegment(
  ctx: CanvasRenderingContext2D,
  from: EditorPoint,
  to: EditorPoint,
  settings: { size: number; hardness: number; opacity: number; flow: number },
  color: string,
  erase: boolean
) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const radius = settings.size / 2;
  const spacing = Math.max(0.75, radius * 0.18);
  const steps = Math.max(1, Math.ceil(distance / spacing));
  for (let step = 0; step <= steps; step += 1) {
    const t = steps === 0 ? 0 : step / steps;
    stampBrush(
      ctx,
      from.x + (to.x - from.x) * t,
      from.y + (to.y - from.y) * t,
      radius,
      settings.hardness,
      color,
      clamp(settings.flow, 0, 1) * clamp(settings.opacity, 0, 1),
      erase
    );
  }
}

export function floodFill(
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  tolerance: number,
  selection: EditorSelection | null
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  const startX = clamp(Math.round(x), 0, width - 1);
  const startY = clamp(Math.round(y), 0, height - 1);
  const image = ctx.getImageData(0, 0, width, height);
  const before = new Uint8ClampedArray(image.data);
  const data = image.data;
  const indexOf = (px: number, py: number) => (py * width + px) * 4;
  const startIndex = indexOf(startX, startY);
  const target = [data[startIndex], data[startIndex + 1], data[startIndex + 2], data[startIndex + 3]];
  const fill = hexToRgb(color);
  const maxDistance = tolerance * tolerance * 4;
  const visited = new Uint8Array(width * height);
  const stack: number[] = [startY * width + startX];

  const matches = (index: number) => {
    const dr = data[index] - target[0];
    const dg = data[index + 1] - target[1];
    const db = data[index + 2] - target[2];
    const da = data[index + 3] - target[3];
    return dr * dr + dg * dg + db * db + da * da <= maxDistance;
  };

  while (stack.length) {
    const pixelIndex = stack.pop() as number;
    if (visited[pixelIndex]) continue;
    visited[pixelIndex] = 1;
    const px = pixelIndex % width;
    const py = Math.floor(pixelIndex / width);
    const dataIndex = pixelIndex * 4;
    if (!matches(dataIndex)) continue;

    data[dataIndex] = fill.r;
    data[dataIndex + 1] = fill.g;
    data[dataIndex + 2] = fill.b;
    data[dataIndex + 3] = 255;

    if (px > 0) stack.push(pixelIndex - 1);
    if (px < width - 1) stack.push(pixelIndex + 1);
    if (py > 0) stack.push(pixelIndex - width);
    if (py < height - 1) stack.push(pixelIndex + width);
  }

  if (selection) {
    const mask = createCanvas(width, height);
    mask.ctx.fillStyle = "#fff";
    traceSelectionPath(mask.ctx, selection);
    mask.ctx.fill();
    const maskData = mask.ctx.getImageData(0, 0, width, height).data;
    for (let index = 0; index < data.length; index += 4) {
      if (maskData[index + 3] === 0) {
        data[index] = before[index];
        data[index + 1] = before[index + 1];
        data[index + 2] = before[index + 2];
        data[index + 3] = before[index + 3];
      }
    }
  }

  ctx.putImageData(image, 0, 0);
}

export function drawGradientFill(
  canvas: HTMLCanvasElement,
  from: EditorPoint,
  to: EditorPoint,
  settings: { type: "linear" | "radial"; from: string; to: string },
  selection: EditorSelection | null,
  opacity: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const gradient =
    settings.type === "radial"
      ? ctx.createRadialGradient(
          from.x,
          from.y,
          0,
          from.x,
          from.y,
          Math.max(1, Math.hypot(to.x - from.x, to.y - from.y))
        )
      : ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  gradient.addColorStop(0, settings.from);
  gradient.addColorStop(1, settings.to);
  ctx.save();
  ctx.globalAlpha = clamp(opacity, 0, 1);
  withSelection(ctx, selection, () => {
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });
  ctx.restore();
}

export function clearSelectionOnCanvas(canvas: HTMLCanvasElement, selection: EditorSelection | null) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  if (!selection) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  withSelection(ctx, selection, () => ctx.clearRect(0, 0, canvas.width, canvas.height));
}

export function fillSelectionOnCanvas(
  canvas: HTMLCanvasElement,
  selection: EditorSelection | null,
  color: string
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.save();
  if (selection) {
    traceSelectionPath(ctx, selection);
    ctx.clip();
  }
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Document transformations                                           */
/* ------------------------------------------------------------------ */

function remapLayerAnchor(
  layer: EditorLayer,
  doc: EditorDocument,
  newWidth: number,
  newHeight: number,
  transform: (point: EditorPoint) => EditorPoint,
  rotationDelta: number
): { x: number; y: number; rotation: number } {
  const oldCenter = {
    x: layer.kind === "raster" ? doc.width / 2 + layer.x : layer.x,
    y: layer.kind === "raster" ? doc.height / 2 + layer.y : layer.y,
  };
  const newCenter = transform(oldCenter);
  return {
    x: layer.kind === "raster" ? newCenter.x - newWidth / 2 : newCenter.x,
    y: layer.kind === "raster" ? newCenter.y - newHeight / 2 : newCenter.y,
    rotation: layer.rotation + rotationDelta,
  };
}

export function cropDocument(doc: EditorDocument, rect: EditorSelectionRect): EditorDocument {
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const layers = doc.layers.map((layer) => {
    if (layer.kind === "raster") {
      const { canvas, ctx } = createCanvas(width, height);
      ctx.drawImage(layer.canvas, -rect.x, -rect.y);
      return {
        ...layer,
        canvas,
        x: doc.width / 2 + layer.x - rect.x - width / 2,
        y: doc.height / 2 + layer.y - rect.y - height / 2,
      };
    }
    return { ...layer, x: layer.x - rect.x, y: layer.y - rect.y };
  });

  return { ...doc, width, height, layers, selection: null };
}

export function resizeDocument(doc: EditorDocument, width: number, height: number): EditorDocument {
  const nextWidth = Math.max(1, Math.round(width));
  const nextHeight = Math.max(1, Math.round(height));
  const scaleX = nextWidth / doc.width;
  const scaleY = nextHeight / doc.height;
  const average = (scaleX + scaleY) / 2;

  const layers = doc.layers.map((layer) => {
    if (layer.kind === "raster") {
      const { canvas, ctx } = createCanvas(nextWidth, nextHeight);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(layer.canvas, 0, 0, nextWidth, nextHeight);
      return { ...layer, canvas, x: layer.x * scaleX, y: layer.y * scaleY };
    }
    if (layer.kind === "text") {
      return {
        ...layer,
        x: layer.x * scaleX,
        y: layer.y * scaleY,
        fontSize: Math.max(1, layer.fontSize * scaleY),
        letterSpacing: layer.letterSpacing * scaleX,
        strokeWidth: layer.strokeWidth * average,
        shadowBlur: layer.shadowBlur * average,
        shadowOffsetX: layer.shadowOffsetX * scaleX,
        shadowOffsetY: layer.shadowOffsetY * scaleY,
      };
    }
    if (layer.kind === "shape") {
      return {
        ...layer,
        x: layer.x * scaleX,
        y: layer.y * scaleY,
        width: layer.width * scaleX,
        height: layer.height * scaleY,
        strokeWidth: layer.strokeWidth * average,
        radius: layer.radius * average,
      };
    }
    return layer;
  });

  return { ...doc, width: nextWidth, height: nextHeight, layers, selection: null };
}

function rotateRasterCanvas(source: HTMLCanvasElement, turns: 1 | -1 | 2): HTMLCanvasElement {
  const quarter = Math.abs(turns) === 1;
  const width = quarter ? source.height : source.width;
  const height = quarter ? source.width : source.height;
  const { canvas, ctx } = createCanvas(width, height);
  ctx.translate(width / 2, height / 2);
  ctx.rotate((turns * Math.PI) / 2);
  ctx.translate(-source.width / 2, -source.height / 2);
  ctx.drawImage(source, 0, 0);
  return canvas;
}

export function rotateDocument(doc: EditorDocument, direction: "cw" | "ccw" | "180"): EditorDocument {
  const width = direction === "180" ? doc.width : doc.height;
  const height = direction === "180" ? doc.height : doc.width;
  const radians = direction === "cw" ? Math.PI / 2 : direction === "ccw" ? -Math.PI / 2 : Math.PI;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const transform = (point: EditorPoint): EditorPoint => ({
    x: doc.width / 2 + (point.x - doc.width / 2) * cos - (point.y - doc.height / 2) * sin,
    y: doc.height / 2 + (point.x - doc.width / 2) * sin + (point.y - doc.height / 2) * cos,
  });

  const layers = doc.layers.map((layer) => {
    const remap = remapLayerAnchor(layer, doc, width, height, transform, radians);
    if (layer.kind === "raster") {
      const turns = direction === "cw" ? 1 : direction === "ccw" ? -1 : 2;
      return { ...layer, ...remap, canvas: rotateRasterCanvas(layer.canvas, turns) };
    }
    return { ...layer, ...remap };
  });

  return { ...doc, width, height, layers, selection: null };
}

export function flipDocument(doc: EditorDocument, axis: "horizontal" | "vertical"): EditorDocument {
  const layers = doc.layers.map((layer) => {
    const mirrored = { ...layer };
    if (axis === "horizontal") {
      mirrored.x = -layer.x;
      mirrored.rotation = -layer.rotation;
    } else {
      mirrored.y = -layer.y;
      mirrored.rotation = -layer.rotation;
    }
    if (layer.kind === "raster") {
      const { canvas, ctx } = createCanvas(layer.canvas.width, layer.canvas.height);
      if (axis === "horizontal") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      } else {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      }
      ctx.drawImage(layer.canvas, 0, 0);
      return { ...mirrored, canvas };
    }
    if (layer.kind === "text" || layer.kind === "shape") {
      if (axis === "horizontal") mirrored.scaleX = -layer.scaleX;
      else mirrored.scaleY = -layer.scaleY;
    }
    return mirrored;
  });

  return { ...doc, layers, selection: null };
}

/* ------------------------------------------------------------------ */
/* PSD import / export                                                */
/* ------------------------------------------------------------------ */

const PSD_BLEND_FROM: Record<string, EditorBlendMode> = {
  normal: "normal",
  darken: "darken",
  multiply: "multiply",
  "color burn": "color-burn",
  "linear burn": "multiply",
  "darker color": "darken",
  lighten: "lighten",
  screen: "screen",
  "color dodge": "color-dodge",
  "linear dodge": "screen",
  "lighter color": "lighten",
  overlay: "overlay",
  "soft light": "soft-light",
  "hard light": "hard-light",
  "vivid light": "overlay",
  "linear light": "overlay",
  "pin light": "overlay",
  "hard mix": "overlay",
  difference: "difference",
  exclusion: "exclusion",
  subtract: "difference",
  divide: "normal",
  hue: "hue",
  saturation: "saturation",
  color: "color",
  luminosity: "luminosity",
};

const PSD_BLEND_TO: Record<EditorBlendMode, PsdBlendMode> = {
  normal: "normal",
  multiply: "multiply",
  screen: "screen",
  overlay: "overlay",
  darken: "darken",
  lighten: "lighten",
  "color-dodge": "color dodge",
  "color-burn": "color burn",
  "hard-light": "hard light",
  "soft-light": "soft light",
  difference: "difference",
  exclusion: "exclusion",
  hue: "hue",
  saturation: "saturation",
  color: "color",
  luminosity: "luminosity",
};

interface PsdImportResult {
  doc: EditorDocument;
  skipped: number;
}

export async function importPsdFile(file: File): Promise<PsdImportResult> {
  const { readPsd } = await import("ag-psd");
  const psd = readPsd(await file.arrayBuffer(), {
    skipThumbnail: true,
    skipLinkedFilesData: true,
    logMissingFeatures: false,
  });

  const width = psd.width;
  const height = psd.height;
  const layers: EditorLayer[] = [];
  let skipped = 0;

  const walk = (children: PsdLayer[] | undefined) => {
    if (!children) return;
    children.forEach((child) => {
      if (child.sectionDivider && child.sectionDivider.type !== 0) {
        walk(child.children);
        return;
      }
      if (child.children) {
        walk(child.children);
        return;
      }
      if (!child.canvas) {
        skipped += 1;
        return;
      }
      const { canvas, ctx } = createCanvas(width, height);
      ctx.drawImage(child.canvas, child.left ?? 0, child.top ?? 0);
      layers.push({
        id: uid("layer"),
        name: child.name || "Layer",
        kind: "raster",
        visible: !child.hidden,
        locked: Boolean(child.transparencyProtected),
        opacity: clamp((child.opacity ?? 255) / 255, 0, 1),
        blend: PSD_BLEND_FROM[child.blendMode ?? "normal"] ?? "normal",
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        canvas,
      });
    });
  };

  walk(psd.children);

  if (!layers.length) {
    const { canvas, ctx } = createCanvas(width, height);
    if (psd.canvas) ctx.drawImage(psd.canvas, 0, 0);
    layers.push({
      id: uid("layer"),
      name: "Background",
      kind: "raster",
      visible: true,
      locked: false,
      opacity: 1,
      blend: "normal",
      x: 0,
      y: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      canvas,
    });
  }

  return {
    doc: {
      name: file.name.replace(/\.[^.]+$/, "") || "Untitled",
      width,
      height,
      layers,
      activeLayerId: layers[layers.length - 1]?.id ?? null,
      selection: null,
    },
    skipped,
  };
}

export async function exportPsdFile(
  doc: EditorDocument,
  flattenAdjustments: boolean
): Promise<{ blob: Blob; flattened: boolean }> {
  const { writePsd } = await import("ag-psd");
  const hasAdjustment = doc.layers.some((layer) => layer.kind === "adjustment" && layer.visible);
  const flattened = flattenAdjustments && hasAdjustment;

  if (flattened) {
    const canvas = renderCompositeCanvas(doc);
    const buffer = writePsd(
      {
        width: doc.width,
        height: doc.height,
        children: [
          {
            name: doc.name || "Flattened",
            canvas,
            left: 0,
            top: 0,
            opacity: 255,
            blendMode: "normal",
            hidden: false,
          },
        ],
      },
      { generateThumbnail: true, compress: true }
    );
    return { blob: new Blob([buffer], { type: "image/vnd.adobe.photoshop" }), flattened };
  }

  const children: PsdLayer[] = [];
  doc.layers.forEach((layer) => {
    if (layer.kind === "adjustment") return;
    const canvas = renderLayerCanvas(layer, doc);
    if (!canvas) return;
    children.push({
      name: layer.name,
      canvas,
      left: 0,
      top: 0,
      opacity: Math.round(layer.opacity * 255),
      blendMode: PSD_BLEND_TO[layer.blend],
      hidden: !layer.visible,
      transparencyProtected: layer.locked,
    });
  });

  const buffer = writePsd(
    { width: doc.width, height: doc.height, children },
    { generateThumbnail: true, compress: true }
  );
  return { blob: new Blob([buffer], { type: "image/vnd.adobe.photoshop" }), flattened };
}

/* ------------------------------------------------------------------ */
/* Misc                                                               */
/* ------------------------------------------------------------------ */

export function fitWithin(width: number, height: number, max: number) {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function limitDimension(width: number, height: number) {
  return fitWithin(width, height, EDITOR_MAX_DIMENSION);
}

export function hexFromRgb(r: number, g: number, b: number) {
  return rgbToHex(r, g, b);
}
