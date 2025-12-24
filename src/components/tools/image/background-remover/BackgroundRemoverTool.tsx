// components/tools/image/background-remover/BackgroundRemoverTool.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Download, FileUp, Trash2, Link2 } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import { useBackgroundRemoverContent } from "./background-remover.content";

import { removeBackground } from "@imgly/background-removal";

type DataUrl = string | null;

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

export default function BackgroundRemoverTool() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = useBackgroundRemoverContent();

  const [file, setFile] = useState<File | null>(null);
  const [inputPreview, setInputPreview] = useState<DataUrl>(null);
  const [outputUrl, setOutputUrl] = useState<DataUrl>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [firstRun, setFirstRun] = useState(true);

  // URL state
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isAddingFromUrl, setIsAddingFromUrl] = useState(false);

  const inputMeta = useMemo(() => {
    if (!file) return null;
    return { size: file.size, type: file.type || "-" };
  }, [file]);

  const cleanupOutput = () => {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
      setOutputUrl(null);
    }
  };

  const resetAll = () => {
    cleanupOutput();
    setFile(null);
    setInputPreview(null);
    setOutputUrl(null);
    setOutputSize(null);
    setImageUrlInput("");
  };

  useEffect(() => {
    return () => cleanupOutput();
  }, []);

  const runRemoveBackground = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    cleanupOutput();
    setFirstRun(false);

    try {
      const result = await removeBackground(file);
      const blob = new Blob([result], { type: "image/png" });
      setOutputSize(blob.size);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
    } catch (e) {
      console.error(e);
      alert(content.ui.errors.processingFailed);
    } finally {
      setIsProcessing(false);
    }
  }, [file, content.ui.errors.processingFailed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: useCallback(
      async (acceptedFiles: File[]) => {
        const f = acceptedFiles?.[0];
        if (!f) return;
        if (!f.type.startsWith("image/")) {
          alert(content.ui.errors.notImage);
          return;
        }

        resetAll();
        setFile(f);
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onerror = () => reject(new Error("FileReader error"));
          r.onload = () => resolve(String(r.result));
          r.readAsDataURL(f);
        });
        setInputPreview(dataUrl);
      },
      [content.ui.errors.notImage]
    ),
  });

  const handleAddFromUrl = async () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    setIsAddingFromUrl(true);
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) throw new Error("Fetch failed");

      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) throw new Error("Not image");

      const ext = blob.type.includes("png")
        ? "png"
        : blob.type.includes("webp")
        ? "webp"
        : "jpg";
      const f = new File([blob], `from-url.${ext}`, { type: blob.type });

      resetAll();
      setFile(f);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onerror = () => reject(new Error("FileReader error"));
        r.onload = () => resolve(String(r.result));
        r.readAsDataURL(f);
      });
      setInputPreview(dataUrl);
      setImageUrlInput("");
    } catch (e) {
      console.error(e);
      alert(content.ui.errors.fetchFailed);
    } finally {
      setIsAddingFromUrl(false);
    }
  };

  const download = () => {
    if (!outputUrl) return;
    const a = document.createElement("a");
    a.href = outputUrl;
    a.download = "background-removed.png";
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload card */}
      <div
        className={`rounded-3xl border overflow-hidden ${theme.bg} ${theme.border}`}
      >
        {!file ? (
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer p-10 w-full min-h-[260px] flex items-center justify-center transition-all duration-200 ${
              isDragActive ? "scale-95" : ""
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4"
            >
              <div className={`p-4 rounded-full ${theme.secondary}`}>
                <FileUp size={32} className={theme.accent} />
              </div>
              <p className={`font-bold text-lg ${theme.text}`}>
                {content.ui.upload.dropTitle}
              </p>
              <p className={`text-sm ${theme.textMuted}`}>
                {content.ui.upload.dropSubtitle}
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className={`text-sm font-bold ${theme.text}`}>
                  {content.ui.input.title}
                </p>
                <p className={`text-xs ${theme.textMuted}`}>
                  {content.ui.input.meta
                    .replace("{size}", formatBytes(inputMeta?.size ?? 0))
                    .replace("{type}", inputMeta?.type ?? "-")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetAll}
                  className={`p-2 rounded-xl shadow-sm transition-all hover:scale-105 ${theme.card} border ${theme.border}`}
                  title={content.ui.actions.reset}
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 items-start">
              <div
                className={`rounded-2xl border p-3 ${theme.card} ${theme.border}`}
              >
                <p className={`text-xs font-medium mb-2 ${theme.textMuted}`}>
                  {content.ui.input.title}
                </p>
                {inputPreview && (
                  <img
                    src={inputPreview}
                    alt="Input"
                    className="w-full max-h-[360px] object-contain rounded-xl"
                    draggable={false}
                  />
                )}
              </div>

              <div
                className={`rounded-2xl border p-3 ${theme.card} ${theme.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-medium ${theme.textMuted}`}>
                    {content.ui.output.title}
                  </p>

                  <button
                    onClick={runRemoveBackground}
                    disabled={isProcessing}
                    className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      isProcessing ? "opacity-60 cursor-not-allowed" : ""
                    } ${theme.secondary} ${theme.accent}`}
                    title="Remove background"
                  >
                    {isProcessing ? content.ui.upload.loading : "Remove"}
                  </button>
                </div>

                <div className="w-full min-h-[220px] flex items-center justify-center">
                  {outputUrl ? (
                    <img
                      src={outputUrl}
                      alt="Output"
                      className="w-full max-h-[360px] object-contain rounded-xl"
                      draggable={false}
                      style={{
                        background:
                          "linear-gradient(45deg, rgba(0,0,0,.06) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,.06) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,.06) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,.06) 75%)",
                        backgroundSize: "20px 20px",
                        backgroundPosition:
                          "0 0, 0 10px, 10px -10px, -10px 0px",
                      }}
                    />
                  ) : (
                    <p className={`text-sm ${theme.textMuted}`}>
                      {content.ui.upload.export}
                    </p>
                  )}
                </div>

                {outputUrl && (
                  <div className="mt-3 flex items-center justify-between">
                    <p className={`text-xs ${theme.textMuted}`}>
                      {content.ui.output.meta
                        .replace("{size}", formatBytes(outputSize ?? 0))
                        .replace("{type}", "PNG")}
                    </p>
                    <button
                      onClick={download}
                      className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 ${theme.secondary} ${theme.accent}`}
                    >
                      <Download size={16} />
                      {content.ui.output.download}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {firstRun && (
              <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
                {content.ui.upload.firstRunWarning}
              </div>
            )}
          </div>
        )}
      </div>

      {/* load from URL */}
      <div className="space-y-2">
        <p className={`text-xs ${theme.textMuted}`}>
          {content.ui.upload.urlHint}
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder={content.ui.upload.urlPlaceholder}
            className={`flex-1 px-3 py-2 rounded-xl text-xs border ${theme.border} ${theme.bg} ${theme.text} focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          <button
            type="button"
            onClick={handleAddFromUrl}
            disabled={isAddingFromUrl}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-60 flex items-center gap-2 justify-center"
          >
            <Link2 size={16} />
            {isAddingFromUrl
              ? content.ui.upload.urlLoading
              : content.ui.upload.urlButton}
          </button>
        </div>
      </div>
    </div>
  );
}
