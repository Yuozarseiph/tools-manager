"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download,
  Upload,
  AlertCircle,
  FileText,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import * as mammoth from "mammoth";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useWordToPdfContent,
  type WordToPdfToolContent,
} from "./word-to-pdf.content";

type ProgressStep =
  | "idle"
  | "reading"
  | "converting"
  | "rendering"
  | "generating"
  | "success";

async function renderInChunksToPdf(
  iframeBody: HTMLElement,
  pdf: any,
  pageWidthMm: number,
  pageHeightMm: number
) {
  const html2canvas = (await import("html2canvas")).default;

  const pxPerMm = 96 / 25.4;
  const pageWidthPx = pageWidthMm * pxPerMm;

  const totalHeightPx = iframeBody.scrollHeight;
  const maxChunkHeightPx = 4000;

  let currentOffsetPx = 0;
  let isFirstPage = true;

  while (currentOffsetPx < totalHeightPx) {
    const remaining = totalHeightPx - currentOffsetPx;
    const chunkHeight = Math.min(remaining, maxChunkHeightPx);

    const canvas = await html2canvas(iframeBody, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: pageWidthPx,
      height: chunkHeight,
      windowWidth: pageWidthPx,
      windowHeight: chunkHeight,
      scrollY: -currentOffsetPx,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    let positionMm = 0;
    let heightLeftMm = imgHeightMm;

    while (heightLeftMm > 0) {
      if (!isFirstPage) {
        pdf.addPage();
      } else {
        isFirstPage = false;
      }

      pdf.addImage(imgData, "JPEG", 0, positionMm, imgWidthMm, imgHeightMm);

      heightLeftMm -= pageHeightMm;
      positionMm -= pageHeightMm;
    }

    currentOffsetPx += chunkHeight;
  }
}

export default function WordToPdfConverter() {
  const theme = useThemeColors();
  const content: WordToPdfToolContent = useWordToPdfContent();

  const [previewFullscreen, setPreviewFullscreen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [progressStep, setProgressStep] = useState<ProgressStep>("idle");

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("document.pdf");

  const [htmlPreview, setHtmlPreview] = useState<string>("");
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  const previewContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContentRef = useRef<HTMLDivElement | null>(null);

  const resetPdfState = () => {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
    setPdfBlobUrl(null);
    setPdfFileName("document.pdf");
    setProgressStep("idle");
  };

  const resetAll = () => {
    setSelectedFile(null);
    setHtmlPreview("");
    setIsPreviewReady(false);
    setError("");
    resetPdfState();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isDocx =
      name.endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isDocx) {
      setError(content.ui.errors.invalidType);
      resetAll();
      return;
    }

    setSelectedFile(file);
    setError("");
    resetPdfState();
    setProgressStep("reading");

    try {
      const arrayBuffer = await file.arrayBuffer();
      setProgressStep("converting");

      const result = await mammoth.convertToHtml({
        arrayBuffer,
      });
      const html = result.value;

      if (!html || !html.trim()) {
        setError(content.ui.errors.emptyContent);
        setProgressStep("idle");
        return;
      }

      setHtmlPreview(html);
      setIsPreviewReady(true);
      setProgressStep("idle");
    } catch (err) {
      console.error("Preview conversion error:", err);
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : content.ui.errors.unknown;
      setError(`${content.ui.errors.genericPrefix} ${message}`);
      setProgressStep("idle");
    }
  };

  const convertToPdf = async () => {
    if (!selectedFile || !isPreviewReady || !htmlPreview) return;

    setIsConverting(true);
    setError("");
    setProgressStep("rendering");
    resetPdfState();

    let iframe: HTMLIFrameElement | null = null;

    try {
      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.style.width = "794px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error(content.ui.errors.iframeAccess);
      }

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: 794px;
              padding: 40px;
              background: white;
              color: black;
              font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
              font-size: 14px;
              line-height: 1.8;
              direction: auto;
            }
            p {
              margin-bottom: 12px;
              text-align: justify;
            }
            h1, h2, h3, h4, h5, h6 {
              margin: 16px 0 8px 0;
              font-weight: bold;
            }
            ul, ol {
              margin: 12px 0;
              padding-right: 20px;
            }
            li {
              margin-bottom: 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            table td, table th {
              border: 1px solid #ddd;
              padding: 8px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            strong {
              font-weight: bold;
            }
            em {
              font-style: italic;
            }
          </style>
        </head>
        <body>
          ${htmlPreview}
        </body>
        </html>
      `);
      iframeDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 500));

      setProgressStep("generating");

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");
      const iframeBody = iframeDoc.body;

      await renderInChunksToPdf(iframeBody, pdf, 210, 297);

      const pdfBlob = pdf.output("blob") as Blob;
      const url = URL.createObjectURL(pdfBlob);

      const baseName = selectedFile.name.replace(/\.docx$/i, "") || "document";

      setPdfBlobUrl(url);
      setPdfFileName(`${baseName}.pdf`);

      setProgressStep("success");
    } catch (err) {
      console.error("Conversion error:", err);
      const message =
        err instanceof Error
          ? `${err.name}: ${err.message}`
          : content.ui.errors.unknown;
      setError(`${content.ui.errors.genericPrefix} ${message}`);
      setProgressStep("idle");
    } finally {
      if (iframe && iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      setIsConverting(false);
    }
  };

  const handleManualDownload = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement("a");
    a.href = pdfBlobUrl;
    a.download = pdfFileName;
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

  // کلید Escape برای خروج از حالت تمام‌صفحه
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
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    },
    [pdfBlobUrl]
  );

  useEffect(() => {
    if (previewFullscreen) {
      document.body.style.overflow = "hidden";
      // فوکوس بر روی محتوای تمام‌صفحه
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
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${theme.border} hover:opacity-80`}
            >
              <input
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileSelect}
                className="hidden"
                id="word-upload"
                disabled={isConverting}
              />
              <label
                htmlFor="word-upload"
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

            {selectedFile && (
              <div
                className={`p-4 rounded-lg border flex items-center justify-between transition-colors duration-300 ${theme.card} ${theme.border}`}
              >
                <div className="flex items-center gap-3">
                  <FileText className={theme.accent} size={24} />
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

            {error && (
              <div className="p-4 rounded-lg border border-red-300 bg-red-50 flex gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-600 flex-shrink-0 mt-0.5"
                />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

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

            {selectedFile && (
              <div className="space-y-3">
                {progressStep !== "success" && (
                  <button
                    onClick={convertToPdf}
                    disabled={isConverting || !isPreviewReady}
                    className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
                  >
                    <Download size={18} />
                    {isConverting
                      ? content.ui.buttons.convertLoading
                      : content.ui.buttons.convertIdle}
                  </button>
                )}

                {pdfBlobUrl && progressStep === "success" && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleManualDownload}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${theme.primary}`}
                    >
                      <Download size={18} />
                      {content.ui.buttons.manualDownload ?? "دانلود فایل PDF"}
                    </button>
                    <button
                      onClick={convertToPdf}
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
                {content.ui.preview?.title ?? "پیش‌نمایش سند Word"}
              </span>
              <div className="flex items-center gap-2">
                {isPreviewReady && (
                  <span className="hidden sm:inline-flex text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                    {content.ui.preview?.liveLabel ?? "پیش‌نمایش زنده"}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setPreviewFullscreen(!previewFullscreen)}
                  disabled={!isPreviewReady}
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
              {isPreviewReady && htmlPreview ? (
                <div
                  className={`prose max-w-none rtl:prose-rtl dark:prose-invert ${
                    previewFullscreen ? "prose-lg" : "prose-sm"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: htmlPreview,
                  }}
                />
              ) : (
                <div
                  className={`h-full flex items-center justify-center text-sm ${theme.textMuted}`}
                >
                  {content.ui.preview?.empty ??
                    "پس از انتخاب فایل Word، پیش‌نمایش آن در این بخش نمایش داده می‌شود."}
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
