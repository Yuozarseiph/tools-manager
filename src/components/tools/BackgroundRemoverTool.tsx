// components/tools/BackgroundRemoverTool.tsx
"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  removeBackgroundBatch,
  RemovalOptions,
  RemovalResult,
} from "@/utils/background-removal-actions";
import download from "downloadjs";
import JSZip from "jszip";
import {
  FileUp,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Download,
  X,
  FolderArchive,
  Sparkles,
  AlertCircle,
  Info,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { motion, AnimatePresence } from "framer-motion";

interface FileWithPreview extends File {
  preview: string;
}

export default function BackgroundRemoverTool() {
  const theme = useThemeColors();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [results, setResults] = useState<RemovalResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState<"high" | "medium" | "low">("medium");
  const [format, setFormat] = useState<"image/png" | "image/webp">("image/png");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [showWarning, setShowWarning] = useState(true);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"],
    },
    maxFiles: 10,
    onDrop: (acceptedFiles) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setFiles((prev) => [...prev, ...filesWithPreview]);
      setResults([]);
    },
  });

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
      results.forEach((result) => URL.revokeObjectURL(result.processedUrl));
    };
  }, [files, results]);

  const handleRemoveBackground = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setModelLoading(true);
    setCurrentFileIndex(0);
    setProgress(0);

    try {
      const options: RemovalOptions = { quality, format };

      const processedResults = await removeBackgroundBatch(
        files,
        options,
        (fileIndex, fileProgress) => {
          if (fileProgress > 0) {
            setModelLoading(false);
          }

          setCurrentFileIndex(fileIndex);
          setProgress(fileProgress);
        }
      );

      setResults(processedResults);
    } catch (err) {
      console.error(err);
      alert(
        "خطا در حذف پس‌زمینه. لطفاً دوباره تلاش کنید یا مرورگر خود را آپدیت کنید."
      );
    } finally {
      setIsProcessing(false);
      setModelLoading(false);
      setProgress(100);
    }
  };

  const handleDownload = async () => {
    if (results.length === 0) return;

    if (results.length === 1) {
      download(results[0].processedBlob, results[0].filename, format);
    } else {
      const zip = new JSZip();
      results.forEach((result) => {
        zip.file(result.filename, result.processedBlob);
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      download(zipBlob, "removed-backgrounds.zip", "application/zip");
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResults([]);
  };

  const qualityOptions = [
    { value: "low", label: "سریع", desc: "کیفیت پایین", size: "~15 MB" },
    { value: "medium", label: "متوسط", desc: "توصیه‌شده", size: "~35 MB" },
    { value: "high", label: "عالی", desc: "کیفیت بالا", size: "~70 MB" },
  ];

  return (
    <div className="space-y-6">
      {/* هشدار دانلود مدل */}
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`rounded-2xl border p-4 md:p-6 ${theme.card} ${theme.border} shadow-lg`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${theme.secondary} flex-shrink-0`}>
              <Info size={24} className={theme.accent} />
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg mb-2 ${theme.text}`}>
                توجه: دانلود مدل هوش مصنوعی
              </h3>
              <div className={`space-y-2 text-sm ${theme.textMuted}`}>
                <p>
                  اولین بار که این ابزار رو استفاده می‌کنید، مدل هوش مصنوعی به
                  صورت خودکار دانلود می‌شه:
                </p>
                <ul className="list-disc list-inside space-y-1 mr-2">
                  <li>
                    <strong>کیفیت سریع:</strong> ~15 مگابایت
                  </li>
                  <li>
                    <strong>کیفیت متوسط:</strong> ~35 مگابایت (پیشفرض)
                  </li>
                  <li>
                    <strong>کیفیت عالی:</strong> ~70 مگابایت
                  </li>
                </ul>
                <p className="flex items-center gap-2 mt-3">
                  <AlertCircle size={16} />
                  بعد از دانلود، همه‌چیز <strong>کاملاً آفلاین</strong> کار
                  می‌کنه و نیازی به اینترنت نیست!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${theme.textMuted}`}
            >
              <X size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {/* کارت اصلی */}
      <div
        className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}
      >
        {/* آپلودر */}
        {files.length === 0 ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
            ${
              isDragActive
                ? "border-blue-500 scale-[0.99]"
                : `${theme.border} hover:border-blue-400`
            }
            ${theme.bg}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full ${theme.secondary}`}>
                <Sparkles size={32} className={theme.accent} />
              </div>
              <p className={`text-lg font-bold ${theme.text}`}>
                تصاویر را اینجا رها کنید
              </p>
              <p className={`text-sm ${theme.textMuted}`}>
                تا 10 فایل همزمان • حذف پس‌زمینه با AI
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* نمایش نتایج (Before/After) */}
            {results.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((result, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`relative rounded-xl overflow-hidden border-2 ${theme.border} ${theme.bg} shadow-lg`}
                    >
                      {/* Before/After Slider */}
                      <div className="relative aspect-square bg-gray-100">
                        <img
                          src={result.processedUrl}
                          alt="Processed"
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        <div
                          className="absolute inset-0 overflow-hidden"
                          style={{
                            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                          }}
                        >
                          <img
                            src={files[idx].preview}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div
                          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
                          style={{ left: `${sliderPosition}%` }}
                          onMouseDown={(e) => {
                            const startX = e.clientX;
                            const startPosition = sliderPosition;

                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              const rect =
                                e.currentTarget.parentElement!.getBoundingClientRect();
                              const delta =
                                ((moveEvent.clientX - startX) / rect.width) *
                                100;
                              const newPosition = Math.max(
                                0,
                                Math.min(100, startPosition + delta)
                              );
                              setSliderPosition(newPosition);
                            };

                            const handleMouseUp = () => {
                              document.removeEventListener(
                                "mousemove",
                                handleMouseMove
                              );
                              document.removeEventListener(
                                "mouseup",
                                handleMouseUp
                              );
                            };

                            document.addEventListener(
                              "mousemove",
                              handleMouseMove
                            );
                            document.addEventListener("mouseup", handleMouseUp);
                          }}
                        >
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <div className="w-1 h-4 bg-gray-400 rounded" />
                          </div>
                        </div>

                        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
                          قبل
                        </div>
                        <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 text-white text-xs rounded-full">
                          بعد
                        </div>
                      </div>

                      <div className="p-3">
                        <p
                          className={`text-sm font-medium truncate ${theme.text}`}
                        >
                          {result.filename}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={handleDownload}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${theme.primary}`}
                >
                  {results.length > 1 ? (
                    <>
                      <FolderArchive /> دانلود همه (ZIP)
                    </>
                  ) : (
                    <>
                      <Download /> دانلود تصویر
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    setFiles([]);
                    setResults([]);
                  }}
                  className={`w-full py-2 rounded-xl text-sm font-medium transition ${theme.textMuted} hover:text-red-500`}
                >
                  <Trash2 size={16} className="inline ml-2" />
                  شروع مجدد
                </button>
              </div>
            ) : (
              <>
                {/* گالری پیش‌نمایش */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2">
                  <AnimatePresence>
                    {files.map((file, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`relative group rounded-xl overflow-hidden border-2 ${theme.border} ${theme.bg} shadow-md hover:shadow-lg transition-all`}
                      >
                        <div className="aspect-square relative bg-gray-100">
                          <img
                            src={file.preview}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={() => removeFile(idx)}
                              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-transform hover:scale-110"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>

                        <div className="p-2">
                          <p
                            className={`text-xs font-medium truncate ${theme.text}`}
                          >
                            {file.name}
                          </p>
                        </div>

                        <button
                          onClick={() => removeFile(idx)}
                          className="absolute top-2 left-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg md:hidden"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  {...getRootProps()}
                  className={`w-full py-3 rounded-xl border-2 border-dashed font-medium transition ${theme.border} ${theme.text} hover:border-blue-400`}
                >
                  <input {...getInputProps()} />+ افزودن تصاویر بیشتر (
                  {files.length}/10)
                </button>

                {/* تنظیمات */}
                <div className="space-y-4">
                  <div>
                    <label
                      className={`text-sm font-medium ${theme.text} block mb-2`}
                    >
                      کیفیت پردازش
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {qualityOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setQuality(opt.value as any)}
                          className={`p-3 rounded-xl text-sm font-medium transition-all border text-center
                            ${
                              quality === opt.value
                                ? `${theme.primary} border-transparent shadow-lg`
                                : `${theme.bg} ${theme.border} ${theme.text} hover:brightness-95`
                            }`}
                        >
                          <div className="font-bold">{opt.label}</div>
                          <div className={`text-xs opacity-70 mt-1`}>
                            {opt.desc}
                          </div>
                          <div className={`text-xs opacity-50 mt-0.5`}>
                            {opt.size}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      className={`text-sm font-medium ${theme.text} block mb-2`}
                    >
                      فرمت خروجی
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFormat("image/png")}
                        className={`p-3 rounded-xl text-sm font-medium transition-all border
                          ${
                            format === "image/png"
                              ? `${theme.primary} border-transparent shadow-lg`
                              : `${theme.bg} ${theme.border} ${theme.text} hover:brightness-95`
                          }`}
                      >
                        PNG (بهترین کیفیت)
                      </button>
                      <button
                        onClick={() => setFormat("image/webp")}
                        className={`p-3 rounded-xl text-sm font-medium transition-all border
                          ${
                            format === "image/webp"
                              ? `${theme.primary} border-transparent shadow-lg`
                              : `${theme.bg} ${theme.border} ${theme.text} hover:brightness-95`
                          }`}
                      >
                        WebP (کم‌حجم‌تر)
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRemoveBackground}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${theme.primary} disabled:opacity-50`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin" />
                      {modelLoading
                        ? "در حال بارگذاری مدل..."
                        : `پردازش ${currentFileIndex + 1}/${
                            files.length
                          } (${Math.round(progress)}%)`}
                    </>
                  ) : (
                    <>
                      <Sparkles /> حذف پس‌زمینه ({files.length} تصویر)
                    </>
                  )}
                </button>

                {isProcessing && !modelLoading && (
                  <div
                    className={`h-2 rounded-full overflow-hidden ${theme.secondary}`}
                  >
                    <motion.div
                      className="h-full bg-blue-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
