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

// ---------- helpers ----------
const A4 = { wMm: 210, hMm: 297 };
const PX_PER_MM = 96 / 25.4;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function waitForIframeAssets(doc: Document) {
  // fonts
  try {
    // @ts-ignore
    if (doc.fonts?.ready) {
      // @ts-ignore
      await doc.fonts.ready;
    }
  } catch {}

  // images
  const imgs = Array.from(doc.images ?? []);
  await Promise.all(
    imgs.map(async (img) => {
      try {
        // decode is best when supported
        // @ts-ignore
        if (img.decode) await img.decode();
      } catch {
        // fallback: wait for load/error
        await new Promise<void>((resolve) => {
          if (img.complete) return resolve();
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      }
    })
  );
}

async function renderPageByPageToPdf(iframeDoc: Document, pdf: any) {
  const html2canvas = (await import("html2canvas")).default;

  const pageWidthPx = Math.round(A4.wMm * PX_PER_MM); // ~794
  const pageHeightPx = Math.round(A4.hMm * PX_PER_MM); // ~1123

  const contentEl = iframeDoc.getElementById("tm-content");
  const pageEl = iframeDoc.getElementById("tm-page");

  if (!contentEl || !pageEl) {
    throw new Error("PDF renderer: page/content container not found.");
  }

  // total pages
  const contentHeight = contentEl.scrollHeight;
  const totalPages = Math.max(1, Math.ceil(contentHeight / pageHeightPx));

  const overlapPx = 24;

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    const offsetY = pageIndex * (pageHeightPx - overlapPx);
    (contentEl as HTMLElement).style.transform = `translateY(-${offsetY}px)`;

    // Let layout settle
    await sleep(50);

    const canvas = await html2canvas(pageEl as HTMLElement, {
      backgroundColor: "#ffffff",
      scale: 2, // you can make this 1.5 on low-end devices
      useCORS: true,
      logging: false,
      width: pageWidthPx,
      height: pageHeightPx,
      windowWidth: pageWidthPx,
      windowHeight: pageHeightPx,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, A4.wMm, A4.hMm);
  }

  // reset transform
  (contentEl as HTMLElement).style.transform = "translateY(0)";
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
    if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
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

      const result = await mammoth.convertToHtml({ arrayBuffer });
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
      iframe.style.width = `${Math.round(A4.wMm * PX_PER_MM)}px`;
      iframe.style.height = `${Math.round(A4.hMm * PX_PER_MM)}px`;
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error(content.ui.errors.iframeAccess);

      const pageWidthPx = Math.round(A4.wMm * PX_PER_MM); // ~794
      const pageHeightPx = Math.round(A4.hMm * PX_PER_MM); // ~1123

      iframeDoc.open();
      iframeDoc.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; background: white; color: black; }

    /* Page viewport (A4 in px) */
    #tm-page{
      width: ${pageWidthPx}px;
      height: ${pageHeightPx}px;
      overflow: hidden;
      background: #fff;
      position: relative;
    }
#tm-content p,
#tm-content h1,
#tm-content h2,
#tm-content h3,
#tm-content h4,
#tm-content h5,
#tm-content h6,
#tm-content li,
#tm-content tr,
#tm-content img {
  page-break-inside: avoid;
  break-inside: avoid;
}



    /* Actual content */
    #tm-content{
      width: ${pageWidthPx}px;
      padding: 40px;
      font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
      font-size: 14px;
      line-height: 1.8;
      color: #000;
      direction: auto;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      transform: translateY(0);
      will-change: transform;
    }

    p { margin: 0 0 12px 0; text-align: justify; }
    h1,h2,h3,h4,h5,h6 { margin: 16px 0 8px 0; font-weight: 700; }
    ul,ol { margin: 12px 0; padding-right: 20px; }
    li { margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    td,th { border: 1px solid #ddd; padding: 8px; }
    img { max-width: 100%; height: auto; }

    /* Optional: keep long words/URLs from breaking layout */
    #tm-content { overflow-wrap: anywhere; word-break: break-word; }
  </style>
</head>
<body>
  <div id="tm-page">
    <div id="tm-content">${htmlPreview}</div>
  </div>
</body>
</html>`);
      iframeDoc.close();

      await waitForIframeAssets(iframeDoc);

      setProgressStep("generating");

      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF("p", "mm", "a4");

      await renderPageByPageToPdf(iframeDoc, pdf);

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
      if (iframe && iframe.parentNode) document.body.removeChild(iframe);
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && previewFullscreen) setPreviewFullscreen(false);
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
      setTimeout(() => fullscreenContentRef.current?.focus(), 100);
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
                      {content.ui.buttons.manualDownload ?? "Download PDF"}
                    </button>
                    <button
                      onClick={convertToPdf}
                      disabled={isConverting}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium border ${theme.border} ${theme.card} ${theme.text} transition-all disabled:opacity-50`}
                    >
                      {content.ui.buttons.convertAgain ?? "Convert again"}
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

          {/* Preview panel (unchanged) */}
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
                {content.ui.preview?.title ?? "Word preview"}
              </span>
              <div className="flex items-center gap-2">
                {isPreviewReady && (
                  <span className="hidden sm:inline-flex text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                    {content.ui.preview?.liveLabel ?? "Live preview"}
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
                  dangerouslySetInnerHTML={{ __html: htmlPreview }}
                />
              ) : (
                <div
                  className={`h-full flex items-center justify-center text-sm ${theme.textMuted}`}
                >
                  {content.ui.preview?.empty ??
                    "After selecting a Word file, its preview will appear here."}
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
