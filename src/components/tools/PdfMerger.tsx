// components/tools/PdfMerger.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { mergePDFs } from '@/utils/pdf-actions';
import download from 'downloadjs';
import { FileUp, Trash2, FileText, Loader2, Download, Move } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { motion, AnimatePresence } from 'framer-motion';

export default function PdfMerger() {
  const theme = useThemeColors();
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
  });

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const mergedPdfBytes = await mergePDFs(files);
      download(mergedPdfBytes, `merged-toolsmanager-${Date.now()}.pdf`, 'application/pdf');
    } catch (err) {
      alert('خطا در پردازش فایل‌ها');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}>
      
      {/* ناحیه دراپ */}
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
          <div>
            <p className={`text-lg font-bold ${theme.text}`}>
              PDFها را اینجا رها کنید
            </p>
            <p className={`text-sm mt-2 ${theme.textMuted}`}>
              یا کلیک کنید تا فایل‌ها انتخاب شوند
            </p>
          </div>
        </div>
      </div>

      {/* لیست فایل‌ها */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-8 space-y-3"
          >
            <div className="flex items-center justify-between px-2">
              <h3 className={`text-sm font-semibold ${theme.textMuted}`}>فایل‌های انتخاب شده ({files.length})</h3>
              <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:underline">حذف همه</button>
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
                      <span className={`text-xs ${theme.textMuted}`}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* اینجا بعداً میتونی قابلیت جابجایی (Sort) اضافه کنی */}
                    <button
                      onClick={() => handleRemoveFile(idx)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* دکمه عملیات */}
      <div className="mt-8 pt-6 border-t border-dashed opacity-100 transition-colors duration-300" style={{ borderColor: 'inherit' }}>
        <button
          onClick={handleMerge}
          disabled={files.length < 2 || isProcessing}
          className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]
          ${files.length < 2 ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed dark:bg-zinc-800' : theme.primary}
          `}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" /> در حال ترکیب فایل‌ها...
            </>
          ) : (
            <>
              <Download /> ادغام و دانلود فایل نهایی
            </>
          )}
        </button>
      </div>

    </div>
  );
}
