"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import download from "downloadjs";
import {
  FileUp,
  Trash2,
  Image as ImageIcon,
  Download,
  Lock,
  Unlock,
  Info,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useImageResizerContent,
  type ImageResizerToolContent,
} from "./image-resizer.content";
const getSafeImageMime = (mime: string | undefined | null): string => {
  if (!mime) return "image/png";
  if (!mime.startsWith("image/")) return "image/png";
  return mime;
};

const getExtFromMime = (mime: string): string => {
  switch (mime) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/bmp":
      return "bmp";
    case "image/avif":
      return "avif";
    default:
      return "png";
  }
};

export default function ImageResizerTool() {
  const theme = useThemeColors();
  const content: ImageResizerToolContent = useImageResizerContent();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });

  // URL state
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isAddingFromUrl, setIsAddingFromUrl] = useState(false);

  const loadFromFile = (f: File) => {
    setFile(f);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);

      const img = new Image();
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        setWidth(w);
        setHeight(h);
        setOriginalDims({ w, h });
        setAspectRatio(w / h);
      };
      img.src = result;
    };
    reader.readAsDataURL(f);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        loadFromFile(acceptedFiles[0]);
        setImageUrlInput("");
      }
    },
  });

  const handleWidthChange = (val: number) => {
    if (val < 1) val = 1;
    if (val > 10000) val = 10000;
    setWidth(val);
    if (lockAspect && aspectRatio) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    if (val < 1) val = 1;
    if (val > 10000) val = 10000;
    setHeight(val);
    if (lockAspect && aspectRatio) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const handleResetDims = () => {
    setWidth(originalDims.w);
    setHeight(originalDims.h);
  };

const handleResize = () => {
  if (!file || !width || !height || !preview) return;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();

  img.onload = () => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    const safeMime = getSafeImageMime(file.type);
    const extFromName =
      file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
    const knownExts = ["png", "jpg", "jpeg", "webp", "gif", "bmp", "avif"];
    const finalExt = knownExts.includes(extFromName)
      ? extFromName
      : getExtFromMime(safeMime);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          alert(content.ui.alerts.error); // اگر چنین کلیدی داری، یا یک پیام ساده بگذار
          return;
        }
        download(
          blob,
          `resized-${width}x${height}.${finalExt}`,
          safeMime
        );
      },
      safeMime,
      0.95
    );
  };

  img.src = preview;
};


  const handleClear = () => {
    setFile(null);
    setPreview("");
    setWidth(0);
    setHeight(0);
    setAspectRatio(0);
    setOriginalDims({ w: 0, h: 0 });
    setImageUrlInput("");
  };

  const dimsChanged = width !== originalDims.w || height !== originalDims.h;

  // لود تصویر از URL (دانلود با اینترنت خود کاربر، پردازش فقط در مرورگر)
  const handleAddFromUrl = async () => {
    const url = imageUrlInput.trim();
    if (!url) return;

    setIsAddingFromUrl(true);
    try {
      const res = await fetch(url, { mode: "cors" });
      if (!res.ok) {
        throw new Error("Failed to fetch image");
      }

      const blob = await res.blob();
      if (!blob.type.startsWith("image/")) {
        throw new Error("Not an image");
      }

      const urlParts = url.split("/");
      const lastPart = urlParts[urlParts.length - 1] || "image-from-url";
      const cleanName = lastPart.split("?")[0] || "image-from-url";

      const fetchedFile = new File([blob], cleanName, {
        type: blob.type || "image/*",
      });

      loadFromFile(fetchedFile);
      setImageUrlInput("");
    } catch (err) {
      alert(content.ui.upload.urlError);
      console.error(err);
    } finally {
      setIsAddingFromUrl(false);
    }
  };

  return (
    <div
      className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}
    >
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
              ${
                isDragActive
                  ? "border-blue-500 scale-[0.99] bg-blue-50 dark:bg-blue-950/20"
                  : `${theme.border} hover:border-blue-400`
              }
              ${theme.bg}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`p-4 rounded-full ${
                    theme.secondary
                  } transition-transform ${isDragActive ? "scale-110" : ""}`}
                >
                  <FileUp size={32} className={theme.accent} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${theme.text}`}>
                    {content.ui.upload.dropTitle}
                  </p>
                  <p className={`text-sm mt-1 ${theme.textMuted}`}>
                    {content.ui.upload.dropSubtitle}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* پیش‌نمایش تصویر */}
            {preview && (
              <div
                className={`relative rounded-2xl overflow-hidden border-2 ${theme.border} bg-gradient-to-br ${theme.gradient} p-1`}
              >
                <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-80 object-contain mx-auto"
                  />
                </div>
              </div>
            )}

            {/* اطلاعات فایل */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl border ${theme.border} ${theme.bg}`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${theme.secondary}`}>
                  <ImageIcon size={24} className={theme.accent} />
                </div>
                <div>
                  <p className={`font-bold ${theme.text}`}>{file.name}</p>
                  <p className={`text-xs ${theme.textMuted}`}>
                    {content.ui.fileInfo.originalDims} {originalDims.w} ×{" "}
                    {originalDims.h}
                  </p>
                  {dimsChanged && (
                    <p className={`text-xs font-bold ${theme.accent}`}>
                      {content.ui.fileInfo.currentDims} {width} × {height}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClear}
                className={`p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors`}
                title={content.ui.buttons.clear}
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* اطلاعیه قفل نسبت */}
            <div
              className={`flex items-start gap-3 p-4 rounded-xl border ${theme.note.infoBorder} ${theme.note.infoBg}`}
            >
              <Info size={20} className={theme.note.infoText} />
              <p className={`text-sm ${theme.note.infoText}`}>
                {lockAspect
                  ? content.ui.info.aspectRatioLocked
                  : content.ui.info.aspectRatioUnlocked}
              </p>
            </div>

            {/* ورودی ابعاد */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className={`text-sm font-bold ${theme.text}`}>
                  {content.ui.inputs.widthLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={width}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    placeholder={content.ui.inputs.widthPlaceholder}
                    className={`w-full p-3 pr-12 rounded-xl border focus:ring-2 ${theme.ring} outline-none transition-all ${theme.bg} ${theme.border} ${theme.text}`}
                  />
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${theme.textMuted}`}
                  >
                    px
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm font-bold ${theme.text}`}>
                  {content.ui.inputs.heightLabel}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={height}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    placeholder={content.ui.inputs.heightPlaceholder}
                    className={`w-full p-3 pr-12 rounded-xl border focus:ring-2 ${theme.ring} outline-none transition-all ${theme.bg} ${theme.border} ${theme.text}`}
                  />
                  <span
                    className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm ${theme.textMuted}`}
                  >
                    px
                  </span>
                </div>
              </div>
            </div>

            {/* دکمه‌های کنترل */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-all ${
                  lockAspect
                    ? `${theme.primary}`
                    : `${theme.bg} ${theme.border} ${theme.text} hover:bg-opacity-80`
                }`}
                title={
                  lockAspect
                    ? content.ui.buttons.lockTitle
                    : content.ui.buttons.unlockTitle
                }
              >
                {lockAspect ? <Lock size={18} /> : <Unlock size={18} />}
                {lockAspect
                  ? content.ui.buttons.lockTitle
                  : content.ui.buttons.unlockTitle}
              </button>

              {dimsChanged && (
                <button
                  onClick={handleResetDims}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-all ${theme.bg} ${theme.border} ${theme.text} hover:bg-opacity-80`}
                  title={content.ui.buttons.resetDims}
                >
                  <RotateCcw size={18} />
                  {content.ui.buttons.resetDims}
                </button>
              )}
            </div>

            {/* دکمه دانلود */}
            <button
              onClick={handleResize}
              disabled={!width || !height}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
            >
              <Download size={20} />
              {content.ui.buttons.resizeAndDownload}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* لود از URL */}
      <div className="mt-6 space-y-2">
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
            className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 text-slate-100 hover:bg-slate-700 disabled:opacity-60"
          >
            {isAddingFromUrl
              ? content.ui.upload.urlLoading
              : content.ui.upload.urlButton}
          </button>
        </div>
      </div>
    </div>
  );
}
