'use client';

import { useState, useRef } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Download, Eraser, AlignRight, AlignLeft, AlignCenter, Type } from 'lucide-react';
import jsPDF from 'jspdf';

export default function TextToPdfTool() {
  const theme = useThemeColors();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [fontSize, setFontSize] = useState(16);
  const [align, setAlign] = useState<'right' | 'left' | 'center'>('right');
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
  
  // این بار فقط برای پیش‌نمایش استفاده میشه
  const previewRef = useRef<HTMLDivElement>(null);

  // تابع رسم متن روی کانواس (هوشمند)
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const lines = text.split('\n');
    let currentY = y;

    lines.forEach(line => {
      const words = line.split(' ');
      let currentLine = '';

      words.forEach((word, n) => {
        const testLine = currentLine + word + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(currentLine, x, currentY);
          currentLine = word + ' ';
          currentY += lineHeight;
        } else {
          currentLine = testLine;
        }
      });
      ctx.fillText(currentLine, x, currentY);
      currentY += lineHeight;
    });
  };

  const handleDownload = async () => {
    if (!text.trim()) return;
    setLoading(true);

    try {
      // 1. ساخت کانواس در حافظه
      const canvas = document.createElement('canvas');
      const width = 794; // A4 width in pixels at 96 DPI
      const height = 1123; // A4 height
      const scale = 2; // High Quality
      
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas Context Error');

      // 2. تنظیمات پس‌زمینه و متن
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#000000';
      ctx.font = `${fontSize}px Arial, Tahoma, sans-serif`; // فونت پیش‌فرض سیستم (برای فارسی خوبه)
      ctx.textBaseline = 'top';
      
      // 3. تنظیم جهت و تراز
      const padding = 40;
      const maxWidth = width - (padding * 2);
      let startX = padding;

      if (align === 'center') {
        ctx.textAlign = 'center';
        startX = width / 2;
      } else if (align === 'right') {
        ctx.textAlign = 'right';
        startX = width - padding;
      } else {
        ctx.textAlign = 'left';
        startX = padding;
      }
      
      // اگر RTL باشه، جهت نوشتن رو باید مدیریت کرد (کانواس native از RTL ساپورت محدودی داره)
      // ولی فعلاً ساده رسم می‌کنیم
      wrapText(ctx, text, startX, padding, maxWidth, fontSize * 1.8);

      // 4. تولید PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.9); // JPEG سبک‌تره
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('document.pdf');

    } catch (err) {
      console.error(err);
      alert('خطا در ساخت PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... (کد JSX دقیقاً مثل قبل، هیچ تغییری لازم نیست)
    <div className="grid lg:grid-cols-2 gap-8">
      {/* ... همان کدهای JSX قبلی ... */}
      {/* برای اینکه طولانی نشه، فقط بخش‌هایی که عوض نشده رو کپی نکردم */}
      {/* اما شما کد JSX قبلی رو کامل بذار اینجا */}
       <div className="space-y-4">
        
        <div className={`p-4 rounded-2xl border flex flex-wrap items-center gap-4 ${theme.card} ${theme.border}`}>
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button onClick={() => setDirection('rtl')} className={`p-2 rounded-md transition-colors ${direction === 'rtl' ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700' : 'text-zinc-400'}`} title="راست‌چین">
              <AlignRight size={18} />
            </button>
            <button onClick={() => setDirection('ltr')} className={`p-2 rounded-md transition-colors ${direction === 'ltr' ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700' : 'text-zinc-400'}`} title="چپ‌چین">
              <AlignLeft size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
            <button onClick={() => setAlign('right')} className={`p-2 rounded-md transition-colors ${align === 'right' ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700' : 'text-zinc-400'}`}>
              <AlignRight size={18} />
            </button>
            <button onClick={() => setAlign('center')} className={`p-2 rounded-md transition-colors ${align === 'center' ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700' : 'text-zinc-400'}`}>
              <AlignCenter size={18} />
            </button>
            <button onClick={() => setAlign('left')} className={`p-2 rounded-md transition-colors ${align === 'left' ? 'bg-white text-blue-600 shadow-sm dark:bg-zinc-700' : 'text-zinc-400'}`}>
              <AlignLeft size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">
            <Type size={18} className="text-zinc-400" />
            <input 
              type="number" 
              value={fontSize} 
              onChange={(e) => setFontSize(Number(e.target.value))} 
              className="w-12 bg-transparent text-center font-bold outline-none"
              min={8} max={72}
            />
            <span className="text-xs text-zinc-400">px</span>
          </div>

          <div className="flex-1"></div>

          <button onClick={() => setText('')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="پاک کردن متن">
            <Eraser size={20} />
          </button>
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm ${theme.card} ${theme.border} h-[500px] flex flex-col`}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن خود را اینجا بنویسید..."
            style={{ direction, textAlign: align, fontSize: `${fontSize}px` }}
            className={`flex-1 w-full resize-none outline-none bg-transparent leading-relaxed ${theme.text}`}
          />
        </div>
        
        <button
          onClick={handleDownload}
          disabled={loading || !text.trim()}
          className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all
          ${!text.trim() ? 'opacity-50 cursor-not-allowed bg-zinc-300 text-zinc-500' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'}`}
        >
          {loading ? (
            <>لطفا صبر کنید...</>
          ) : (
            <><Download size={20} /> دانلود فایل PDF</>
          )}
        </button>
      </div>

      <div className={`relative rounded-3xl border overflow-hidden bg-zinc-200 dark:bg-zinc-900 flex items-center justify-center p-4 md:p-8 ${theme.border}`}>
        <div className="absolute top-4 right-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
          پیش‌نمایش چاپ (A4)
        </div>
        
        <div className="scale-[0.5] sm:scale-[0.6] md:scale-[0.7] origin-top shadow-2xl transition-transform duration-300">
          <div 
            ref={previewRef}
            className="w-[210mm] min-h-[297mm] p-[20mm] shadow-xl"
            style={{ 
              backgroundColor: '#ffffff',
              color: '#000000',
              direction: direction,
              textAlign: align,
              fontSize: `${fontSize}px`,
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              fontFamily: 'inherit'
            }}
          >
            {text || <span className="text-gray-300 text-4xl font-bold opacity-30 block text-center mt-20">پیش‌نمایش خالی است</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
