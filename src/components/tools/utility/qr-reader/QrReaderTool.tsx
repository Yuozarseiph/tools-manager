"use client";
import { AccessibleInput } from "@/components/ui/AccessibleControls";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  Check,
  ClipboardPaste,
  Copy,
  ExternalLink,
  QrCode,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import jsQR from "jsqr";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useQrReaderContent } from "./qr-reader.content";

type ResultType = "url" | "email" | "phone" | "wifi" | "text";

type ScanResult = {
  data: string;
  type: ResultType;
};

function classifyQr(data: string): ResultType {
  if (/^(https?:\/\/|www\.)/i.test(data)) return "url";
  if (/^mailto:/i.test(data)) return "email";
  if (/^tel:/i.test(data)) return "phone";
  if (/^WIFI:/i.test(data)) return "wifi";
  return "text";
}

function safeOpenUrl(data: string): string | null {
  const normalized = /^www\./i.test(data) ? `https://${data}` : data;
  try {
    const url = new URL(normalized);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function drawToCanvas(source: CanvasImageSource, width: number, height: number) {
  const maxSide = 4096;
  const maxPixels = 16_000_000;
  const sideScale = maxSide / Math.max(width, height);
  const pixelScale = Math.sqrt(maxPixels / Math.max(1, width * height));
  const scale = Math.min(1, sideScale, pixelScale);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function scanCanvas(canvas: HTMLCanvasElement): string | null {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const direct = jsQR(original.data, original.width, original.height, {
    inversionAttempts: "attemptBoth",
  });
  if (direct?.data) return direct.data;

  // High-contrast fallback improves small QR codes embedded in screenshots.
  const enhanced = new ImageData(
    new Uint8ClampedArray(original.data),
    original.width,
    original.height,
  );
  for (let i = 0; i < enhanced.data.length; i += 4) {
    const gray =
      enhanced.data[i] * 0.299 +
      enhanced.data[i + 1] * 0.587 +
      enhanced.data[i + 2] * 0.114;
    const value = gray > 145 ? 255 : 0;
    enhanced.data[i] = value;
    enhanced.data[i + 1] = value;
    enhanced.data[i + 2] = value;
  }
  const contrasted = jsQR(enhanced.data, enhanced.width, enhanced.height, {
    inversionAttempts: "attemptBoth",
  });
  return contrasted?.data ?? null;
}

async function imageFileToCanvas(file: File) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    try {
      return drawToCanvas(bitmap, bitmap.width, bitmap.height);
    } finally {
      bitmap.close();
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Image load failed"));
      image.src = url;
    });
    return drawToCanvas(image, image.naturalWidth, image.naturalHeight);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function QrReaderTool() {
  const theme = useThemeColors();
  const t = useQrReaderContent();

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const scanningRef = useRef(false);
  const lastFrameRef = useRef(0);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [copied, setCopied] = useState(false);

  const stopCamera = useCallback(() => {
    scanningRef.current = false;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  const resetImage = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFileName("");
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }, [previewUrl]);

  const applyResult = useCallback(
    (data: string | null) => {
      if (!data) {
        setResult(null);
        setError(t.noResult);
        return false;
      }
      setError("");
      setResult({ data, type: classifyQr(data) });
      return true;
    },
    [t.noResult],
  );

  const scanFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)) {
        setError(t.invalidType);
        return;
      }
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setFileName(file.name);
      setResult(null);
      setError("");
      try {
        const canvas = await imageFileToCanvas(file);
        applyResult(scanCanvas(canvas));
        canvas.width = 1;
        canvas.height = 1;
      } catch (err) {
        console.error("[qr-reader][image]", err);
        setError(t.noResult);
      }
    },
    [applyResult, previewUrl, stopCamera, t.invalidType, t.noResult],
  );

  const pasteImage = useCallback(async () => {
    setError("");
    try {
      if (!navigator.clipboard?.read) throw new Error("clipboard-unavailable");
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((value) => value.startsWith("image/"));
        if (!type) continue;
        const blob = await item.getType(type);
        const ext = type.split("/")[1]?.replace("jpeg", "jpg") || "png";
        await scanFile(new File([blob], `clipboard-${Date.now()}.${ext}`, { type }));
        return;
      }
      setError(t.clipboardError);
    } catch {
      setError(t.clipboardError);
    }
  }, [scanFile, t.clipboardError]);

  const scanCameraFrame = useCallback(
    (time: number) => {
      if (!scanningRef.current) return;
      const video = videoRef.current;
      const canvas = cameraCanvasRef.current;

      if (video && canvas && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (time - lastFrameRef.current >= 120 && video.videoWidth > 0 && video.videoHeight > 0) {
          lastFrameRef.current = time;
          const maxSide = 960;
          const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
          canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
          canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const found = scanCanvas(canvas);
            if (found) {
              applyResult(found);
              stopCamera();
              return;
            }
          }
        }
      }
      frameRef.current = requestAnimationFrame(scanCameraFrame);
    },
    [applyResult, stopCamera],
  );

  const startCamera = useCallback(async () => {
    resetImage();
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      scanningRef.current = true;
      setScanning(true);
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      videoRef.current.setAttribute("playsinline", "true");
      await videoRef.current.play();
      frameRef.current = requestAnimationFrame(scanCameraFrame);
    } catch (err) {
      console.error("[qr-reader][camera]", err);
      stopCamera();
      setError(t.cameraError);
    }
  }, [resetImage, scanCameraFrame, stopCamera, t.cameraError]);

  const copyResult = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.data);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }, [result]);

  useEffect(() => {
    return () => {
      scanningRef.current = false;
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const openUrl = result?.type === "url" ? safeOpenUrl(result.data) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="space-y-4">
        <AccessibleInput
          ref={inputRef}
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && scanFile(e.target.files[0])}
        />

        {!previewUrl && !scanning ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) scanFile(dropped);
            }}
            className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${theme.border} ${theme.bg} hover:border-[var(--app-accent)]`}
          >
            <UploadCloud size={42} className={`mx-auto mb-4 ${theme.accent}`} />
            <p className={`text-lg font-bold ${theme.text}`}>{t.uploadTitle}</p>
            <p className={`text-sm mt-2 ${theme.textMuted}`}>{t.uploadHint}</p>
            <span className={`inline-flex mt-4 px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}>
              {t.selectImage}
            </span>
          </div>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={pasteImage}
            disabled={scanning}
            className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border disabled:opacity-50 ${theme.border} ${theme.card} ${theme.text}`}
          >
            <ClipboardPaste size={18} /> {t.pasteImage}
          </button>
          <button
            type="button"
            onClick={scanning ? stopCamera : startCamera}
            className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold ${scanning ? "bg-red-500 text-white" : theme.primary}`}
          >
            <Camera size={18} /> {scanning ? t.stopCamera : t.camera}
          </button>
        </div>

        {error && (
          <div role="alert" className="p-4 rounded-xl border border-[var(--app-error-border)] bg-[var(--app-error-bg)] flex gap-3 text-[var(--app-error-text)]">
            <AlertCircle size={19} className="shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className={`p-4 rounded-xl border text-sm ${theme.secondary} ${theme.border} ${theme.textMuted}`}>
          {t.privacy}
        </div>
      </div>

      <div className="space-y-4">
        <div className={`rounded-2xl border overflow-hidden ${theme.card} ${theme.border}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${theme.border}`}>
            <span className={`text-sm font-medium ${theme.text}`}>
              {scanning ? t.scanning : fileName || t.selectImage}
            </span>
            {(previewUrl || result) && !scanning && (
              <button
                type="button"
                onClick={resetImage}
                className={`inline-flex items-center gap-1.5 text-xs ${theme.textMuted}`}
              >
                <RotateCcw size={14} /> {t.scanAnother}
              </button>
            )}
          </div>

          <div className="relative min-h-[320px] bg-black flex items-center justify-center overflow-hidden">
            {scanning ? (
              <>
                <video ref={videoRef} className="w-full max-h-[520px] object-contain" muted />
                <canvas ref={cameraCanvasRef} className="hidden" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 sm:w-64 sm:h-64 border-2 border-white/80 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,.28)]" />
                </div>
              </>
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt={fileName || "QR image"} className="w-full max-h-[520px] object-contain bg-white" />
            ) : (
              <QrCode size={72} className="text-white/25" />
            )}
          </div>
        </div>

        {result && (
          <div role="status" aria-live="polite" className={`rounded-2xl border overflow-hidden ${theme.card} ${theme.border}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 ${theme.border}`}>
              <div>
                <p className={`text-sm font-bold ${theme.text}`}>{t.result}</p>
                <p className={`text-xs mt-1 ${theme.textMuted}`}>
                  {t.type}: {t.types[result.type]}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border ${theme.border} ${theme.text}`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? t.copied : t.copy}
                </button>
                {openUrl && (
                  <a
                    href={openUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs ${theme.primary}`}
                  >
                    <ExternalLink size={14} /> {t.openLink}
                  </a>
                )}
              </div>
            </div>
            <div className={`p-4 whitespace-pre-wrap break-all ${theme.text}`} dir="auto">
              {result.data}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
