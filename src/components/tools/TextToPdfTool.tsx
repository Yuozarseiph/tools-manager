'use client';

import { useState } from 'react';
import { Download, AlignLeft, AlignCenter, AlignRight, Type, FileText } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function TextToPdfTool() {
  const theme = useThemeColors();
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(12);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('right');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  const generatePdf = async () => {
    if (!text.trim()) return;

    setIsGenerating(true);
    setDownloadProgress('در حال آماده‌سازی موتور PDF...');

    try {
      // ایمپورت داینامیک برای جلوگیری از لود سنگین اولیه
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // 1. دانلود و افزودن فونت فارسی (وزیر)
      setDownloadProgress('در حال دریافت فونت فارسی...');
      try {
        const fontUrl = 'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/ttf/Vazirmatn-Regular.ttf';
        const response = await fetch(fontUrl);
        if (!response.ok) throw new Error('خطا در دانلود فونت');
        const fontBytes = await response.arrayBuffer();
        
        // تبدیل بافر به رشته باینری برای jsPDF
        const binaryString = Array.from(new Uint8Array(fontBytes))
          .map(byte => String.fromCharCode(byte))
          .join('');
        
        // افزودن فونت به سیستم فایل مجازی jsPDF
        doc.addFileToVFS('Vazir.ttf', btoa(binaryString));
        doc.addFont('Vazir.ttf', 'Vazir', 'normal');
        doc.setFont('Vazir');
      } catch (e) {
        console.error('Font loading failed, falling back to default', e);
        alert('دانلود فونت فارسی با شکست مواجه شد. از فونت پیش‌فرض استفاده می‌شود.');
      }

      setDownloadProgress('در حال صفحه‌بندی...');

      // 2. تنظیمات صفحه و متن
      doc.setFontSize(fontSize);
      const pageWidth = doc.internal.pageSize.getWidth(); // عرض صفحه A4 (~210mm)
      const pageHeight = doc.internal.pageSize.getHeight(); // ارتفاع صفحه A4 (~297mm)
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);
      const lineHeight = fontSize * 0.5; // تبدیل تقریبی pt به mm و فاصله خطوط

      // 3. شکستن متن به خطوط (Text Wrapping)
      // این متد متن را بر اساس عرض صفحه می‌شکند و آرایه‌ای از خطوط برمی‌گرداند
      const splitText = doc.splitTextToSize(text, maxLineWidth);

      // 4. حلقه تولید صفحات
      let cursorY = margin + 10; // موقعیت شروع عمودی
      
      // محاسبه موقعیت X بر اساس تراز
      let x = margin;
      if (alignment === 'center') x = pageWidth / 2;
      else if (alignment === 'right') x = pageWidth - margin;

      for (let i = 0; i < splitText.length; i++) {
        // چک کردن اینکه آیا به انتهای صفحه رسیدیم؟
        if (cursorY + lineHeight > pageHeight - margin) {
          doc.addPage(); // صفحه جدید
          cursorY = margin + 10; // ریست کردن موقعیت Y
        }

        // نوشتن خط جاری
        doc.text(splitText[i], x, cursorY, {
          align: alignment,
          baseline: 'top',
          isInputRtl: true // فعال‌سازی پشتیبانی RTL داخلی jsPDF
        });

        cursorY += lineHeight * 1.5; // رفتن به خط بعدی
      }

      // 5. ذخیره فایل
      doc.save('text-converted.pdf');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('خطا در ساخت فایل PDF.');
    } finally {
      setIsGenerating(false);
      setDownloadProgress('');
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto space-y-6`}>
      
      {/* نوار ابزار تنظیمات */}
      <div className={`p-4 rounded-xl border flex flex-wrap gap-4 items-center justify-between transition-colors duration-300 ${theme.card} ${theme.border}`}>
        
        <div className="flex items-center gap-4">
          {/* انتخاب سایز فونت */}
          <div className="flex items-center gap-2">
            <Type size={18} className={theme.textMuted} />
            <select 
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={`bg-transparent border rounded px-2 py-1 outline-none cursor-pointer ${theme.border} ${theme.text}`}
            >
              {[10, 12, 14, 16, 18, 20, 24, 30].map(size => (
                <option key={size} value={size} className="text-black">{size}px</option>
              ))}
            </select>
          </div>

          <div className={`w-px h-6 ${theme.border} border-r`} />

          {/* دکمه‌های تراز متن */}
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setAlignment('left')} 
              className={`p-2 rounded transition-colors ${alignment === 'left' ? theme.primary : theme.textMuted}`}
              title="چپ‌چین"
            >
              <AlignLeft size={18} />
            </button>
            <button 
              onClick={() => setAlignment('center')} 
              className={`p-2 rounded transition-colors ${alignment === 'center' ? theme.primary : theme.textMuted}`}
              title="وسط‌چین"
            >
              <AlignCenter size={18} />
            </button>
            <button 
              onClick={() => setAlignment('right')} 
              className={`p-2 rounded transition-colors ${alignment === 'right' ? theme.primary : theme.textMuted}`}
              title="راست‌چین"
            >
              <AlignRight size={18} />
            </button>
          </div>
        </div>

        <button
          onClick={generatePdf}
          disabled={!text.trim() || isGenerating}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${theme.primary}`}
        >
          {isGenerating ? (
            <span className="text-sm animate-pulse">{downloadProgress || 'در حال پردازش...'}</span>
          ) : (
            <>
              <Download size={18} />
              <span>دانلود PDF</span>
            </>
          )}
        </button>
      </div>

      {/* ناحیه ورودی متن */}
      <div className="relative group">
        <textarea
          dir="auto"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="متن خود را اینجا تایپ کنید یا جایگذاری نمایید..."
          className={`w-full h-[500px] p-6 rounded-xl border resize-none outline-none focus:ring-2 transition-all duration-300 ${theme.card} ${theme.text} ${theme.border} ${theme.ring} placeholder:text-gray-400`}
          style={{ 
            fontSize: `${fontSize}px`,
            textAlign: alignment,
            lineHeight: '1.6',
            fontFamily: 'inherit'
          }}
        />
        
        {/* آمار کاراکتر */}
        <div className={`absolute bottom-4 left-4 text-xs px-2 py-1 rounded bg-black/5 ${theme.textMuted}`}>
          {text.length.toLocaleString()} کاراکتر
        </div>
      </div>

      <div className={`text-sm text-center ${theme.textMuted}`}>
        <p>نکته: برای نمایش صحیح متن فارسی، اتصال اینترنت جهت دریافت فونت الزامی است.</p>
      </div>
    </div>
  );
}
