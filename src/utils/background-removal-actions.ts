// utils/background-removal-actions.ts

import { removeBackground } from "rembg-webgpu";

export interface RemovalOptions {
  quality?: "high" | "medium" | "low";
  format?: "image/png" | "image/webp";
}

export interface RemovalResult {
  original: File;
  processedUrl: string;
  processedBlob: Blob;
  filename: string;
}

const originalWarn = console.warn;
const originalError = console.error;

function suppressONNXWarnings() {
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || "";
    if (
      message.includes("VerifyEachNodeIsAssignedToAnEp") ||
      message.includes("onnxruntime") ||
      message.includes("execution providers")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || "";
    if (
      message.includes("onnxruntime") ||
      message.includes("session_state.cc")
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}

function restoreConsole() {
  console.warn = originalWarn;
  console.error = originalError;
}

export async function removeImageBackground(
  file: File,
  options: RemovalOptions = {},
  onProgress?: (progress: number) => void
): Promise<RemovalResult> {
  const { quality = "medium", format = "image/png" } = options;

  const url = URL.createObjectURL(file);

  try {
    suppressONNXWarnings();

    onProgress?.(10);

    const result = await removeBackground(url);

    onProgress?.(50);

    const response = await fetch(result.blobUrl);
    const blob = await response.blob();

    onProgress?.(70);

    let finalBlob = blob;
    if (format === "image/webp") {
      finalBlob = await convertToWebP(blob);
    }

    onProgress?.(90);

    const ext = format.split("/")[1];
    const newName =
      file.name.substring(0, file.name.lastIndexOf(".")) + "-nobg." + ext;

    URL.revokeObjectURL(url);
    URL.revokeObjectURL(result.blobUrl);

    onProgress?.(100);

    return {
      original: file,
      processedUrl: URL.createObjectURL(finalBlob),
      processedBlob: finalBlob,
      filename: newName,
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  } finally {
    restoreConsole();
  }
}

async function convertToWebP(blob: Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const imgUrl = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context failed"));
        URL.revokeObjectURL(imgUrl);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (webpBlob) => {
          URL.revokeObjectURL(imgUrl);
          if (webpBlob) resolve(webpBlob);
          else reject(new Error("WebP conversion failed"));
        },
        "image/webp",
        0.95
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(imgUrl);
      reject(new Error("Image load failed"));
    };

    img.src = imgUrl;
  });
}

export async function removeBackgroundBatch(
  files: File[],
  options: RemovalOptions = {},
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<RemovalResult[]> {
  const results: RemovalResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await removeImageBackground(
      files[i],
      options,
      (fileProgress) => {
        onProgress?.(i, fileProgress);
      }
    );

    results.push(result);
  }

  return results;
}
