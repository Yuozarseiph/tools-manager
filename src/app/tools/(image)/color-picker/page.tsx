'use client';

import Link from 'next/link';
import { ArrowRight, Pipette } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import ColorPickerTool from '@/components/tools/ColorPickerTool';

export default function ColorPickerPage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-6xl mx-auto px-6 pt-10 w-full">
        <Link href="/" className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}>
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <Pipette size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>استخراج رنگ از تصویر</h1>
        </div>
        
        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          تصویر خود را آپلود کنید و با کلیک روی هر نقطه، کد رنگ دقیق آن را دریافت کنید.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 w-full flex-1">
        <ColorPickerTool />
      </div>
    </div>
  );
}
