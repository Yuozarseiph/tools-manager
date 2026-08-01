"use client";

import { useCallback, useRef, useState } from "react";
import {
  UploadCloud,
  Loader2,
  Download,
  RotateCcw,
  RefreshCw,
  Archive,
  Crop,
  ImageOff,
  Layers,
  Images,
} from "lucide-react";
import download from "downloadjs";
import { useThemeColors } from "@/hooks/useThemeColors";
import CustomDropdown from "@/components/ui/CustomDropdown";
import { usePdfToImageToolContent } from "./pdf-to-image.content";
import ImageEditModal from "./ImageEditModal";
import {
  type OutFormat,
  type ToolImage,
  MIME,
  EXT,
  makeId,
  parsePageRange,
  extractEmbeddedImages,
  buildZip,
  dataUrlToBytes,
} from "./pdf-image-utils";

type Mode = "pages" | "extract";

export default function PdfToImageConverter() {
  const theme = useThemeColors();
  const t = usePdfToImageToolContent();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);

  const [mode, setMode] = useState<Mode>("pages");
  const [format, setFormat] = useState<OutFormat>("png");
  const [quality, setQuality] = useState(0.92);
  const [scale, setScale] = useState(2);
  const [pageRange, setPageRange] = useState("");
  const [minSize, setMinSize] = useState(100);
  const [dedupe, setDedupe] = useState(true);
  const [fileName, setFileName] = useState<string>("");
  const [items, setItems] = useState<ToolImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string>("");
  const [hasProcessed, setHasProcessed] = useState(false);
  const [editing, setEditing] = useState<ToolImage | null>(null);
  const [zipping, setZipping] = useState(false);

  const baseName = fileName.replace(/\.pdf$/i, "") || "pdf";

  const processPdf = useCallback(
    async (file: File, modeOverride?: Mode) => {
      const activeMode = modeOverride ?? mode;
      setError("");
      setBusy(true);
      setItems([]);
      setProgress(null);
      try {
        // Self-hosted pdf.js loaded at runtime (see previous implementation notes):
        // webpackIgnore keeps Next/Webpack from bundling it; served from /public/pdfjs.
        const libUrl = "/pdfjs/pdf.min.js";
        const mod: any = await import(/* webpackIgnore: true */ libUrl);
        const pdfjs = mod.getDocument ? mod : mod.default;
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

        const buffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: buffer }).promise;
        const total = doc.numPages;
        const pageList = parsePageRange(pageRange, total);
        if (pageList.length === 0) {
          setError(t.invalidRange);
          return;
        }
        setProgress({ done: 0, total: pageList.length });
        const out: ToolImage[] = [];

        if (activeMode === "pages") {
          let done = 0;
          for (const pageNum of pageList) {
            const pdfPage = await doc.getPage(pageNum);
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
            // Passing both keeps compatibility with pdf.js v4 (canvasContext) and v5 (canvas).
            await pdfPage.render({ canvasContext: ctx, canvas, viewport })
              .promise;
            const dataUrl = canvas.toDataURL(
              MIME[format],
              format === "png" ? undefined : quality,
            );
            out.push({
              id: makeId(),
              dataUrl,
              width: canvas.width,
              height: canvas.height,
              pageIndex: pageNum,
              source: "page",
              fileLabel: `page-${pageNum}`,
              displayLabel: `${t.page} ${pageNum}`,
            });
            pdfPage.cleanup?.();
            done += 1;
            setProgress({ done, total: pageList.length });
          }
        } else {
          const extracted = await extractEmbeddedImages(pdfjs, doc, {
            pageList,
            minSize,
            dedupe,
            onProgress: (done, tot) => setProgress({ done, total: tot }),
          });
          extracted.forEach((ex, i) => {
            const dataUrl = ex.canvas.toDataURL(
              MIME[format],
              format === "png" ? undefined : quality,
            );
            out.push({
              id: makeId(),
              dataUrl,
              width: ex.canvas.width,
              height: ex.canvas.height,
              pageIndex: ex.pageIndex,
              source: "embedded",
              fileLabel: `img-${i + 1}-page-${ex.pageIndex}`,
              displayLabel: `${t.image} ${i + 1} · ${t.fromPage} ${ex.pageIndex}`,
            });
          });
        }
        setItems(out);
      } catch (err) {
        console.error("[pdf-to-image]", err);
        const msg = String((err as Error)?.message || "");
        if (msg.toLowerCase().includes("password")) setError(t.passwordError);
        else setError(msg ? `${t.error} — ${msg}` : t.error);
      } finally {
        setBusy(false);
        setProgress(null);
        setHasProcessed(true);
      }
    },
    [mode, format, quality, scale, pageRange, minSize, dedupe, t],
  );

  const handleFile = useCallback(
    (file?: File | null) => {
      if (!file) return;
      if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name)) {
        setError(t.error);
        return;
      }
      fileRef.current = file;
      setFileName(file.name);
      setHasProcessed(false);
      processPdf(file);
    },
    [processPdf, t.error],
  );

  const changeMode = (m: Mode) => {
    if (m === mode || busy) return;
    setMode(m);
    setItems([]);
    setHasProcessed(false);
    setError("");
  };

  const switchToPages = () => {
    setMode("pages");
    setItems([]);
    setError("");
    if (fileRef.current) processPdf(fileRef.current, "pages");
  };

  const downloadPage = useCallback(
    (p: ToolImage) => {
      download(
        p.dataUrl,
        `${baseName}-${p.fileLabel}.${EXT[format]}`,
        MIME[format],
      );
    },
    [baseName, format],
  );

  const downloadZip = useCallback(async () => {
    if (!items.length || zipping) return;
    setZipping(true);
    try {
      const entries = items.map((it) => ({
        name: `${baseName}-${it.fileLabel}.${EXT[format]}`,
        data: dataUrlToBytes(it.dataUrl),
      }));
      const blob = buildZip(entries);
      download(blob, `${baseName}-images.zip`, "application/zip");
    } catch (err) {
      console.error("[pdf-to-image][zip]", err);
      // Fallback: sequential downloads.
      items.forEach((p, i) => setTimeout(() => downloadPage(p), i * 250));
    } finally {
      setZipping(false);
    }
  }, [items, zipping, baseName, format, downloadPage]);

  const reset = useCallback(() => {
    setItems([]);
    setFileName("");
    setError("");
    setHasProcessed(false);
    fileRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleEditSave = useCallback(
    (id: string, dataUrl: string, width: number, height: number) => {
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, dataUrl, width, height } : it,
        ),
      );
      setEditing(null);
    },
    [],
  );

  const formatOptions = [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPG" },
    { value: "webp", label: "WebP" },
  ];

  const minSizeOptions = [
    { value: "0", label: t.minSizeAll },
    { value: "50", label: "≥ 50px" },
    { value: "100", label: "≥ 100px" },
    { value: "200", label: "≥ 200px" },
    { value: "400", label: "≥ 400px" },
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

      {/* Mode switcher */}
      <div
        className={`grid grid-cols-2 gap-1 p-1 rounded-xl border mb-1.5 ${theme.border} ${theme.bg}`}
      >
        <button
          type="button"
          onClick={() => changeMode("pages")}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-opacity ${
            mode === "pages"
              ? theme.primary
              : `${theme.textMuted} hover:opacity-70`
          }`}
        >
          <Layers size={16} /> {t.modePages}
        </button>
        <button
          type="button"
          onClick={() => changeMode("extract")}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-opacity ${
            mode === "extract"
              ? theme.primary
              : `${theme.textMuted} hover:opacity-70`
          }`}
        >
          <Images size={16} /> {t.modeImages}
        </button>
      </div>
      <p className={`text-[10px] mb-5 ${theme.textMuted}`}>
        {mode === "pages" ? t.modePagesHint : t.modeImagesHint}
      </p>

      {/* Controls */}
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
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
        <div
          className={format === "png" ? "opacity-50 pointer-events-none" : ""}
        >
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
            className="w-full accent-[var(--app-accent)] mt-3"
          />
        </div>
        {mode === "pages" ? (
          <div>
            <label
              className={`text-xs font-bold mb-2 block ${theme.textMuted}`}
            >
              {t.scale} — {scale}×
            </label>
            <input
              type="range"
              min={1}
              max={4}
              step={0.5}
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-[var(--app-accent)] mt-3"
            />
            <p className={`text-[10px] mt-1 ${theme.textMuted}`}>
              {t.scaleHint}
            </p>
          </div>
        ) : (
          <div>
            <label
              className={`text-xs font-bold mb-2 block ${theme.textMuted}`}
            >
              {t.minSize}
            </label>
            <CustomDropdown
              options={minSizeOptions}
              value={String(minSize)}
              onChange={(v) => setMinSize(Number(v))}
              searchable={false}
            />
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6 items-start">
        <div className="sm:col-span-2">
          <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
            {t.pageRange}
          </label>
          <input
            dir="ltr"
            value={pageRange}
            onChange={(e) => setPageRange(e.target.value)}
            placeholder={t.pageRangePlaceholder}
            className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none ${theme.border} ${theme.bg} ${theme.text}`}
          />
          <p className={`text-[10px] mt-1 ${theme.textMuted}`}>
            {t.pageRangeHint}
          </p>
        </div>
        {mode === "extract" && (
          <div>
            <label
              className={`text-xs font-bold mb-2 block ${theme.textMuted}`}
            >
              {t.dedupe}
            </label>
            <button
              type="button"
              onClick={() => setDedupe((v) => !v)}
              className="flex items-center gap-2.5 mt-1"
            >
              <span
                className={`w-9 h-5 rounded-full relative transition-colors ${
                  dedupe ? "bg-[var(--app-accent)]" : "bg-gray-400/40"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                    dedupe ? "end-0.5" : "start-0.5"
                  }`}
                />
              </span>
              <span className={`text-xs font-medium ${theme.text}`}>
                {dedupe ? "✓" : "✗"}
              </span>
            </button>
            <p className={`text-[10px] mt-1 ${theme.textMuted}`}>
              {t.dedupeHint}
            </p>
          </div>
        )}
      </div>

      {/* Dropzone */}
      {items.length === 0 && !busy && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`w-full flex flex-col items-center justify-center gap-3 py-16 rounded-2xl border-2 border-dashed transition-colors ${theme.border} hover:border-[var(--app-accent)] ${theme.bg}`}
        >
          <UploadCloud size={40} className={theme.accent} />
          <span className={`text-lg font-bold ${theme.text}`}>
            {t.dropTitle}
          </span>
          <span className={`text-sm ${theme.textMuted}`}>{t.dropHint}</span>
          <span
            className={`mt-2 px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}
          >
            {t.selectFile}
          </span>
        </button>
      )}

      {error && (
        <p className="mt-4 text-sm text-[var(--app-error-text)] font-medium text-center">
          {error}
        </p>
      )}

      {busy && (
        <div className="flex flex-col items-center gap-3 py-16">
          <Loader2 size={36} className={`animate-spin ${theme.accent}`} />
          <span className={`text-sm font-medium ${theme.text}`}>
            {progress
              ? `${mode === "pages" ? t.rendering : t.extracting} ${progress.done}/${progress.total}`
              : t.loading}
          </span>
        </div>
      )}

      {/* Empty extraction result */}
      {hasProcessed &&
        !busy &&
        items.length === 0 &&
        mode === "extract" &&
        !error && (
          <div className="text-center py-12">
            <ImageOff size={40} className={`mx-auto mb-3 ${theme.textMuted}`} />
            <p className={`font-bold mb-1 ${theme.text}`}>{t.noImages}</p>
            <p className={`text-sm mb-4 ${theme.textMuted}`}>
              {t.noImagesHint}
            </p>
            <button
              type="button"
              onClick={switchToPages}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}
            >
              {t.switchToPages}
            </button>
          </div>
        )}

      {items.length > 0 && !busy && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <span className={`text-sm font-bold ${theme.text}`}>
              {items.length} {mode === "pages" ? t.pages : t.images}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadZip}
                disabled={zipping}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-60 ${theme.primary}`}
              >
                {zipping ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Archive size={16} />
                )}
                {zipping ? t.zipping : t.downloadZip}
              </button>
              <button
                onClick={() => fileRef.current && processPdf(fileRef.current)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${theme.border} ${theme.text} hover:opacity-80`}
              >
                <RefreshCw size={16} /> {t.reprocess}
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
            {items.map((it) => (
              <div
                key={it.id}
                className={`group rounded-xl border overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${theme.border} ${theme.bg}`}
              >
                <button
                  type="button"
                  className="block w-full relative"
                  onClick={() => setEditing(it)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.dataUrl}
                    alt={it.displayLabel}
                    className="w-full h-auto block bg-white"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-gray-900 text-xs font-bold">
                      <Crop size={13} /> {t.edit}
                    </span>
                  </span>
                </button>
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className={`font-bold ${theme.text}`}>
                      {it.displayLabel}
                    </span>
                    <span className={theme.textMuted} dir="ltr">
                      {it.width}×{it.height}
                    </span>
                  </div>
                  <button
                    onClick={() => downloadPage(it)}
                    className={`w-full inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium ${theme.secondary} ${theme.accent} hover:opacity-80`}
                  >
                    <Download size={12} /> {t.download}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {editing && (
        <ImageEditModal
          key={editing.id}
          item={editing}
          format={format}
          quality={quality}
          onClose={() => setEditing(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}
