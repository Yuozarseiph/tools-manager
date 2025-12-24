// components/tools/security/exif-remover/ExifRemoverTool.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Download, FileUp, Trash2, Link2 } from "lucide-react";
// @ts-ignore
import piexif from "piexifjs";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useExifRemoverContent,
  type ExifRemoverToolContent,
} from "./exif-remover.content";

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

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime =
    header?.match(/data:(.*?);base64/)?.[1] ?? "application/octet-stream";
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("FileReader error"));
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(file);
  });
}

export default function ExifRemoverTool() {
  const theme = useThemeColors();
  const content: ExifRemoverToolContent = useExifRemoverContent();

  const [inputFile, setInputFile] = useState<File | null>(null);
  const [inputUrl, setInputUrl] = useState<DataUrl>(null);

  const [outputUrl, setOutputUrl] = useState<DataUrl>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  // URL state
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isAddingFromUrl, setIsAddingFromUrl] = useState(false);

  const outputObjectUrlRef = useRef<string | null>(null);
  const inputObjectUrlRef = useRef<string | null>(null);

  const inputMeta = useMemo(() => {
    if (!inputFile) return null;
    return { size: inputFile.size, type: inputFile.type || "-" };
  }, [inputFile]);

  const outputMeta = useMemo(() => {
    if (!outputBlob) return null;
    return { size: outputBlob.size, type: outputBlob.type || "-" };
  }, [outputBlob]);

  const cleanupUrls = () => {
    if (inputObjectUrlRef.current) {
      URL.revokeObjectURL(inputObjectUrlRef.current);
      inputObjectUrlRef.current = null;
    }
    if (outputObjectUrlRef.current) {
      URL.revokeObjectURL(outputObjectUrlRef.current);
      outputObjectUrlRef.current = null;
    }
  };

  const resetAll = () => {
    cleanupUrls();
    setInputFile(null);
    setInputUrl(null);
    setOutputUrl(null);
    setOutputBlob(null);
    setIsProcessing(false);
    setImageUrlInput("");
  };

  useEffect(() => {
    return () => cleanupUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processJpegDataUrl = (jpegDataUrl: string) => {
    // piexifjs.remove expects JPEG data (DataURL/base64) and returns same format without EXIF
    const cleanedDataUrl = piexif.remove(jpegDataUrl);
    return cleanedDataUrl as string;
  };

  const runProcess = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        alert(content.ui.errors.notImage);
        return;
      }

      setIsProcessing(true);
      try {
        const dataUrl = await fileToDataUrl(file);
        setInputUrl(dataUrl);

        let cleanedDataUrl = dataUrl;

        // MVP: do real EXIF removal for JPEG
        if (file.type === "image/jpeg" || file.type === "image/jpg") {
          cleanedDataUrl = processJpegDataUrl(dataUrl);
        } else {
          // For non-JPEG, keep as-is (still useful as a "privacy reminder")
          // If you want stronger behavior later: re-encode through canvas to PNG/JPEG.
          cleanedDataUrl = dataUrl;
        }

        const blob = dataUrlToBlob(cleanedDataUrl);
        setOutputBlob(blob);

        if (outputObjectUrlRef.current) {
          URL.revokeObjectURL(outputObjectUrlRef.current);
        }
        const objUrl = URL.createObjectURL(blob);
        outputObjectUrlRef.current = objUrl;
        setOutputUrl(objUrl);
      } catch (e) {
        console.error(e);
        alert(content.ui.errors.processingFailed);
      } finally {
        setIsProcessing(false);
      }
    },
    [content.ui.errors.notImage, content.ui.errors.processingFailed]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    multiple: false,
    onDrop: useCallback(
      async (acceptedFiles: File[]) => {
        const f = acceptedFiles?.[0];
        if (!f) return;

        cleanupUrls();
        setInputFile(f);
        await runProcess(f);
      },
      [runProcess]
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
      const file = new File([blob], `from-url.${ext}`, { type: blob.type });

      cleanupUrls();
      setInputFile(file);
      await runProcess(file);
      setImageUrlInput("");
    } catch (e) {
      console.error(e);
      alert(content.ui.errors.fetchFailed);
    } finally {
      setIsAddingFromUrl(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob) return;
    const a = document.createElement("a");
    a.href = outputUrl ?? "";
    a.download = "image-no-exif.jpg";
    a.click();
  };

  return (
    <div className="space-y-6">
      <div
        className={`rounded-3xl border overflow-hidden relative ${theme.bg} ${theme.border}`}
      >
        {!inputFile ? (
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
              <p className={`text-xs ${theme.textMuted}`}>
                {content.ui.notes.jpegOnly}
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className={`font-bold ${theme.text}`}>
                  {content.ui.input.title}
                </h3>
                <p className={`text-xs ${theme.textMuted}`}>
                  {content.ui.input.meta
                    .replace("{size}", formatBytes(inputMeta?.size ?? 0))
                    .replace("{type}", inputMeta?.type ?? "-")}
                </p>
              </div>

              <button
                onClick={resetAll}
                className={`p-2 rounded-xl shadow-sm transition-all hover:scale-105 ${theme.card} border ${theme.border}`}
                title={content.ui.actions.reset}
              >
                <Trash2 size={18} className="text-red-500" />
              </button>
            </div>

            {/* previews */}
            <div className="grid md:grid-cols-2 gap-4">
              <div
                className={`rounded-2xl border p-3 ${theme.card} ${theme.border}`}
              >
                <p className={`text-xs font-medium mb-2 ${theme.textMuted}`}>
                  {content.ui.input.title}
                </p>
                {inputUrl && (
                  <img
                    src={inputUrl}
                    alt="Input"
                    className="w-full max-h-[320px] object-contain rounded-xl"
                    draggable={false}
                  />
                )}
              </div>

              <div
                className={`rounded-2xl border p-3 ${theme.card} ${theme.border}`}
              >
                <p className={`text-xs font-medium mb-2 ${theme.textMuted}`}>
                  {content.ui.output.title}
                </p>

                {isProcessing ? (
                  <div className="w-full min-h-[220px] flex items-center justify-center">
                    <p className={`text-sm ${theme.textMuted}`}>
                      {content.ui.upload.loading}
                    </p>
                  </div>
                ) : outputUrl ? (
                  <>
                    <img
                      src={outputUrl}
                      alt="Output"
                      className="w-full max-h-[320px] object-contain rounded-xl"
                      draggable={false}
                    />
                    <div className="mt-3 flex items-center justify-between">
                      <p className={`text-xs ${theme.textMuted}`}>
                        {content.ui.output.meta
                          .replace("{size}", formatBytes(outputMeta?.size ?? 0))
                          .replace("{type}", outputMeta?.type ?? "-")}
                      </p>
                      <button
                        onClick={handleDownload}
                        className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 ${theme.secondary} ${theme.accent}`}
                      >
                        <Download size={16} />
                        {content.ui.output.download}
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
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
