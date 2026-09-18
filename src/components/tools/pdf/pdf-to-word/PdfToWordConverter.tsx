"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  RotateCcw,
  ShieldCheck,
  UploadCloud,
  X,
} from "lucide-react";
import download from "downloadjs";

import { useThemeColors } from "@/hooks/useThemeColors";
import { usePdfToWordToolContent } from "./pdf-to-word.content";
import {
  convertPdfToWord,
  inspectPdfFile,
  type PdfInspection,
  type PdfToWordMode,
  type PdfToWordQuality,
  type PdfToWordProgress,
  type PdfToWordResult,
} from "./pdf-to-word.utils";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function PdfToWordConverter() {
  const theme = useThemeColors();
  const t = usePdfToWordToolContent();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<PdfInspection | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [mode, setMode] = useState<PdfToWordMode>("editable");
  const [quality, setQuality] = useState<PdfToWordQuality>("balanced");
  const [pageRange, setPageRange] = useState("");
  const [includeImages, setIncludeImages] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<PdfToWordProgress | null>(null);
  const [error, setError] = useState("");
  const [result, setResult] = useState<PdfToWordResult | null>(null);

  const fileBase = file?.name.replace(/\.pdf$/i, "") || "document";

  const resetResult = useCallback(() => {
    setResult(null);
    setProgress(null);
    setError("");
  }, []);

  const resetAll = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setFile(null);
    setInspection(null);
    setInspecting(false);
    setBusy(false);
    setProgress(null);
    setResult(null);
    setError("");
    setPageRange("");
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = useCallback(
    async (nextFile?: File | null) => {
      if (!nextFile) return;
      const valid = nextFile.type === "application/pdf" || /\.pdf$/i.test(nextFile.name);
      if (!valid) {
        setError(t.errors.invalidType);
        return;
      }

      setFile(nextFile);
      setInspection(null);
      setResult(null);
      setProgress(null);
      setError("");
      setInspecting(true);

      try {
        const info = await inspectPdfFile(nextFile);
        setInspection(info);
      } catch (err) {
        console.error("[pdf-to-word][inspect]", err);
        const message = String((err as Error)?.message || "").toLowerCase();
        if (message.includes("password")) setError(t.errors.password);
        else setError(t.errors.generic);
      } finally {
        setInspecting(false);
      }
    },
    [t.errors.generic, t.errors.invalidType, t.errors.password],
  );

  const convert = useCallback(async () => {
    if (!file || busy) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setBusy(true);
    setError("");
    setResult(null);
    setProgress({ phase: "loading", done: 0, total: 1 });

    try {
      const converted = await convertPdfToWord(file, {
        mode,
        pageRange,
        includeImages: mode === "editable" && includeImages,
        quality,
        signal: controller.signal,
        onProgress: setProgress,
      });
      setResult(converted);
    } catch (err) {
      const name = String((err as Error)?.name || "");
      const message = String((err as Error)?.message || "");
      const normalized = `${name} ${message}`.toLowerCase();
      const wasAborted =
        controller.signal.aborted ||
        name === "AbortError" ||
        normalized.includes("aborted");

      // Cancellation is expected control flow, not an application error.
      // Avoid console.error here because the Next.js dev overlay promotes
      // logged Error objects to a visible "Console AbortError".
      if (wasAborted) {
        setError(t.errors.aborted);
      } else {
        console.error("[pdf-to-word]", err);

        if (message === "INVALID_PAGE_RANGE") {
          setError(t.errors.invalidRange);
        } else if (normalized.includes("password")) {
          setError(t.errors.password);
        } else {
          setError(message ? `${t.errors.generic} — ${message}` : t.errors.generic);
        }
      }
      setProgress(null);
    } finally {
      // Only clear the controller owned by this conversion.
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setBusy(false);
    }
  }, [busy, file, includeImages, mode, pageRange, quality, t.errors]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    download(result.blob, `${fileBase}.docx`, DOCX_MIME);
  }, [fileBase, result]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const phaseLabel = progress ? t.progress[progress.phase] : "";
  const progressPercent = progress
    ? progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0
    : 0;

  return (
    <div
      className={`max-w-4xl mx-auto rounded-3xl border p-5 md:p-8 shadow-xl ${theme.card} ${theme.border}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        disabled={busy}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div className={`grid grid-cols-2 gap-1 p-1 rounded-xl border ${theme.border} ${theme.bg}`}>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setMode("editable");
            resetResult();
          }}
          className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-opacity disabled:opacity-50 ${mode === "editable" ? theme.primary : `${theme.textMuted} hover:opacity-70`
            }`}
        >
          <span className="inline-flex items-center gap-2">
            <FileText size={16} /> {t.mode.editable}
          </span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setMode("layout");
            resetResult();
          }}
          className={`rounded-lg px-3 py-2.5 text-sm font-bold transition-opacity disabled:opacity-50 ${mode === "layout" ? theme.primary : `${theme.textMuted} hover:opacity-70`
            }`}
        >
          <span className="inline-flex items-center gap-2">
            <ImageIcon size={16} /> {t.mode.layout}
          </span>
        </button>
      </div>
      <p className={`mt-2 mb-6 text-xs leading-5 ${theme.textMuted}`}>
        {mode === "editable" ? t.mode.editableHint : t.mode.layoutHint}
      </p>

      <div className="mb-6">
        <label className={`block text-xs font-bold mb-2 ${theme.textMuted}`}>
          {t.controls.quality}
        </label>
        <div className={`grid grid-cols-3 gap-1 p-1 rounded-xl border ${theme.border} ${theme.bg}`}>
          {(["fast", "balanced", "high"] as PdfToWordQuality[]).map((level) => (
            <button
              key={level}
              type="button"
              disabled={busy}
              onClick={() => {
                setQuality(level);
                resetResult();
              }}
              className={`rounded-lg px-2 py-2.5 text-xs sm:text-sm font-bold transition-opacity disabled:opacity-50 ${quality === level
                  ? theme.primary
                  : `${theme.textMuted} hover:opacity-70`
                }`}
            >
              {level === "fast"
                ? t.controls.qualityFast
                : level === "balanced"
                  ? t.controls.qualityBalanced
                  : t.controls.qualityHigh}
            </button>
          ))}
        </div>
        <p className={`text-[10px] mt-1.5 ${theme.textMuted}`}>
          {quality === "fast"
            ? t.controls.qualityFastHint
            : quality === "balanced"
              ? t.controls.qualityBalancedHint
              : t.controls.qualityHighHint}
        </p>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_220px] gap-4 mb-6">
        <div>
          <label className={`block text-xs font-bold mb-2 ${theme.textMuted}`}>
            {t.controls.pageRange}
          </label>
          <input
            value={pageRange}
            onChange={(e) => {
              setPageRange(e.target.value);
              resetResult();
            }}
            disabled={busy}
            dir="ltr"
            placeholder={t.controls.pageRangePlaceholder}
            className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none disabled:opacity-50 ${theme.border} ${theme.bg} ${theme.text}`}
          />
          <p className={`text-[10px] mt-1 ${theme.textMuted}`}>
            {t.controls.pageRangeHint}
          </p>
        </div>

        <div className={mode === "layout" ? "opacity-45" : ""}>
          <label className={`block text-xs font-bold mb-2 ${theme.textMuted}`}>
            {t.controls.includeImages}
          </label>
          <button
            type="button"
            disabled={busy || mode === "layout"}
            onClick={() => {
              setIncludeImages((value) => !value);
              resetResult();
            }}
            className="flex items-center gap-2.5 mt-2 disabled:cursor-not-allowed"
          >
            <span
              className={`w-10 h-6 rounded-full relative transition-colors ${includeImages && mode === "editable"
                  ? "bg-[var(--app-accent)]"
                  : "bg-gray-400/40"
                }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${includeImages && mode === "editable" ? "end-1" : "start-1"
                  }`}
              />
            </span>
          </button>
          <p className={`text-[10px] mt-1 ${theme.textMuted}`}>
            {t.controls.includeImagesHint}
          </p>
        </div>
      </div>

      {!file && (
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
          <UploadCloud size={42} className={theme.accent} />
          <span className={`text-lg font-bold ${theme.text}`}>{t.upload.title}</span>
          <span className={`text-sm ${theme.textMuted}`}>{t.upload.hint}</span>
          <span className={`mt-1 px-4 py-2 rounded-xl text-sm font-medium ${theme.primary}`}>
            {t.upload.select}
          </span>
        </button>
      )}

      {file && (
        <div className={`rounded-2xl border p-4 ${theme.border} ${theme.bg}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${theme.secondary}`}>
                <FileText size={22} className={theme.accent} />
              </div>
              <div className="min-w-0">
                <p className={`font-bold truncate ${theme.text}`}>{file.name}</p>
                <div className={`flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs ${theme.textMuted}`}>
                  <span>{t.file.size}: {formatSize(file.size)}</span>
                  {inspection && <span>{inspection.pages} {t.file.pages}</span>}
                </div>
                <p className={`text-xs mt-2 ${theme.textMuted}`}>
                  {inspecting ? t.file.inspecting : t.file.ready}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={resetAll}
              title={t.file.remove}
              className={`p-2 rounded-lg hover:opacity-70 disabled:opacity-40 ${theme.textMuted}`}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl border border-[var(--app-error-border)] bg-[var(--app-error-bg)] flex gap-3">
          <AlertCircle className="text-[var(--app-error-text)] shrink-0 mt-0.5" size={19} />
          <p className="text-sm text-[var(--app-error-text)]">{error}</p>
        </div>
      )}

      {busy && progress && (
        <div className={`mt-4 p-4 rounded-xl border ${theme.border} ${theme.secondary}`}>
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className={`inline-flex items-center gap-2 text-sm font-medium ${theme.text}`}>
              <Loader2 size={16} className="animate-spin" /> {phaseLabel}
            </span>
            <span className={`text-xs tabular-nums ${theme.textMuted}`}>
              {progress.page ? `${progress.page} · ` : ""}{progress.done}/{progress.total}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-gray-200/70 dark:bg-gray-700/60">
            <div
              className={`h-full bg-gradient-to-r ${theme.gradient} transition-[width] duration-200`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {file && !result && (
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={convert}
            disabled={busy || inspecting}
            className={`flex-1 px-5 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {busy ? t.buttons.converting : t.buttons.convert}
          </button>
          {busy && (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className={`px-5 py-3 rounded-xl font-medium border ${theme.border} ${theme.text}`}
            >
              {t.buttons.cancel}
            </button>
          )}
        </div>
      )}

      {result && !busy && (
        <div className={`mt-5 rounded-2xl border p-5 ${theme.border} ${theme.secondary}`}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={21} className="text-[var(--app-success-text)]" />
            <h3 className={`font-bold ${theme.text}`}>{t.result.title}</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mb-4">
            <div className={`rounded-xl border p-3 ${theme.border} ${theme.bg}`}>
              <div className={`font-bold ${theme.text}`}>{result.convertedPages}</div>
              <div className={`text-[10px] mt-1 ${theme.textMuted}`}>{t.result.convertedPages}</div>
            </div>
            <div className={`rounded-xl border p-3 ${theme.border} ${theme.bg}`}>
              <div className={`font-bold ${theme.text}`}>{result.textCharacters.toLocaleString()}</div>
              <div className={`text-[10px] mt-1 ${theme.textMuted}`}>{t.result.textCharacters}</div>
            </div>
            <div className={`rounded-xl border p-3 ${theme.border} ${theme.bg}`}>
              <div className={`font-bold ${theme.text}`}>{result.embeddedImages}</div>
              <div className={`text-[10px] mt-1 ${theme.textMuted}`}>{t.result.images}</div>
            </div>
            <div className={`rounded-xl border p-3 ${theme.border} ${theme.bg}`}>
              <div className={`font-bold ${theme.text}`}>{result.imageFallbackPages}</div>
              <div className={`text-[10px] mt-1 ${theme.textMuted}`}>{t.result.fallbackPages}</div>
            </div>
          </div>

          {(result.imageFallbackPages > 0 || result.mode === "layout") && (
            <p className={`text-xs leading-5 mb-4 ${theme.textMuted}`}>
              {result.mode === "layout" ? t.result.layoutHint : t.result.fallbackHint}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDownload}
              className={`flex-1 px-5 py-3 rounded-xl font-bold inline-flex items-center justify-center gap-2 ${theme.primary}`}
            >
              <Download size={18} /> {t.buttons.download}
            </button>
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setProgress(null);
              }}
              className={`px-5 py-3 rounded-xl font-medium border ${theme.border} ${theme.text}`}
            >
              {t.buttons.convertAgain}
            </button>
            <button
              type="button"
              onClick={resetAll}
              className={`px-5 py-3 rounded-xl font-medium border inline-flex items-center justify-center gap-2 ${theme.border} ${theme.text}`}
            >
              <RotateCcw size={16} /> {t.buttons.reset}
            </button>
          </div>
        </div>
      )}

      <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${theme.border} ${theme.secondary}`}>
        <ShieldCheck size={19} className={`shrink-0 mt-0.5 ${theme.accent}`} />
        <p className={`text-xs leading-5 ${theme.textMuted}`}>{t.privacy}</p>
      </div>

      <div className={`mt-4 p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
        <h3 className={`font-bold mb-3 ${theme.text}`}>{t.guide.title}</h3>
        <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
          {t.guide.items.map((item, index) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
