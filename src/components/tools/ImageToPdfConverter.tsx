'use client';

import { useState } from 'react';
import { Upload, Download, X, FileImage } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors'; // ایمپورت هوک تم

export default function ImageToPdfConverter() {
  const colors = useThemeColors(); // دریافت رنگ‌های تم
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...files]);
      setPdfUrl(null);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const convertToPdf = async () => {
    if (selectedImages.length === 0) return;

    setConverting(true);
    try {
      const { jsPDF } = await import('jspdf');
      const pdf = new jsPDF();
      
      let isFirstPage = true;

      for (const image of selectedImages) {
        const imageUrl = URL.createObjectURL(image);
        const img = new Image();
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        let imgWidth = pageWidth - 20;
        let imgHeight = (img.height * imgWidth) / img.width;
        
        if (imgHeight > pageHeight - 20) {
          imgHeight = pageHeight - 20;
          imgWidth = (img.width * imgHeight) / img.height;
        }

        if (!isFirstPage) {
          pdf.addPage();
        }
        
        pdf.addImage(img.src, 'JPEG', 10, 10, imgWidth, imgHeight);
        isFirstPage = false;
        
        URL.revokeObjectURL(imageUrl);
      }

      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      alert('خطا در تبدیل تصاویر به PDF');
    } finally {
      setConverting(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'converted-images.pdf';
    link.click();
  };

  return (
    <div className={`w-full max-w-2xl mx-auto p-6 space-y-6 rounded-xl transition-colors duration-300 ${colors.card}`}>
      
      {/* بخش آپلود */}
      <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 cursor-pointer ${colors.border} hover:border-opacity-70`}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="cursor-pointer w-full h-full block">
          <Upload className={`mx-auto h-12 w-12 mb-4 ${colors.textMuted}`} />
          <p className={`text-lg font-medium ${colors.text}`}>
            تصاویر خود را انتخاب کنید
          </p>
          <p className={`text-sm mt-2 ${colors.textMuted}`}>
            یا بکشید و اینجا رها کنید
          </p>
        </label>
      </div>

      {/* لیست تصاویر انتخاب شده */}
      {selectedImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-medium ${colors.text}`}>
              تصاویر انتخاب شده ({selectedImages.length})
            </h3>
            <button
              onClick={() => setSelectedImages([])}
              className="text-sm text-red-500 hover:text-red-700 transition-colors"
            >
              پاک کردن همه
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {selectedImages.map((image, index) => (
              <div
                key={index}
                className={`relative border rounded-lg p-3 flex items-center gap-3 transition-colors duration-300 ${colors.bg} ${colors.border}`}
              >
                <FileImage className={`h-8 w-8 flex-shrink-0 ${colors.accent}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${colors.text}`}>{image.name}</p>
                  <p className={`text-xs ${colors.textMuted}`}>
                    {(image.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          {/* دکمه تبدیل */}
          <button
            onClick={convertToPdf}
            disabled={converting}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${colors.primary}`}
          >
            {converting ? 'در حال تبدیل...' : 'تبدیل به PDF'}
          </button>
        </div>
      )}

      {/* بخش دانلود */}
      {pdfUrl && (
        <div className={`border rounded-lg p-6 space-y-4 transition-colors duration-300 ${colors.secondary} ${colors.border}`}>
          <div className="flex items-center gap-2">
            <FileImage className="h-6 w-6" />
            <span className="font-medium">PDF شما آماده است!</span>
          </div>
          <button
            onClick={downloadPdf}
            className={`w-full py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${colors.primary}`}
          >
            <Download className="h-5 w-5" />
            دانلود PDF
          </button>
        </div>
      )}
    </div>
  );
}
