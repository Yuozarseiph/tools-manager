'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import DateConverterTool from '@/components/tools/DateConverterTool';

export default function DateConverterPage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-6 pt-10 w-full">
        <Link href="/" className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}>
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <CalendarDays size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>مبدل تاریخ</h1>
        </div>
        
        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          تبدیل دقیق تاریخ شمسی به میلادی و برعکس، با پشتیبانی از تقویم جلالی.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 w-full flex-1">
        <DateConverterTool />
      </div>
    </div>
  );
}
