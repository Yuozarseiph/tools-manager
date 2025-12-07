"use client";

import { useState } from "react";
import { Download, Upload, AlertCircle, FileText, X } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import * as mammoth from "mammoth";

import {
  useToolContent,
  type WordToPdfToolContent,
} from "@/hooks/useToolContent";

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

type ProgressStepType = ProgressStep;

export default function WordToPdfConverter() {
  const theme = useThemeColors();
  const content = useToolContent<WordToPdfToolContent>("word-to-pdf");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [progressStep, setProgressStep] = useState<ProgressStepType>("idle");

  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("document.pdf");

  const resetPdfState = () => {
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
    setPdfBlobUrl(null);
    setPdfFileName("document.pdf");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isDocx =
      name.endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isDocx) {
      setError(content.ui.errors.invalidType);
      setSelectedFile(null);
      resetPdfState();
      return;
    }

    setSelectedFile(file);
    setError("");
    setProgressStep("idle");
    resetPdfState();
  };

  const convertToPdf = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setError("");
    setProgressStep("reading");
    resetPdfState();

    let iframe: HTMLIFrameElement | null = null;

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      setProgressStep("converting");
      const result = await mammoth.convertToHtml({
        arrayBuffer,
      });
      const html = result.value;

      if (result.messages && result.messages.length > 0) {
        console.warn("Mammoth messages:", result.messages);
      }

      if (!html || !html.trim()) {
        setError(content.ui.errors.emptyContent);
        setIsConverting(false);
        setProgressStep("idle");
        return;
      }

      setProgressStep("rendering");

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
          ${html}
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

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* آپلود */}
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
          <Upload className={`mx-auto h-12 w-12 mb-4 ${theme.textMuted}`} />
          <p className={`text-lg font-medium ${theme.text}`}>
            {content.ui.upload.title}
          </p>
          <p className={`text-sm mt-2 ${theme.textMuted}`}>
            {content.ui.upload.subtitle}
          </p>
        </label>
      </div>

      {/* فایل انتخاب‌شده */}
      {selectedFile && (
        <div
          className={`p-4 rounded-lg border flex items-center justify بین transition-colors duration-300 ${theme.card} ${theme.border}`}
        >
          <div className="flex items-center gap-3">
            <FileText className={theme.accent} size={24} />
            <div>
              <p className={`font-medium ${theme.text}`}>{selectedFile.name}</p>
              <p className={`text-sm ${theme.textMuted}`}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                {content.ui.file.sizeUnit}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null);
              setProgressStep("idle");
              resetPdfState();
            }}
            disabled={isConverting}
            className="text-red-500 hover:text-red-700 پ-2 disabled:opacity-50"
            title={content.ui.file.removeTitle}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* خطا */}
      {error && (
        <div className="p-4 rounded-lg border border-red-300 bg-red-50 flex gap-3">
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* پیشرفت */}
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
                  progressStep === "success" ? "none" : "pulse 1.5s infinite",
              }}
            />
          </div>
        </div>
      )}

      {/* دکمه تبدیل */}
      {selectedFile && progressStep !== "success" && (
        <button
          onClick={convertToPdf}
          disabled={isConverting}
          className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
        >
          <Download size={18} />
          {isConverting
            ? content.ui.buttons.convertLoading
            : content.ui.buttons.convertIdle}
        </button>
      )}

      {/* دکمه دانلود دستی بعد از موفقیت */}
      {pdfBlobUrl && progressStep === "success" && (
        <button
          onClick={handleManualDownload}
          className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${theme.primary}`}
        >
          <Download size={18} />
          {content.ui.buttons.manualDownload ?? "دانلود فایل PDF"}
        </button>
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
  );
}
