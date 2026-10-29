// components/tools/pdf/pdf-merge/PdfMerger.tsx
"use client";
import { outputFilename } from "@/lib/output-name";
import { AccessibleDropzone } from "@/components/ui/AccessibleControls";
import { AccessibleButton } from "@/components/ui/AccessibleControls";
import { AccessibleInput } from "@/components/ui/AccessibleControls";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { saveFile as download } from "@/lib/file-export";
import { FileUp, Trash2, FileText, Loader2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  usePdfMergeContent,
  type PdfMergeToolContent,
} from "./pdf-merge.content";

type WorkerOut =
  | { type: "progress"; index: number; total: number }
  | { type: "done"; buffer: ArrayBuffer }
  | { type: "error"; message: string };

export default function PdfMerger() {
  const theme = useThemeColors();
  const content: PdfMergeToolContent = usePdfMergeContent();

  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    index: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState("");

  const workerRef = useRef<Worker | null>(null);
  const cleanupJobRef = useRef<(() => void) | null>(null);

  const createWorker = () => new Worker(
    new URL("./pdf-merge.worker.ts", import.meta.url), { type: "module" }
  );

  const totalBytes = useMemo(
    () => files.reduce((s, f) => s + f.size, 0),
    [files]
  );
  const totalMB = useMemo(() => totalBytes / 1024 / 1024, [totalBytes]);

  useEffect(() => {
    try { workerRef.current = createWorker(); }
    catch { setError(content.ui.alerts.error); }
    return () => {
      cleanupJobRef.current?.();
      workerRef.current?.terminate();
      workerRef.current = null;
    };
    // Workers are owned by this component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restartWorker = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    try { workerRef.current = createWorker(); }
    catch { setError(content.ui.alerts.error); }
  };

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
    cleanupJobRef.current?.();
    restartWorker();
    setIsProcessing(false);
    setProgress(null);
    setError(content.ui.alerts.cancelled);
  };

  const handleMerge = () => {
    if (files.length < 2 || isProcessing) return;
    if (!workerRef.current) {
      try { workerRef.current = createWorker(); }
      catch { setError(content.ui.alerts.error); return; }
    }
    setIsProcessing(true);
    setError("");
    setProgress({ index: 0, total: files.length });
    const worker = workerRef.current;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let finished = false;
    const cleanup = () => {
      if (finished) return;
      finished = true;
      if (timer !== null) clearTimeout(timer);
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onWorkerError);
      worker.removeEventListener("messageerror", onWorkerError);
      cleanupJobRef.current = null;
    };
    const finish = (reason?: string, reset = false) => {
      cleanup();
      if (reset) restartWorker();
      if (reason) setError(reason);
      setIsProcessing(false);
      setProgress(null);
    };
    const onWorkerError = (event: Event) => {
      if (event.type === "error") event.preventDefault();
      finish(content.ui.alerts.error, true);
    };
    const onMessage = (ev: MessageEvent<WorkerOut>) => {
      const msg = ev.data;
      if (msg.type === "progress") {
        setProgress({ index: msg.index, total: msg.total });
      } else if (msg.type === "done") {
        try {
          download(new Uint8Array(msg.buffer), outputFilename(`merged-qodeforge-${Date.now()}.pdf`), "application/pdf");
          finish();
        } catch { finish(content.ui.alerts.error, true); }
      } else if (msg.type === "error") {
        finish(msg.message || content.ui.alerts.error, true);
      }
    };
    cleanupJobRef.current = cleanup;
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onWorkerError);
    worker.addEventListener("messageerror", onWorkerError);
    // Avoid a permanent loading state on a stuck Worker.
    timer = setTimeout(() => finish(content.ui.alerts.timeout, true), 300_000);
    try { worker.postMessage({ type: "merge", files }); }
    catch { finish(content.ui.alerts.error, true); }
  };

  const formatSize = (size: number) =>
    `${(size / 1024 / 1024).toFixed(2)} ${content.ui.list.sizeUnit}`;

  return (
    <div
      className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}
    >
      <AccessibleDropzone
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
        ${
          isDragActive
            ? "border-[var(--app-accent)] scale-[0.99]"
            : `${theme.border} hover:border-[var(--app-accent)]`
        }
        ${theme.bg}
        ${isProcessing ? "opacity-100 pointer-events-none" : ""}`}
      >
        <AccessibleInput {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${theme.secondary}`}>
            <FileUp size={32} className={theme.accent} />
          </div>
          <div>
            <p className={`text-lg font-bold ${theme.text}`}>
              {content.ui.dropzone.title}
            </p>
            <p className={`text-sm mt-2 ${theme.textMuted}`}>
              {content.ui.dropzone.subtitle}
            </p>
            <p className={`text-xs mt-3 ${theme.textMuted}`}>
              {files.length} {content.ui.list.countSuffix} •{" "}
              {totalMB.toFixed(0)}
              {content.ui.list.sizeUnit}
            </p>
          </div>
        </div>
      </AccessibleDropzone>

      {error && <div role="alert" className="mt-4 text-sm text-[var(--app-error-text)]">{error}</div>}

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-8 space-y-3"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className={`text-sm font-semibold ${theme.textMuted}`}>
                {content.ui.list.title} ({files.length}{" "}
                {content.ui.list.countSuffix})
              </h3>
              <button
                onClick={() => setFiles([])}
                disabled={isProcessing}
                className="text-xs text-[var(--app-error-text)] hover:underline disabled:opacity-40"
              >
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
                      <span
                        className={`text-sm font-medium truncate max-w-[200px] md:max-w-xs ${theme.text}`}
                      >
                        {file.name}
                      </span>
                      <span className={`text-xs ${theme.textMuted}`}>
                        {formatSize(file.size)}
                      </span>
                    </div>
                  </div>

                  <AccessibleButton purpose="delete"
                    onClick={() => handleRemoveFile(idx)}
                    disabled={isProcessing}
                    className="p-2 text-[var(--app-text-muted)] hover:text-[var(--app-error-text)] hover:bg-[var(--app-error-bg)] rounded-lg transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={18} />
                  </AccessibleButton>
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
            {content.ui.buttons.cancel}
          </button>
        )}

        <button data-testid="download-result"
          onClick={handleMerge}
          disabled={files.length < 2 || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]
          ${
            files.length < 2
              ? "bg-zinc-300 text-[var(--app-text-muted)] cursor-not-allowed dark:bg-zinc-800"
              : theme.primary
          }`}
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

