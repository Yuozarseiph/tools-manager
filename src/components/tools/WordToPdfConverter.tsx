'use client';

import { useState } from 'react';
import { Download, Upload, AlertCircle, FileText, X } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import * as mammoth from 'mammoth';

export default function WordToPdfConverter() {
  const theme = useThemeColors();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx') && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setError('فقط فایل‌های .docx پشتیبانی می‌شوند');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const convertToPdf = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setProgress('در حال خواندن فایل...');
    setError('');

    let iframe: HTMLIFrameElement | null = null;

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      
      setProgress('در حال تبدیل Word به HTML...');
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const html = result.value;

      if (!html) {
        throw new Error('محتوای فایل خالی است.');
      }

      setProgress('در حال رندر محتوا...');

      // ساخت iframe ایزوله (بدون هیچ CSS خارجی)
      iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '794px'; // A4 width در 96dpi
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      // دسترسی به document داخل iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        throw new Error('دسترسی به iframe ممکن نیست.');
      }

      // نوشتن HTML کامل و ایزوله (بدون لینک به هیچ CSS خارجی)
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              width: 794px;
              padding: 40px;
              background: white;
              color: black;
              font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
              font-size: 14px;
              line-height: 1.8;
              direction: auto;
            }
            p {
              margin-bottom: 12px;
              text-align: justify;
            }
            h1, h2, h3, h4, h5, h6 {
              margin: 16px 0 8px 0;
              font-weight: bold;
            }
            ul, ol {
              margin: 12px 0;
              padding-right: 20px;
            }
            li {
              margin-bottom: 6px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 12px 0;
            }
            table td, table th {
              border: 1px solid #ddd;
              padding: 8px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            strong {
              font-weight: bold;
            }
            em {
              font-style: italic;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `);
      iframeDoc.close();

      // کمی صبر کنیم تا محتوا کامل رندر بشه (مهم برای تصاویر)
      await new Promise(resolve => setTimeout(resolve, 500));

      setProgress('در حال تولید PDF...');

      // لود کتابخانه‌ها
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;

      // گرفتن اسکرین‌شات از body داخل iframe
      const iframeBody = iframeDoc.body;
      
      const canvas = await html2canvas(iframeBody, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
        windowHeight: iframeBody.scrollHeight
      });

      // تبدیل Canvas به PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let pageCount = 0;

      // صفحه اول
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.95), 
        'JPEG', 
        0, 
        0, 
        imgWidth, 
        imgHeight
      );
      heightLeft -= pageHeight;

      // صفحات بعدی
      while (heightLeft > 0) {
        pageCount++;
        pdf.addPage();
        const yPosition = -(pageHeight * pageCount);
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.95), 
          'JPEG', 
          0, 
          yPosition, 
          imgWidth, 
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      // دانلود
      pdf.save(`${selectedFile.name.replace('.docx', '')}.pdf`);
      
      setProgress('تبدیل با موفقیت انجام شد!');
      setTimeout(() => {
        setSelectedFile(null);
        setProgress('');
      }, 2000);

    } catch (err) {
      console.error('Conversion error:', err);
      const errorMessage = err instanceof Error ? err.message : 'خطای نامشخص رخ داد';
      setError(`خطا در تبدیل: ${errorMessage}`);
    } finally {
      // پاکسازی iframe
      if (iframe && iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      setIsConverting(false);
    }
  };

  return (
    <div className={`w-full max-w-2xl mx-auto space-y-6`}>
      
      {/* بخش آپلود */}
      <div className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-300 ${theme.border} hover:opacity-80`}>
        <input
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileSelect}
          className="hidden"
          id="word-upload"
          disabled={isConverting}
        />
        <label htmlFor="word-upload" className="cursor-pointer block w-full h-full">
          <Upload className={`mx-auto h-12 w-12 mb-4 ${theme.textMuted}`} />
          <p className={`text-lg font-medium ${theme.text}`}>
            فایل Word خود را انتخاب کنید
          </p>
          <p className={`text-sm mt-2 ${theme.textMuted}`}>
            فرمت مجاز: .docx • بدون محدودیت حجم
          </p>
        </label>
      </div>

      {/* نمایش فایل انتخاب شده */}
      {selectedFile && (
        <div className={`p-4 rounded-lg border flex items-center justify-between transition-colors duration-300 ${theme.card} ${theme.border}`}>
          <div className="flex items-center gap-3">
            <FileText className={theme.accent} size={24} />
            <div>
              <p className={`font-medium ${theme.text}`}>{selectedFile.name}</p>
              <p className={`text-sm ${theme.textMuted}`}>
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            disabled={isConverting}
            className="text-red-500 hover:text-red-700 p-2 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      )}

      {/* پیام خطا */}
      {error && (
        <div className={`p-4 rounded-lg border border-red-300 bg-red-50 flex gap-3 ${theme.name.includes('تاریک') ? 'bg-red-900/20 border-red-700' : ''}`}>
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* نمایش پیشرفت */}
      {progress && (
        <div className={`p-4 rounded-lg border ${theme.secondary} ${theme.border}`}>
          <p className={`text-sm font-medium mb-2 ${theme.text}`}>{progress}</p>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${theme.gradient} transition-all duration-300`}
              style={{
                width: progress.includes('خواندن') ? '20%' : 
                       progress.includes('تبدیل') ? '40%' :
                       progress.includes('رندر') ? '60%' :
                       progress.includes('تولید') ? '80%' : '100%',
                animation: progress.includes('موفقیت') ? 'none' : 'pulse 1.5s infinite'
              }}
            />
          </div>
        </div>
      )}

      {/* دکمه تبدیل */}
      {selectedFile && !progress.includes('موفقیت') && (
        <button
          onClick={convertToPdf}
          disabled={isConverting}
          className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
        >
          <Download size={18} />
          {isConverting ? 'در حال پردازش...' : 'تبدیل به PDF و دانلود'}
        </button>
      )}

      {/* راهنما */}
      <div className={`p-4 rounded-lg border ${theme.secondary} ${theme.border}`}>
        <h3 className={`font-medium mb-3 ${theme.text}`}>✨ ویژگی‌های این ابزار</h3>
        <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
          <li>✓ حفظ کامل فرمت‌ها، جداول و تصاویر</li>
          <li>✓ پشتیبانی کامل از زبان فارسی و راست‌چین</li>
          <li>✓ بدون محدودیت حجم فایل</li>
          <li>✓ امنیت کامل: فایل در مرورگر شما پردازش می‌شود</li>
          <li>✓ صفحه‌بندی خودکار برای اسناد طولانی</li>
        </ul>
      </div>

    </div>
  );
}
