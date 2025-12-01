// app/tools/json-formatter/page.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Braces } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import JsonFormatterTool from '@/components/tools/JsonFormatterTool'; // الان میسازیمش

export default function JsonFormatterPage() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-6xl mx-auto px-6 pt-10 w-full">
        <Link 
          href="/" 
          className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <Braces size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>فرمت‌کننده JSON</h1>
        </div>
        
        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          کد JSON به‌هم‌ریخته خود را وارد کنید تا مرتب، رنگی و خوانا شود. همچنین می‌توانید آن را فشرده (Minify) کنید.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 w-full flex-1">
        <JsonFormatterTool />
      </div>
    </div>
  );
}
