// components/tools/ImageConverter.tsx
'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { convertImage, ImageFormat } from '@/utils/image-actions';
import download from 'downloadjs';
import { FileUp, Trash2, Image as ImageIcon, Loader2, Download, ArrowLeftRight } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImageConverter() {
  const theme = useThemeColors();
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<ImageFormat>('image/jpeg');
  const [isProcessing, setIsProcessing] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1, // فعلاً تک فایل
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
    },
  });

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const convertedBlob = await convertImage(file, targetFormat);
      const ext = targetFormat.split('/')[1];
      const newName = file.name.substring(0, file.name.lastIndexOf('.')) + '.' + ext;
      
      download(convertedBlob, newName, targetFormat);
    } catch (err) {
      alert('خطا در تبدیل تصویر');
    } finally {
      setIsProcessing(false);
    }
  };

  const formats = [
    { value: 'image/jpeg', label: 'JPG (مناسب عکس)' },
    { value: 'image/png', label: 'PNG (شفافیت)' },
    { value: 'image/webp', label: 'WebP (مدرن و سبک)' },
  ];

  return (
    <div className={`rounded-3xl border p-6 md:p-10 shadow-xl transition-colors duration-300 ${theme.card} ${theme.border}`}>
      
      {/* آپلودر */}
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
        // وقتی فایل انتخاب شد
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* نمایش فایل */}
          <div className={`flex items-center justify-between p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${theme.secondary}`}>
                <ImageIcon size={24} className={theme.accent} />
              </div>
              <div>
                <p className={`font-bold ${theme.text}`}>{file.name}</p>
                <p className={`text-xs ${theme.textMuted}`}>{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
              <Trash2 size={20} />
            </button>
          </div>

          {/* تنظیمات تبدیل */}
          <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
            <div className={`px-4 py-2 rounded-lg border ${theme.border} ${theme.textMuted} text-sm`}>
              فرمت اصلی
            </div>
            <ArrowLeftRight className={theme.textMuted} />
            
            <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
              {formats.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setTargetFormat(fmt.value as ImageFormat)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all border
                    ${targetFormat === fmt.value 
                      ? `${theme.primary} border-transparent shadow-lg` 
                      : `${theme.bg} ${theme.border} ${theme.text} hover:brightness-95`
                    }
                  `}
                >
                  {fmt.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* دکمه اکشن */}
          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${theme.primary}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" /> در حال جادوگری...
              </>
            ) : (
              <>
                <Download /> تبدیل و دانلود
              </>
            )}
          </button>

        </motion.div>
      )}

    </div>
  );
}
