"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import download from "downloadjs";
import { FileUp, Trash2, FileText, Loader2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useThemeColors } from "@/hooks/useThemeColors";
import { usePdfMergeContent, type PdfMergeToolContent } from "./pdf-merge.content";

type WorkerOut =
  | { type: "progress"; index: number; total: number }
  | { type: "done"; buffer: ArrayBuffer }
  | { type: "error"; message: string };

export default function PdfMerger() {
  const theme = useThemeColors();
  const content: PdfMergeToolContent = usePdfMergeContent();

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ index: number; total: number } | null>(null);
  const [error, setError] = useState("");

  const workerRef = useRef<Worker | null>(null);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + f.size, 0), [files]);
  const totalMB = useMemo(() => totalBytes / 1024 / 1024, [totalBytes]);

  useEffect(() => {
    workerRef.current = new Worker(new URL("./pdf-merge.worker.ts", import.meta.url), { type: "module" });
    return () => workerRef.current?.terminate();
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    disabled: isProcessing,
    onDrop: (acceptedFiles) => {
      setError("");
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    workerRef.current?.terminate();
    workerRef.current = new Worker(new URL("./pdf-merge.worker.ts", import.meta.url), { type: "module" });
    setIsProcessing(false);
    setProgress(null);
    setError(content.ui.alerts.error);
  };

  const handleMerge = async () => {
    if (files.length < 2 || !workerRef.current) return;

    setIsProcessing(true);
    setError("");
    setProgress({ index: 0, total: files.length });

    const worker = workerRef.current;

    const onMessage = (ev: MessageEvent<WorkerOut>) => {
      const msg = ev.data;

      if (msg.type === "progress") setProgress({ index: msg.index, total: msg.total });

      if (msg.type === "done") {
        download(new Uint8Array(msg.buffer), `merged-toolsmanager-${Date.now()}.pdf`, "application/pdf");
        cleanup();
      }

      if (msg.type === "error") {
        setError(msg.message || content.ui.alerts.error);
        cleanup();
      }
    };

    const cleanup = () => {
      worker.removeEventListener("message", onMessage as any);
      setIsProcessing(false);
      setProgress(null);
    };

    worker.addEventListener("message", onMessage as any);
    worker.postMessage({ type: "merge", files });
  };

  const formatSize = (size: number) => `${(size / 1024 / 1024).toFixed(2)} ${content.ui.list.sizeUnit}`;

  return (
    <div className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${isDragActive ? "border-blue-500 scale-[0.99]" : `${theme.border} hover:border-blue-400`}
        ${theme.bg}
        ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${theme.secondary}`}>
            <FileUp size={32} className={theme.accent} />
          </div>
          <div>
            <p className={`text-lg font-bold ${theme.text}`}>{content.ui.dropzone.title}</p>
            <p className={`text-sm mt-2 ${theme.textMuted}`}>{content.ui.dropzone.subtitle}</p>
            <p className={`text-xs mt-3 ${theme.textMuted}`}>{files.length} فایل • {totalMB.toFixed(0)}MB</p>
          </div>
        </div>
      </div>

      {error && <div className="mt-4 text-sm text-red-500">{error}</div>}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-8 space-y-3">
            <div className="flex items-center justify-between px-2">
              <h3 className={`text-sm font-semibold ${theme.textMuted}`}>
                {content.ui.list.title} ({files.length} {content.ui.list.countSuffix})
              </h3>
              <button onClick={() => setFiles([])} disabled={isProcessing} className="text-xs text-red-500 hover:underline disabled:opacity-40">
                {content.ui.list.clearAll}
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
              {files.map((file, idx) => (
                <motion.div
                  key={`${file.name}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center justify-between p-3 rounded-xl border group ${theme.border} ${theme.bg}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-lg ${theme.secondary}`}>
                      <FileText size={18} className={theme.accent} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium truncate max-w-[200px] md:max-w-xs ${theme.text}`}>{file.name}</span>
                      <span className={`text-xs ${theme.textMuted}`}>{formatSize(file.size)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFile(idx)}
                    disabled={isProcessing}
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 pt-6 border-t border-dashed opacity-100 transition-colors duration-300 space-y-3">
        {isProcessing && progress && (
          <div className={`text-xs ${theme.textMuted}`}>
            {content.ui.buttons.processing} ({progress.index}/{progress.total})
          </div>
        )}

        {isProcessing && (
          <button
            onClick={handleCancel}
            className="w-full py-3 rounded-xl font-bold text-sm border"
          >
            Cancel
          </button>
        )}

        <button
          onClick={handleMerge}
          disabled={files.length < 2 || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]
          ${files.length < 2 ? "bg-zinc-300 text-zinc-500 cursor-not-allowed dark:bg-zinc-800" : theme.primary}`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" />
              {content.ui.buttons.processing}
            </>
          ) : (
            <>
              <Download /> {content.ui.buttons.mergeAndDownload}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
