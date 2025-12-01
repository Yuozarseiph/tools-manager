// components/tools/ImageCompressorTool.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import download from 'downloadjs';
import { FileUp, Trash2, Image as ImageIcon, Loader2, Download, Sliders } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { motion } from 'framer-motion';

export default function ImageCompressorTool() {
  const theme = useThemeColors();
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.8);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setCompressedFile(null);
      }
    },
  });

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality,
      };
      const compressedBlob = await imageCompression(file, options);
      setCompressedFile(compressedBlob);
    } catch (error) {
      alert('خطا در فشرده‌سازی');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (compressedFile) {
      download(compressedFile, `min-${file?.name}`, compressedFile.type);
    }
  };

  return (
    <div className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}>
      {!file ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-blue-500 scale-[0.99]' : `${theme.border} hover:border-blue-400`}
          ${theme.bg}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${theme.secondary}`}>
              <FileUp size={32} className={theme.accent} />
            </div>
            <p className={`text-lg font-bold ${theme.text}`}>تصویر را اینجا رها کنید</p>
          </div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className={`flex items-center justify-between p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${theme.secondary}`}>
                <ImageIcon size={24} className={theme.accent} />
              </div>
              <div>
                <p className={`font-bold ${theme.text}`}>{file.name}</p>
                <div className="flex gap-3 text-xs mt-1">
                  <span className={theme.textMuted}>اصلی: {(file.size / 1024).toFixed(1)} KB</span>
                  {compressedFile && (
                    <span className="text-green-500 font-bold">
                      جدید: {(compressedFile.size / 1024).toFixed(1)} KB 
                      ({Math.round((1 - compressedFile.size / file.size) * 100)}% کاهش)
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => { setFile(null); setCompressedFile(null); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 size={20} />
            </button>
          </div>

          <div className={`p-6 rounded-2xl border ${theme.border} ${theme.bg}`}>
            <div className="flex items-center gap-2 mb-4 font-bold">
              <Sliders size={18} /> تنظیمات فشرده‌سازی
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>کیفیت</span>
                <span>{Math.round(quality * 100)}%</span>
              </div>
              <input 
                type="range" min="0.1" max="1" step="0.1" 
                value={quality} onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleCompress}
              disabled={isProcessing}
              className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${theme.secondary}`}
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : 'شروع فشرده‌سازی'}
            </button>
            
            <button
              onClick={handleDownload}
              disabled={!compressedFile}
              className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] 
              ${!compressedFile ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-500' : theme.primary}`}
            >
              <Download /> دانلود
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
