// components/tools/ImageResizerTool.tsx
"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import download from "downloadjs";
import {
  FileUp,
  Trash2,
  Image as ImageIcon,
  Download,
  Lock,
  Unlock,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { motion } from "framer-motion";

export default function ImageResizerTool() {
  const theme = useThemeColors();
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const f = acceptedFiles[0];
        setFile(f);
        const img = new Image();
        img.onload = () => {
          setWidth(img.width);
          setHeight(img.height);
          setOriginalDims({ w: img.width, h: img.height });
          setAspectRatio(img.width / img.height);
        };
        img.src = URL.createObjectURL(f);
      }
    },
  });

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspectRatio) setHeight(Math.round(val / aspectRatio));
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspectRatio) setWidth(Math.round(val * aspectRatio));
  };

  const handleResize = () => {
    if (!file) return;
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (blob) download(blob, `resized-${file.name}`, file.type);
      }, file.type);
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div
      className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}
    >
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${
            isDragActive
              ? "border-blue-500 scale-[0.99]"
              : `${theme.border} hover:border-blue-400`
          }
          ${theme.bg}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${theme.secondary}`}>
              <FileUp size={32} className={theme.accent} />
            </div>
            <p className={`text-lg font-bold ${theme.text}`}>
              تصویر را اینجا رها کنید
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
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
                  ابعاد اصلی: {originalDims.w} x {originalDims.h}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-bold">عرض (Width)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className={`w-full p-3 rounded-xl border focus:ring-2 ring-blue-500/50 outline-none ${theme.bg} ${theme.border}`}
              />
            </div>
            <div className="space-y-2 relative">
              <label className="text-sm font-bold">ارتفاع (Height)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className={`w-full p-3 rounded-xl border focus:ring-2 ring-blue-500/50 outline-none ${theme.bg} ${theme.border}`}
              />
              <button
                onClick={() => setLockAspect(!lockAspect)}
                className={`absolute -left-3 top-9 p-1.5 rounded-full bg-white shadow border ${
                  lockAspect ? "text-blue-500" : "text-gray-400"
                }`}
                title="قفل نسبت تصویر"
              >
                {lockAspect ? <Lock size={14} /> : <Unlock size={14} />}
              </button>
            </div>
          </div>

          <button
            onClick={handleResize}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${theme.primary}`}
          >
            <Download /> تغییر سایز و دانلود
          </button>
        </motion.div>
      )}
    </div>
  );
}
