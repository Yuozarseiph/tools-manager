"use client";

import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  Loader2,
  Download,
  RotateCcw,
  FileImage,
} from "lucide-react";
import download from "downloadjs";

import { useThemeColors } from "@/hooks/useThemeColors";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { usePdfToImageToolContent } from "./pdf-to-image.content";

type OutFormat = "png" | "jpeg" | "webp";

interface RenderedPage {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
}

const MIME: Record<OutFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};
const EXT: Record<OutFormat, string> = { png: "png", jpeg: "jpg", webp: "webp" };

export default function PdfToImageConverter() {
  const theme = useThemeColors();
  const t = usePdfToImageToolContent();
  const inputRef = useRef<HTMLInputElement>(null);

  const [format, setFormat] = useState<OutFormat>("png");
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(2);
  const [fileName, setFileName] = useState<string>("");
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(
    null,
  );
  const [error, setError] = useState<string>("");

  const baseName = fileName.replace(/\.pdf$/i, "") || "page";

  const renderPdf = useCallback(
    async (file: File) => {
      setError("");
      setBusy(true);
      setPages([]);
      setProgress(null);
      try {
        // Load the self-hosted pdf.js library at runtime with `webpackIgnore`
        // so Webpack never processes its ESM (the bundled build throws
        // "Object.defineProperty called on non-object" under Next 16 + Webpack).
        // Files use a .js extension (not .mjs) so the production host serves
        // them with a JavaScript MIME type; both live in /public/pdfjs (offline).
        // A runtime string specifier keeps TypeScript and Webpack from trying
        // to resolve/bundle this path; it is served from /public at runtime.
        const libUrl = "/pdfjs/pdf.min.js";
        const mod: any = await import(/* webpackIgnore: true */ libUrl);
        const pdfjs = mod.getDocument ? mod : mod.default;
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

        const buffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buffer }).promise;
        const total = doc.numPages;
        setProgress({ done: 0, total });

        const out: RenderedPage[] = [];
        for (let i = 1; i <= total; i++) {
          const pdfPage = await doc.getPage(i);
          const viewport = pdfPage.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          // JPEG has no alpha — paint a white background first.
          if (format === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          await pdfPage.render({ canvas, viewport }).promise;
          const dataUrl = canvas.toDataURL(
            MIME[format],
            format === "png" ? undefined : quality,
          );
          out.push({
            index: i,
            dataUrl,
            width: canvas.width,
            height: canvas.height,
          });
          pdfPage.cleanup();
          setProgress({ done: i, total });
        }
        setPages(out);
      } catch (err) {
        console.error("[pdf-to-image]", err);
        const msg = String((err as Error)?.message || "");
        if (msg.toLowerCase().includes("password")) setError(t.passwordError);
        else setError(msg ? `${t.error} — ${msg}` : t.error);
      } finally {
        setBusy(false);
        setProgress(null);
      }
    },
    [format, quality, scale, t.error, t.passwordError],
  );

  const handleFile = useCallback(
    (file?: File | null) => {
      if (!file) return;
      if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
        setError(t.error);
        return;
      }
      setFileName(file.name);
      renderPdf(file);
    },
    [renderPdf, t.error],
  );

  const downloadPage = useCallback(
    (p: RenderedPage) => {
      download(p.dataUrl, `${baseName}-${p.index}.${EXT[format]}`, MIME[format]);
    },
    [baseName, format],
  );

  const downloadAll = useCallback(() => {
    // Sequential downloads with a small delay so the browser doesn't drop them.
    pages.forEach((p, i) => {
      setTimeout(() => downloadPage(p), i * 250);
    });
  }, [pages, downloadPage]);

  const reset = useCallback(() => {
    setPages([]);
    setFileName("");
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const formatOptions = [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPG" },
    { value: "webp", label: "WebP" },
  ];

  return (
    <div
      className={`max-w-4xl mx-auto rounded-3xl border p-5 md:p-8 shadow-xl ${theme.card} ${theme.border}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Controls */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.format}
          </label>
          <CustomDropdown
            options={formatOptions}
            value={format}
            onChange={(v) => setFormat(v as OutFormat)}
            searchable={false}
          />
        </div>
        <div className={format === "png" ? "opacity-50 pointer-events-none" : ""}>
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.quality} — {Math.round(quality * 100)}%
          </label>
          <input
            type="range"
            min={0.4}
            max={1}
            step={0.01}
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full accent-blue-600 mt-3"
          />
        </div>
        <div>
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.scale} — {scale}×
          </label>
          <input
            type="range"
            min={1}
            max={4}
            step={0.5}
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full accent-blue-600 mt-3"
          />
          <p className={`text-[10px] mt-1 ${theme.textMuted}`}>{t.scaleHint}</p>
        </div>
      </div>

      {/* Dropzone */}
      {pages.length === 0 && !busy && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`w-full flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border-2 border-dashed transition-colors ${theme.border} hover:border-blue-500 ${theme.bg}`}
        >
          <UploadCloud size={40} className={theme.accent} />
          <span className={`text-lg font-bold ${theme.text}`}>{t.dropTitle}</span>
          <span className={`text-sm ${theme.textMuted}`}>{t.dropHint}</span>
          <span className={`mt-2 px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}>
            {t.selectFile}
          </span>
        </button>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-500 font-medium text-center">{error}</p>
      )}

      {busy && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 size={36} className={`animate-spin ${theme.accent}`} />
          <span className={`text-sm font-medium ${theme.text}`}>
            {progress ? `${t.rendering} ${progress.done}/${progress.total}` : t.loading}
          </span>
        </div>
      )}

      {pages.length > 0 && !busy && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className={`text-sm font-bold ${theme.text}`}>
              {pages.length} {t.pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={downloadAll}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}
              >
                <Download size={16} /> {t.downloadAll}
              </button>
              <button
                onClick={reset}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${theme.border} ${theme.text} hover:opacity-80`}
              >
                <RotateCcw size={16} /> {t.reset}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {pages.map((p) => (
              <div
                key={p.index}
                className={`group relative rounded-xl border overflow-hidden ${theme.border} ${theme.bg}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.dataUrl}
                  alt={`${t.page} ${p.index}`}
                  className="w-full h-auto block bg-white"
                  loading="lazy"
                />
                <div className="flex items-center justify-between px-3 py-2 text-xs">
                  <span className={theme.textMuted}>
                    <FileImage size={12} className="inline mr-1" />
                    {t.page} {p.index}
                  </span>
                  <button
                    onClick={() => downloadPage(p)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg font-medium ${theme.secondary} ${theme.accent} hover:opacity-80`}
                  >
                    <Download size={12} /> {t.download}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
