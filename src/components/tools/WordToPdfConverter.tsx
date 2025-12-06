"use client";

import { useState } from "react";
import {
  Download,
  Upload,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
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

export default function WordToPdfConverter() {
  const theme = useThemeColors();
  const content =
    useToolContent<WordToPdfToolContent>("word-to-pdf");

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState("");
  const [progressStep, setProgressStep] =
    useState<ProgressStep>("idle");

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isDocx =
      file.name.endsWith(".docx") ||
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (!isDocx) {
      setError(content.ui.errors.invalidType);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError("");
    setProgressStep("idle");
  };

  const convertToPdf = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setError("");
    setProgressStep("reading");

    let iframe: HTMLIFrameElement | null = null;

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();

      setProgressStep("converting");
      const result = await mammoth.convertToHtml({
        arrayBuffer,
      });
      const html = result.value;

      if (!html) {
        setError(content.ui.errors.emptyContent);
        setIsConverting(false);
        return;
      }

      setProgressStep("rendering");

      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.left = "-9999px";
      iframe.style.top = "0";
      iframe.style.width = "794px"; // A4 width at ~96dpi
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument ||
        iframe.contentWindow?.document;
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

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      );

      setProgressStep("generating");

      const { jsPDF } = await import("jspdf");
      const html2canvas = (
        await import("html2canvas")
      ).default;

      const iframeBody = iframeDoc.body;
      const canvas = await html2canvas(iframeBody, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 794,
        windowHeight: iframeBody.scrollHeight,
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight =
        (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let pageCount = 0;

      const imgData = canvas.toDataURL(
        "image/jpeg",
        0.95
      );

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        0,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pageCount++;
        pdf.addPage();
        const yPosition = -(pageHeight * pageCount);
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          yPosition,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      const fileName =
        selectedFile.name.replace(/\.docx$/i, "") ||
        "document";
      pdf.save(`${fileName}.pdf`);

      setProgressStep("success");
      setTimeout(() => {
        setSelectedFile(null);
        setProgressStep("idle");
      }, 2000);
    } catch (err) {
      console.error("Conversion error:", err);
      const message =
        err instanceof Error
          ? err.message
          : content.ui.errors.unknown;
      setError(
        `${content.ui.errors.genericPrefix} ${message}`
      );
    } finally {
      if (iframe && iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      setIsConverting(false);
    }
  };

  const progressMessage =
    progressStep === "idle"
      ? ""
      : content.ui.progress[progressStep];

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

  const showProgress =
    progressStep !== "idle";

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* بخش آپلود */}
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
          <p
            className={`text-lg font-medium ${theme.text}`}
          >
            {content.ui.upload.title}
          </p>
          <p
            className={`text-sm mt-2 ${theme.textMuted}`}
          >
            {content.ui.upload.subtitle}
          </p>
        </label>
      </div>

      {/* نمایش فایل انتخاب شده */}
      {selectedFile && (
        <div
          className={`p-4 rounded-lg border flex items-center justify-between transition-colors duration-300 ${theme.card} ${theme.border}`}
        >
          <div className="flex items-center gap-3">
            <FileText
              className={theme.accent}
              size={24}
            />
            <div>
              <p
                className={`font-medium ${theme.text}`}
              >
                {selectedFile.name}
              </p>
              <p
                className={`text-sm ${theme.textMuted}`}
              >
                {(
                  selectedFile.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                {content.ui.file.sizeUnit}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            disabled={isConverting}
            className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
            title={content.ui.file.removeTitle}
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* پیام خطا */}
      {error && (
        <div
          className={`p-4 rounded-lg border border-red-300 bg-red-50 flex gap-3`}
        >
          <AlertCircle
            size={20}
            className="text-red-600 flex-shrink-0 mt-0.5"
          />
          <div className="text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* نمایش پیشرفت */}
      {showProgress && (
        <div
          className={`p-4 rounded-lg border ${theme.secondary} ${theme.border}`}
        >
          <p
            className={`text-sm font-medium mb-2 ${theme.text}`}
          >
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

      {/* راهنما */}
      <div
        className={`p-4 rounded-lg border ${theme.secondary} ${theme.border}`}
      >
        <h3
          className={`font-medium mb-3 ${theme.text}`}
        >
          {content.ui.guide.title}
        </h3>
        <ul
          className={`space-y-2 text-sm ${theme.textMuted}`}
        >
          {content.ui.guide.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
