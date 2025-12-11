// src/components/tools/image/image-to-svg/image-to-svg.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download,
  Upload,
  AlertCircle,
  FileImage,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import ImageTracer from "imagetracerjs";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useImageToSvgContent,
  type ImageToSvgToolContent,
} from "./image-to-svg.content";

type ProgressStep =
  | "idle"
  | "reading"
  | "converting"
  | "rendering"
  | "generating"
  | "success";

// نسخه ساده‌شده بدون پارامتر options برای جلوگیری از خطای spread
async function bitmapFileToSvgString(file: File): Promise<string> {
  const img = new Image();
  const url = URL.createObjectURL(file);

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (e) => reject(e);
    img.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(url);
    throw new Error("Canvas context is not available.");
  }

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // تنظیمات پیش‌فرض ImageTracerJS
  const svgString = ImageTracer.imagedataToSVG(imageData, {
    ltres: 1,
    qtres: 1,
    numberofcolors: 16,
    blurradius: 0,
  });

  URL.revokeObjectURL(url);
  return svgString;
}

export default function ImageToSvgConverter() {
  const theme = useThemeColors();
  const content: ImageToSvgToolContent = useImageToSvgContent();

  const [previewFullscreen, setPreviewFullscreen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(
    null
  );

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [progressStep, setProgressStep] = useState<ProgressStep>("idle");

  const [svgString, setSvgString] = useState<string>("");
  const [svgBlobUrl, setSvgBlobUrl] = useState<string | null>(null);
  const [svgFileName, setSvgFileName] = useState<string>("vector.svg");

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContentRef = useRef<HTMLDivElement | null>(null);

  const resetOutput = () => {
    if (svgBlobUrl) {
      URL.revokeObjectURL(svgBlobUrl);
    }
    setSvgBlobUrl(null);
    setSvgString("");
    setSvgFileName("vector.svg");
    setProgressStep("idle");
  };

  const resetAll = () => {
    setSelectedFile(null);
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    setOriginalPreviewUrl(null);
    setError("");
    resetOutput();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mime = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    const isImage =
      mime.startsWith("image/") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".png") ||
      name.endsWith(".webp");

    if (!isImage) {
      setError(content.ui.errors.invalidType);
      resetAll();
      return;
    }

    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }

    const url = URL.createObjectURL(file);

    setSelectedFile(file);
    setOriginalPreviewUrl(url);
    setError("");
    resetOutput();
    setProgressStep("reading");
  };

  const convertToSvg = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setError("");
    setProgressStep("converting");
    resetOutput();

    try {
      setProgressStep("rendering");
      const svg = await bitmapFileToSvgString(selectedFile);
      setProgressStep("generating");

      setSvgString(svg);

      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const baseName =
        selectedFile.name.replace(/\.(jpg|jpeg|png|webp)$/i, "") ||
        "vector-image";

      setSvgBlobUrl(url);
      setSvgFileName(`${baseName}.svg`);
      setProgressStep("success");
    } catch (err) {
      console.error("Image to SVG conversion error:", err);
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : content.ui.errors.unknown;
      setError(`${content.ui.errors.genericPrefix} ${message}`);
      setProgressStep("idle");
    } finally {
      setIsConverting(false);
    }
  };

  const handleManualDownload = () => {
    if (!svgBlobUrl) return;
    const a = document.createElement("a");
    a.href = svgBlobUrl;
    a.download = svgFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const progressMessage =
    progressStep === "idle" ? "" : content.ui.progress[progressStep];

  const progressWidth = (() => {
    switch (progressStep) {
      case "reading":
        return "20%";
      case "converting":
        return "40%";
      case "rendering":
        return "60%";
      case "generating":
        return "80%";
      case "success":
        return "100%";
      default:
        return "0%";
    }
  })();

  const showProgress = progressStep !== "idle";

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewFullscreen) {
        setPreviewFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [previewFullscreen]);

  useEffect(
    () => () => {
      if (svgBlobUrl) URL.revokeObjectURL(svgBlobUrl);
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    },
    [svgBlobUrl, originalPreviewUrl]
  );

  useEffect(() => {
    if (previewFullscreen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        if (fullscreenContentRef.current) {
          fullscreenContentRef.current.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [previewFullscreen]);

  return (
    <>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          {/* ستون چپ – هشدار، آپلود و کنترل‌ها */}
          <div className="space-y-4">
            {/* هشدار ابعاد و عملکرد */}
            <div
              className={`
                p-4 rounded-lg border flex gap-3 text-sm
                ${theme.note.warningBg} ${theme.note.warningBorder} ${theme.note.warningText}
              `}
            >
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">
                  {content.ui.alerts.heavyImageTitle}
                </p>
                <p>{content.ui.alerts.heavyImageBody}</p>
                <p className="mt-1">{content.ui.alerts.heavyImageNote}</p>
              </div>
            </div>

            {/* باکس آپلود */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${theme.border} hover:opacity-80`}
            >
              <input
                type="file"
                accept="image/*,.jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload"
                disabled={isConverting}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer block w-full h-full"
              >
                <Upload
                  className={`mx-auto h-12 w-12 mb-4 ${theme.textMuted}`}
                />
                <p className={`text-lg font-medium ${theme.text}`}>
                  {content.ui.upload.title}
                </p>
                <p className={`text-sm mt-2 ${theme.textMuted}`}>
                  {content.ui.upload.subtitle}
                </p>
              </label>
            </div>

            {/* اطلاعات فایل انتخاب‌شده */}
            {selectedFile && (
              <div
                className={`p-4 rounded-lg border flex items-center justify-between transition-colors duration-300 ${theme.card} ${theme.border}`}
              >
                <div className="flex items-center gap-3">
                  <FileImage className={theme.accent} size={24} />
                  <div>
                    <p className={`font-medium ${theme.text}`}>
                      {selectedFile.name}
                    </p>
                    <p className={`text-sm ${theme.textMuted}`}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                      {content.ui.file.sizeUnit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetAll}
                  disabled={isConverting}
                  className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
                  title={content.ui.file.removeTitle}
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* خطاها */}
            {error && (
              <div className="p-4 rounded-lg border border-red-300 bg-red-50 flex gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-600 flex-shrink-0 mt-0.5"
                />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            {/* نوار پیشرفت */}
            {showProgress && (
              <div
                className={`p-4 rounded-lg border ${theme.secondary} ${theme.border}`}
              >
                <p className={`text-sm font-medium mb-2 ${theme.text}`}>
                  {progressMessage}
                </p>
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
                    style={{
                      width: progressWidth,
                      animation:
                        progressStep === "success"
                          ? "none"
                          : "pulse 1.5s infinite",
                    }}
                  />
                </div>
              </div>
            )}

            {/* دکمه‌های تبدیل و دانلود */}
            {selectedFile && (
              <div className="space-y-3">
                {progressStep !== "success" && (
                  <button
                    onClick={convertToSvg}
                    disabled={isConverting}
                    className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
                  >
                    <Download size={18} />
                    {isConverting
                      ? content.ui.buttons.convertLoading
                      : content.ui.buttons.convertIdle}
                  </button>
                )}

                {svgBlobUrl && progressStep === "success" && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleManualDownload}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${theme.primary}`}
                    >
                      <Download size={18} />
                      {content.ui.buttons.manualDownload ?? "دانلود فایل SVG"}
                    </button>
                    <button
                      onClick={convertToSvg}
                      disabled={isConverting}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium border ${theme.border} ${theme.card} ${theme.text} transition-all disabled:opacity-50`}
                    >
                      {content.ui.buttons.convertAgain ??
                        "تبدیل مجدد با تنظیمات فعلی"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* راهنما */}
            <div
              className={`p-4 rounded-lg border ${theme.secondary} ${theme.border}`}
            >
              <h3 className={`font-medium mb-3 ${theme.text}`}>
                {content.ui.guide.title}
              </h3>
              <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
                {content.ui.guide.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* ستون راست – پیش‌نمایش تصویر و SVG */}
          <div
            ref={previewContainerRef}
            className={`
              rounded-xl border ${theme.border} ${theme.card}
              shadow-sm overflow-hidden flex flex-col min-h-[260px] max-h-[600px]
              transition-all duration-200
              ${
                previewFullscreen ? "fixed inset-0 z-[9999] m-0 max-h-none" : ""
              }
            `}
          >
            <div className="px-4 py-3 border-b border-slate-200/60 flex items-center justify-between gap-2 bg-white dark:bg-slate-900">
              <span className={`text-sm font-medium ${theme.text}`}>
                {content.ui.preview.title}
              </span>
              <div className="flex items-center gap-2">
                {(originalPreviewUrl || svgString) && (
                  <span className="hidden sm:inline-flex text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                    پیش‌نمایش زنده
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewFullscreen(!previewFullscreen)}
                  disabled={!originalPreviewUrl && !svgString}
                  className={`
                    inline-flex items-center justify-center
                    w-8 h-8 rounded-full
                    border ${theme.border} ${theme.card} ${theme.textMuted}
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:opacity-80 transition-all
                  `}
                  aria-label={
                    previewFullscreen
                      ? "Exit fullscreen preview"
                      : "Fullscreen preview"
                  }
                >
                  {previewFullscreen ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </button>
              </div>
            </div>

            <div
              ref={fullscreenContentRef}
              tabIndex={-1}
              className="flex-1 overflow-auto bg-white dark:bg-slate-900 px-6 py-5 focus:outline-none"
            >
              {originalPreviewUrl || svgString ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* تصویر اصلی */}
                  <div>
                    <p
                      className={`text-xs font-medium mb-2 uppercase tracking-wide ${theme.textMuted}`}
                    >
                      {content.ui.preview.originalTitle}
                    </p>
                    {originalPreviewUrl ? (
                      <img
                        src={originalPreviewUrl}
                        alt="تصویر اصلی"
                        className="w-full max-h-[420px] object-contain rounded-lg border border-slate-200/60 bg-white"
                      />
                    ) : (
                      <div
                        className={`h-[200px] rounded-lg border border-dashed flex items-center justify-center text-xs ${theme.textMuted}`}
                      >
                        تصویری انتخاب نشده است.
                      </div>
                    )}
                  </div>

                  {/* خروجی SVG */}
                  <div>
                    <p
                      className={`text-xs font-medium mb-2 uppercase tracking-wide ${theme.textMuted}`}
                    >
                      {content.ui.preview.svgTitle}
                    </p>
                    {svgString ? (
                      <div
                        className="w-full max-h-[420px] overflow-auto rounded-lg border border-slate-200/60 bg-white p-2"
                        dangerouslySetInnerHTML={{ __html: svgString }}
                      />
                    ) : (
                      <div
                        className={`h-[200px] rounded-lg border border-dashed flex items-center justify-center text-xs ${theme.textMuted}`}
                      >
                        هنوز SVG تولید نشده است.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  className={`h-full flex items-center justify-center text-sm ${theme.textMuted}`}
                >
                  {content.ui.preview.empty}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {previewFullscreen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
          onClick={() => setPreviewFullscreen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
