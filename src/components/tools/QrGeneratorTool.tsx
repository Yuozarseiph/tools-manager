// components/tools/QrGeneratorTool.tsx
'use client';

import { useState, useRef } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, Link as LinkIcon, Type } from 'lucide-react';

export default function QrGeneratorTool() {
  const theme = useThemeColors();
  const [text, setText] = useState('https://toolsmanager.com');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQr = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.png`;
      a.click();
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      
      {/* تنظیمات */}
      <div className={`space-y-6 p-6 rounded-3xl border ${theme.card} ${theme.border}`}>
        <div className="space-y-2">
          <label className="font-bold flex items-center gap-2">
            <LinkIcon size={18} /> متن یا لینک
          </label>
          <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={`w-full p-4 rounded-xl border h-32 resize-none focus:outline-none focus:ring-2 ring-blue-500/50 ${theme.bg} ${theme.border}`}
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">رنگ کد</label>
            <div className={`flex items-center gap-2 p-2 rounded-xl border ${theme.bg} ${theme.border}`}>
              <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <span className="text-xs font-mono">{fgColor}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold">رنگ پس‌زمینه</label>
            <div className={`flex items-center gap-2 p-2 rounded-xl border ${theme.bg} ${theme.border}`}>
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
              <span className="text-xs font-mono">{bgColor}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="font-bold">اندازه تصویر</label>
            <span>{size}px</span>
          </div>
          <input 
            type="range" min="128" max="1024" step="32" value={size} 
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg accent-blue-600"
          />
        </div>
      </div>

      {/* پیش‌نمایش */}
      <div className={`flex flex-col items-center justify-center p-8 rounded-3xl border ${theme.bg} ${theme.border}`}>
        <div ref={qrRef} className="p-4 bg-white rounded-xl shadow-2xl mb-8">
          <QRCodeCanvas 
            value={text} 
            size={size} // سایز نمایشی رو محدود میکنیم ولی سایز اصلی حفظ میشه
            style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
            fgColor={fgColor}
            bgColor={bgColor}
            level="H" // بالاترین سطح تصحیح خطا
            includeMargin={true}
          />
        </div>

        <button 
          onClick={downloadQr}
          className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform ${theme.primary}`}
        >
          <Download size={20} /> دانلود تصویر PNG
        </button>
      </div>

    </div>
  );
}
