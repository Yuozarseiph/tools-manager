import { encodeBmp, encodeGif } from "./image-encoders";

export type ImageFormat =
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif"
  | "image/bmp"
  | "image/tiff"
  | "image/svg+xml"
  | "image/avif";

export interface ConversionOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/gif": "gif", "image/bmp": "bmp", "image/avif": "avif",
};

export function extensionFromImageMime(mime: string): string {
  const ext = EXTENSIONS[mime.toLowerCase()];
  if (!ext) throw new Error(`Unsupported output format: ${mime}`);
  return ext;
}

export function preferredRasterMime(mime: string): "image/jpeg" | "image/png" | "image/webp" {
  return mime === "image/jpeg" || mime === "image/webp" ? mime : "image/png";
}

export async function canvasToVerifiedBlob(canvas: HTMLCanvasElement, mime: string, quality = 0.9): Promise<Blob> {
  if (mime === "image/gif" || mime === "image/bmp") {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas context not available");
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    return mime === "image/gif" ? encodeGif(data) : encodeBmp(data);
  }
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(mime)) {
    throw new Error(`Unsupported output format: ${mime}`);
  }
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  if (!blob || blob.type.toLowerCase() !== mime) {
    throw new Error(`Your browser cannot encode ${mime} images`);
  }
  return blob;
}

export async function convertImage(file: File, format: ImageFormat, options: ConversionOptions = {}): Promise<Blob> {
  const { quality = 0.9, maxWidth, maxHeight } = options;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Failed to decode image"));
      image.src = url;
    });
    let width = img.naturalWidth;
    let height = img.naturalHeight;
    if (maxWidth && width > maxWidth) { height = height * maxWidth / width; width = maxWidth; }
    if (maxHeight && height > maxHeight) { width = width * maxHeight / height; height = maxHeight; }
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const pixels = canvas.width * canvas.height;
    const maxPixels = ["image/gif", "image/bmp"].includes(format) ? 10_000_000 : 40_000_000;
    if (pixels > maxPixels) throw new Error("Image exceeds safe pixel limit");
    const ctx = canvas.getContext("2d", { willReadFrequently: format === "image/gif" || format === "image/bmp" });
    if (!ctx) throw new Error("Canvas context not available");
    if (["image/jpeg", "image/bmp", "image/gif"].includes(format)) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return await canvasToVerifiedBlob(canvas, format, quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function convertImages(
  files: File[], format: ImageFormat, options?: ConversionOptions
): Promise<{ original: File; converted: Blob; filename: string }[]> {
  return Promise.all(files.map(async (file) => {
    const converted = await convertImage(file, format, options);
    const ext = extensionFromImageMime(converted.type);
    const basename = file.name.replace(/\.[^.]+$/, "") || "image";
    return { original: file, converted, filename: `${basename}.${ext}` };
  }));
}
