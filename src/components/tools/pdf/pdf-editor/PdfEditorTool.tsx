"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  Maximize2,
  Minimize2,
  Download,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  usePdfEditorContent,
  type PdfEditorToolContent,
} from "./pdf-editor.content";

type EditorMode = "keep" | "remove";
type ViewerDoc = "original" | "edited";

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function uint8ToArrayBuffer(u8: Uint8Array<ArrayBufferLike>): ArrayBuffer {
  const ab = new ArrayBuffer(u8.byteLength);
  new Uint8Array(ab).set(u8);
  return ab;
}

export default function PdfEditorTool() {
  const theme = useThemeColors();
  const content: PdfEditorToolContent = usePdfEditorContent();

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const [mode, setMode] = useState<EditorMode>("keep");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [originalBlob, setOriginalBlob] = useState<Blob | null>(null);
  const [editedBlob, setEditedBlob] = useState<Blob | null>(null);

  const [originalObjectUrl, setOriginalObjectUrl] = useState<string | null>(
    null
  );
  const [editedObjectUrl, setEditedObjectUrl] = useState<string | null>(null);

  const [viewerDoc, setViewerDoc] = useState<ViewerDoc>("original");

  const [embedDataUrl, setEmbedDataUrl] = useState<string | null>(null);
  const [isPreparingEmbedUrl, setIsPreparingEmbedUrl] = useState(false);

  const [fullscreen, setFullscreen] = useState(false);
  const fullscreenContentRef = useRef<HTMLDivElement | null>(null);

  const isBusy = isLoading || isGenerating;

  const env = useMemo(() => {
    if (typeof navigator === "undefined") {
      return { isIOS: false, isAndroid: false, isMobile: false };
    }
    const ua = navigator.userAgent || "";
    const isAndroid = /Android/i.test(ua);
    const isIOS =
      /iPad|iPhone|iPod/i.test(ua) ||
      (ua.includes("Mac") &&
        typeof document !== "undefined" &&
        "ontouchend" in document);
    const isMobile =
      isAndroid ||
      isIOS ||
      (typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(pointer: coarse)").matches);
    return { isIOS, isAndroid, isMobile };
  }, []);

  const cleanupUrl = (url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setFile(null);
    setError(null);

    setTotalPages(0);
    setSelectedPages(new Set());
    setCurrentPage(1);

    setOriginalBlob(null);
    setEditedBlob(null);

    cleanupUrl(originalObjectUrl);
    cleanupUrl(editedObjectUrl);
    setOriginalObjectUrl(null);
    setEditedObjectUrl(null);

    setViewerDoc("original");

    setEmbedDataUrl(null);
  };

  const toggleSelectPage = (pageNumber: number) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) next.delete(pageNumber);
      else next.add(pageNumber);
      return next;
    });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const isPdf =
      f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError(content.ui.errors.invalidType);
      resetAll();
      return;
    }

    resetAll();

    setFile(f);
    setError(null);
    setIsLoading(true);

    try {
      const objUrl = URL.createObjectURL(f);
      setOriginalObjectUrl(objUrl);
      setOriginalBlob(f);
      setViewerDoc("original");

      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes);
      const pageCount = doc.getPageCount();

      if (!pageCount || pageCount < 1) {
        setError(content.ui.errors.noPages);
      } else {
        setTotalPages(pageCount);
        setCurrentPage(1);
        setSelectedPages(new Set());
      }
    } catch (err) {
      console.error("PDF read error:", err);
      setError(content.ui.errors.loadFailed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!file || totalPages === 0) return;

    const selected = Array.from(selectedPages).sort((a, b) => a - b);
    const allPages = Array.from({ length: totalPages }, (_, i) => i + 1);

    if (mode === "keep" && selected.length === 0) {
      setError(content.ui.errors.noSelection);
      return;
    }

    let targetPages: number[];
    if (mode === "keep") {
      targetPages = selected;
    } else {
      const selectedSet = new Set(selected);
      targetPages = allPages.filter((n) => !selectedSet.has(n));
      if (targetPages.length === 0) {
        setError(content.ui.errors.noPages);
        return;
      }
    }

    try {
      setIsGenerating(true);
      setError(null);

      cleanupUrl(editedObjectUrl);
      setEditedObjectUrl(null);
      setEditedBlob(null);

      const originalBytes = new Uint8Array(await file.arrayBuffer());
      const originalPdf = await PDFDocument.load(originalBytes);
      const newPdf = await PDFDocument.create();

      const copiedPages = await newPdf.copyPages(
        originalPdf,
        targetPages.map((p) => p - 1)
      );
      copiedPages.forEach((p) => newPdf.addPage(p));

      const newBytes = await newPdf.save();
      const blob = new Blob([uint8ToArrayBuffer(newBytes)], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);

      setEditedBlob(blob);
      setEditedObjectUrl(url);

      setViewerDoc("edited");
      setCurrentPage(1);
      setEmbedDataUrl(null);
    } catch (err) {
      console.error("PDF process error:", err);
      setError(content.ui.errors.process);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!editedObjectUrl || !file) return;
    const base = file.name.toLowerCase().endsWith(".pdf")
      ? file.name.slice(0, -4)
      : file.name;

    const a = document.createElement("a");
    a.href = editedObjectUrl;
    a.download = `${base}-edited.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const activeBlob = viewerDoc === "edited" ? editedBlob : originalBlob;
  const activeObjectUrl =
    viewerDoc === "edited" ? editedObjectUrl : originalObjectUrl;

  const canInline =
    !!activeObjectUrl && (!env.isMobile || env.isIOS) && !env.isAndroid;

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setEmbedDataUrl(null);

      if (!canInline) return;
      if (!env.isIOS) return;
      if (!activeBlob) return;

      try {
        setIsPreparingEmbedUrl(true);
        const dataUrl = await blobToDataUrl(activeBlob);
        if (!cancelled) setEmbedDataUrl(dataUrl);
      } catch {
        if (!cancelled) setEmbedDataUrl(null);
      } finally {
        if (!cancelled) setIsPreparingEmbedUrl(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [canInline, env.isIOS, activeBlob]);

  const pageLabel = useMemo(() => {
    return content.ui.viewer.pageLabel
      .replace("{{current}}", String(currentPage))
      .replace("{{total}}", String(totalPages));
  }, [content.ui.viewer.pageLabel, currentPage, totalPages]);

  const viewerSrc = useMemo(() => {
    if (!activeObjectUrl) return null;
    const base = env.isIOS && embedDataUrl ? embedDataUrl : activeObjectUrl;
    return totalPages > 0 ? `${base}#page=${currentPage}` : base;
  }, [activeObjectUrl, env.isIOS, embedDataUrl, totalPages, currentPage]);

  const openInNewTab = () => {
    if (!activeObjectUrl) return;
    window.open(activeObjectUrl, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && fullscreen) setFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen]);

  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => fullscreenContentRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  useEffect(() => {
    return () => {
      cleanupUrl(originalObjectUrl);
      cleanupUrl(editedObjectUrl);
    };
  }, [originalObjectUrl, editedObjectUrl]);

  return (
    <>
      <div className="w-full max-w-5xl mx-auto space-y-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors duration-300 ${theme.border} hover:opacity-80`}
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={onFileChange}
                className="hidden"
                id="pdf-upload"
                disabled={isBusy}
              />
              <label
                htmlFor="pdf-upload"
                className="cursor-pointer block w-full h-full"
              >
                <Upload
                  className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 mb-3 sm:mb-4 ${theme.textMuted}`}
                />
                <p className={`text-base sm:text-lg font-medium ${theme.text}`}>
                  {content.ui.upload.title}
                </p>
                <p className={`text-xs sm:text-sm mt-2 ${theme.textMuted}`}>
                  {content.ui.upload.subtitle}
                </p>
              </label>
            </div>

            {file && (
              <div
                className={`p-4 rounded-lg border flex items-center justify-between ${theme.card} ${theme.border}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className={theme.accent} size={22} />
                  <div className="min-w-0">
                    <p className={`font-medium ${theme.text} truncate`}>
                      {file.name}
                    </p>
                    <p className={`text-sm ${theme.textMuted}`}>
                      {(file.size / 1024 / 1024).toFixed(2)}{" "}
                      {content.ui.file.sizeUnit}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetAll}
                  disabled={isBusy}
                  className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
                  title={content.ui.file.removeTitle}
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg border border-red-300 bg-red-50 flex gap-3">
                <AlertCircle
                  size={20}
                  className="text-red-600 flex-shrink-0 mt-0.5"
                />
                <div className="text-sm text-red-700 whitespace-pre-wrap">
                  {error}
                </div>
              </div>
            )}

            {file && totalPages > 0 && (
              <div className="space-y-3">
                <div
                  className={`p-3 rounded-lg border flex items-center justify-between ${theme.card} ${theme.border}`}
                >
                  <span className={`text-sm font-medium ${theme.text}`}>
                    {mode === "keep"
                      ? content.ui.mode.keep
                      : content.ui.mode.remove}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("keep")}
                      className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                        mode === "keep"
                          ? `${theme.primary}`
                          : `${theme.card} ${theme.border} ${theme.textMuted} border`
                      }`}
                    >
                      {content.ui.mode.keep}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("remove")}
                      className={`px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium transition-all ${
                        mode === "remove"
                          ? `${theme.primary}`
                          : `${theme.card} ${theme.border} ${theme.textMuted} border`
                      }`}
                    >
                      {content.ui.mode.remove}
                    </button>
                  </div>
                </div>

                {(isLoading || isGenerating) && (
                  <div
                    className={`p-3 rounded-lg border ${theme.secondary} ${theme.border}`}
                  >
                    <p className={`text-sm ${theme.text}`}>
                      {isLoading
                        ? content.ui.progress.loading
                        : content.ui.progress.generating}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isBusy || totalPages === 0}
                    className={`flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
                  >
                    <Download size={18} />
                    {isGenerating
                      ? content.ui.buttons.editLoading
                      : content.ui.buttons.editIdle}
                  </button>

                  {editedObjectUrl && (
                    <button
                      onClick={handleDownload}
                      className={`flex-1 px-6 py-3 rounded-lg font-medium border ${theme.border} ${theme.card} ${theme.text}`}
                    >
                      {content.ui.buttons.download}
                    </button>
                  )}
                </div>
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
            ref={fullscreenContentRef}
            tabIndex={-1}
            className={`
              rounded-xl border ${theme.border} ${theme.card}
              shadow-sm overflow-hidden flex flex-col
              min-h-[360px] h-[70dvh] lg:h-[600px]
              transition-all duration-200
              ${fullscreen ? "fixed inset-0 z-[9999] m-0 h-[100dvh]" : ""}
            `}
          >
            <div className="px-4 py-3 border-b border-slate-200/60 flex items-center justify-between gap-2 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-sm font-medium ${theme.text} truncate`}>
                  {content.ui.viewer.title}
                </span>

                {totalPages > 0 && (
                  <span className="hidden sm:inline-flex text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600">
                    {pageLabel}
                  </span>
                )}

                {originalObjectUrl && (
                  <div className="hidden sm:flex items-center gap-2 ml-2">
                    <button
                      type="button"
                      onClick={() => setViewerDoc("original")}
                      className={`px-2 py-1 rounded-full text-xs border transition-all ${
                        viewerDoc === "original"
                          ? `${theme.primary}`
                          : `${theme.card} ${theme.border} ${theme.textMuted} border`
                      }`}
                    >
                      {content.ui.viewer.tabs.original}
                    </button>

                    <button
                      type="button"
                      onClick={() => editedObjectUrl && setViewerDoc("edited")}
                      disabled={!editedObjectUrl}
                      className={`px-2 py-1 rounded-full text-xs border transition-all disabled:opacity-40 ${
                        viewerDoc === "edited"
                          ? `${theme.primary}`
                          : `${theme.card} ${theme.border} ${theme.textMuted} border`
                      }`}
                    >
                      {content.ui.viewer.tabs.edited}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeObjectUrl && (
                  <button
                    type="button"
                    onClick={openInNewTab}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${theme.border} ${theme.card} ${theme.textMuted} hover:opacity-80`}
                    title={content.ui.viewer.openInNewTabTitle}
                  >
                    <ExternalLink size={14} />
                    {content.ui.buttons.open}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setFullscreen((f) => !f)}
                  disabled={!activeObjectUrl}
                  className={`
                    inline-flex items-center justify-center
                    w-8 h-8 rounded-full
                    border ${theme.border} ${theme.card} ${theme.textMuted}
                    disabled:opacity-40 disabled:cursor-not-allowed
                    hover:opacity-80 transition-all
                  `}
                >
                  {fullscreen ? (
                    <Minimize2 size={16} />
                  ) : (
                    <Maximize2 size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row min-h-0">
              <div className="flex-1 bg-slate-100 dark:bg-slate-900/60 p-2 md:p-3 min-h-0">
                {!activeObjectUrl ? (
                  <div
                    className={`h-full flex items-center justify-center text-sm ${theme.textMuted}`}
                  >
                    {file
                      ? content.ui.progress.loading
                      : content.ui.upload.subtitle}
                  </div>
                ) : env.isAndroid ? (
                  <div className="h-full flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 p-6">
                    <p className={`text-sm ${theme.textMuted} text-center`}>
                      {content.ui.viewer.mobile.androidInlineNote}
                    </p>
                    <button
                      type="button"
                      onClick={openInNewTab}
                      className={`px-5 py-2.5 rounded-lg font-medium ${theme.primary}`}
                    >
                      {content.ui.buttons.openPdf}
                    </button>
                  </div>
                ) : (
                  <>
                    {env.isIOS && isPreparingEmbedUrl && (
                      <div className={`mb-2 text-xs ${theme.textMuted}`}>
                        {content.ui.progress.preparingPreview}
                      </div>
                    )}

                    {canInline && viewerSrc ? (
                      <iframe
                        key={viewerSrc}
                        src={viewerSrc}
                        title={content.ui.viewer.title}
                        className="w-full h-full rounded-lg bg-white border border-slate-200 dark:border-slate-800"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 p-6">
                        <p className={`text-sm ${theme.textMuted} text-center`}>
                          {content.ui.viewer.mobile.inlineNotSupported}
                        </p>
                        <button
                          type="button"
                          onClick={openInNewTab}
                          className={`px-5 py-2.5 rounded-lg font-medium ${theme.primary}`}
                        >
                          {content.ui.buttons.openPdf}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-200/60 bg-white dark:bg-slate-950/60 overflow-auto">
                {totalPages > 0 ? (
                  <div className="grid grid-cols-5 md:grid-cols-2 gap-2 p-3">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        const selected = selectedPages.has(page);
                        const isActive = page === currentPage;

                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => {
                              setCurrentPage(page);
                              toggleSelectPage(page);
                            }}
                            className={`relative flex flex-col items-center justify-center gap-1 py-3 rounded-lg border text-xs transition-all ${
                              isActive
                                ? "border-blue-500 ring-2 ring-blue-500"
                                : "border-slate-200 dark:border-slate-800"
                            } ${
                              selected
                                ? "bg-blue-50 dark:bg-blue-500/10"
                                : "bg-white dark:bg-slate-900"
                            }`}
                          >
                            <span className="font-semibold">{page}</span>
                            {selected && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-300">
                                <Trash2 size={12} />
                                {content.ui.viewer.selectedBadge}
                              </span>
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className={`p-3 text-xs ${theme.textMuted}`}>
                    {content.ui.upload.subtitle}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {fullscreen && (
        <div
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-md"
          onClick={() => setFullscreen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
