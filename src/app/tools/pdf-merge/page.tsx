// app/tools/pdf-merge/page.tsx
'use client';

import { FileStack, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useThemeColors } from '@/hooks/useThemeColors';
import PdfMerger from '@/components/tools/PdfMerger';

export default function PdfMergePage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
            <div className="max-w-5xl mx-auto px-6 pt-10 w-full">
        <Link 
          href="/" 
          className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <FileStack size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>ادغام فایل‌های PDF</h1>
        </div>
        
        <p className={`max-w-2xl leading-relaxed ${theme.textMuted}`}>
          فایل‌های PDF خود را به ترتیب دلخواه مرتب کنید و به یک فایل واحد تبدیل کنید. 
          <span className="block mt-1 text-xs opacity-70">⚡ پردازش ۱۰۰٪ در مرورگر شما (بدون آپلود)</span>
        </p>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-10 w-full flex-1">
        <PdfMerger />
      </div>

    </div>
  );
}
