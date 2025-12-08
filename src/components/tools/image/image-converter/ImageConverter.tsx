"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import download from "downloadjs";
import JSZip from "jszip";
import {
  FileUp,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Download,
  ArrowLeftRight,
  X,
  FolderArchive,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { convertImages, ImageFormat } from "@/utils/image-actions";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useImageConverterContent,
  type ImageConverterToolContent,
} from "./image-converter.content";

interface FileWithPreview extends File {
  preview: string;
}

export default function ImageConverter() {
  const theme = useThemeColors();
  const content: ImageConverterToolContent = useImageConverterContent();

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [
        ".png",
        ".jpg",
        ".jpeg",
        ".webp",
        ".gif",
        ".bmp",
        ".tiff",
        ".svg",
        ".avif",
      ],
    },
    maxFiles: 20,
    onDrop: (acceptedFiles) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setFiles((prev) => [...prev, ...filesWithPreview]);
    },
  });

  useEffect(() => {
    return () => {
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const results = await convertImages(files, targetFormat, {
        quality: quality / 100,
      });

      if (results.length === 1) {
        download(results[0].converted, results[0].filename, targetFormat);
      } else {
        const zip = new JSZip();
        results.forEach((result) => {
          zip.file(result.filename, result.converted);
        });

        const zipBlob = await zip.generateAsync({ type: "blob" });
        download(zipBlob, "converted-images.zip", "application/zip");
      }
    } catch (err) {
      alert(content.ui.alerts.error);
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(files[index].preview);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formats = [
    {
      value: "image/jpeg",
      label: "JPG",
      desc: content.ui.formats.jpegDesc,
    },
    {
      value: "image/png",
      label: "PNG",
      desc: content.ui.formats.pngDesc,
    },
    {
      value: "image/webp",
      label: "WebP",
      desc: content.ui.formats.webpDesc,
    },
    {
      value: "image/avif",
      label: "AVIF",
      desc: content.ui.formats.avifDesc,
    },
    {
      value: "image/gif",
      label: "GIF",
      desc: content.ui.formats.gifDesc,
    },
    {
      value: "image/bmp",
      label: "BMP",
      desc: content.ui.formats.bmpDesc,
    },
  ] as const;

  return (
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
              <FileUp size={32} className={theme.accent} />
            </div>
            <p className={`text-lg font-bold ${theme.text}`}>
              {content.ui.upload.dropTitle}
            </p>
            <p className={`text-sm ${theme.textMuted}`}>
              {content.ui.upload.dropSubtitle}
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
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
                    <p className={`text-xs font-medium truncate ${theme.text}`}>
                      {file.name}
                    </p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      {(file.size / 1024).toFixed(0)}{" "}
                      {content.ui.gallery.sizeUnit}
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

          {/* دکمه افزودن بیشتر */}
          <button
            {...getRootProps()}
            className={`w-full py-3 rounded-xl border-2 border-dashed font-medium transition ${theme.border} ${theme.text} hover:border-blue-400`}
          >
            <input {...getInputProps()} />
            {content.ui.upload.addMore} ({files.length}/20{" "}
            {content.ui.upload.counterSuffix})
          </button>

          {/* تنظیمات فرمت */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 justify-center">
              <span className={`text-sm ${theme.textMuted}`}>
                {content.ui.formats.title}
              </span>
              <ArrowLeftRight size={16} className={theme.textMuted} />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {formats.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setTargetFormat(fmt.value as ImageFormat)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all border text-center
                    ${
                      targetFormat === fmt.value
                        ? `${theme.primary} border-transparent shadow-lg`
                        : `${theme.bg} ${theme.border} ${theme.text} hover:brightness-95`
                    }`}
                >
                  <div className="font-bold">{fmt.label}</div>
                  <div className="text-xs opacity-70 mt-1">{fmt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* کیفیت */}
          {["image/jpeg", "image/webp", "image/avif"].includes(
            targetFormat
          ) && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-sm font-medium ${theme.text}`}>
                  {content.ui.quality.label}
                </label>
                <span className={`text-sm font-bold ${theme.accent}`}>
                  {quality}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{content.ui.quality.low}</span>
                <span>{content.ui.quality.high}</span>
              </div>
            </div>
          )}

          {/* دکمه‌های اکشن */}
          <div className="space-y-3">
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${theme.primary} disabled:opacity-50`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" />{" "}
                  {content.ui.buttons.processing}
                </>
              ) : files.length > 1 ? (
                <>
                  <FolderArchive /> {content.ui.buttons.convertMulti} (
                  {files.length})
                </>
              ) : (
                <>
                  <Download /> {content.ui.buttons.convertSingle}
                </>
              )}
            </button>

            <button
              onClick={() => setFiles([])}
              className={`w-full py-2 rounded-xl text-sm font-medium transition ${theme.textMuted} hover:text-red-500`}
            >
              <Trash2 size={16} className="inline ml-2" />
              {content.ui.buttons.clearAll}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
