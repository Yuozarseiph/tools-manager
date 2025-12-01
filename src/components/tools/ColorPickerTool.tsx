// components/tools/ColorPickerTool.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { FileUp, Pipette, Copy, Check, Palette } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
const ColorThief = require('colorthief').default;

export default function ColorPickerTool() {
  const theme = useThemeColors();
  const [image, setImage] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<string>('#ffffff');
  const [pickedColors, setPickedColors] = useState<string[]>([]);
  const [palette, setPalette] = useState<string[]>([]); // پالت اتوماتیک
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (files) => {
      if (files?.[0]) {
        const url = URL.createObjectURL(files[0]);
        setImage(url);
        setPickedColors([]);
        setPalette([]); // ریست پالت
      }
    },
  });

  // تبدیل RGB آرایه به Hex
  const rgbToHex = (r: number, g: number, b: number) => 
    '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');

  // رسم تصویر + استخراج پالت اتوماتیک
  useEffect(() => {
    if (!image || !canvasRef.current || !imageRef.current) return;
    
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    img.onload = () => {
      // 1. آماده‌سازی برای قطره‌چکان دستی
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      // 2. استخراج پالت اتوماتیک با ColorThief
      try {
        const colorThief = new ColorThief();
        const paletteRGB = colorThief.getPalette(img, 6); // 6 رنگ اصلی
        const paletteHex = paletteRGB.map((rgb: number[]) => rgbToHex(rgb[0], rgb[1], rgb[2]));
        setPalette(paletteHex);
      } catch (e) {
        console.error('Error extracting palette', e);
      }
    };
  }, [image]);

  const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = e.currentTarget.getBoundingClientRect();
    
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const pixel = ctx?.getImageData(x, y, 1, 1).data;
    if (pixel) {
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      setHoverColor(hex);
    }
  };

  const handleClick = () => {
    if (!pickedColors.includes(hoverColor)) {
      setPickedColors(prev => [hoverColor, ...prev].slice(0, 10));
    }
  };

  const copyToClipboard = (color: string, idx: number) => {
    navigator.clipboard.writeText(color);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
      
      {/* بخش تصویر */}
      <div className={`lg:col-span-2 rounded-3xl border overflow-hidden relative min-h-[400px] flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 ${theme.border}`}>
        {!image ? (
          <div {...getRootProps()} className="text-center cursor-pointer p-10">
            <input {...getInputProps()} />
            <div className={`p-4 rounded-full inline-flex mb-4 ${theme.secondary}`}>
              <FileUp size={32} className={theme.accent} />
            </div>
            <p className={`font-bold ${theme.text}`}>تصویر را اینجا رها کنید</p>
          </div>
        ) : (
          <div className="relative group cursor-crosshair">
            <img 
              ref={imageRef}
              src={image} 
              alt="Target" 
              className="max-w-full max-h-[600px] object-contain"
              onMouseMove={handleMouseMove}
              onClick={handleClick}
              crossOrigin="anonymous" // مهم برای ColorThief
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div 
              className="fixed pointer-events-none z-50 w-24 h-24 rounded-full border-4 border-white shadow-xl hidden group-hover:flex items-center justify-center"
              style={{ backgroundColor: hoverColor, left: 20, bottom: 20 }}
            >
              <span className="bg-black/50 text-white text-xs px-1 rounded">{hoverColor}</span>
            </div>
          </div>
        )}
        
        {image && (
          <button 
            onClick={() => { setImage(null); setPickedColors([]); setPalette([]); }}
            className="absolute top-4 right-4 p-2 bg-white/90 text-red-500 rounded-lg shadow-md hover:bg-red-50"
          >
            حذف تصویر
          </button>
        )}
      </div>

      {/* سایدبار */}
      <div className="space-y-6">
        
        {/* رنگ فعلی */}
        <div className={`p-6 rounded-3xl border text-center ${theme.card} ${theme.border}`}>
          <div className="w-full h-24 rounded-2xl mb-4 shadow-inner border" style={{ backgroundColor: hoverColor }} />
          <p className={`text-sm font-bold mb-1 ${theme.textMuted}`}>رنگ انتخاب شده</p>
          <p className={`text-3xl font-black uppercase font-mono ${theme.text}`}>{hoverColor}</p>
          <p className={`text-xs mt-2 ${theme.textMuted}`}>برای ذخیره کلیک کنید</p>
        </div>

        {/* پالت اتوماتیک (جدید) */}
        {palette.length > 0 && (
          <div className={`p-6 rounded-3xl border ${theme.card} ${theme.border}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
              <Palette size={18} /> پالت پیشنهادی تصویر
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {palette.map((color, idx) => (
                <button
                  key={idx}
                  onClick={() => copyToClipboard(color, idx + 100)} // اندیس متفاوت برای تداخل نکردن
                  className="relative group h-12 rounded-xl border shadow-sm transition-transform active:scale-95"
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 text-white rounded-xl transition-opacity">
                    {copiedIndex === idx + 100 ? <Check size={16} /> : <Copy size={16} />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* رنگ‌های دستی */}
        {pickedColors.length > 0 && (
          <div className={`p-6 rounded-3xl border ${theme.card} ${theme.border}`}>
            <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
              <Pipette size={18} /> تاریخچه کلیک‌ها
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {pickedColors.map((color, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2 rounded-xl border ${theme.bg} ${theme.border}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg shadow-sm border" style={{ backgroundColor: color }} />
                    <span className={`font-mono font-bold ${theme.text}`}>{color}</span>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(color, idx)}
                    className={`p-2 rounded-lg transition-colors ${copiedIndex === idx ? 'bg-green-100 text-green-600' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400'}`}
                  >
                    {copiedIndex === idx ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
