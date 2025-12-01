// app/tools/base64/page.tsx
'use client';

import Link from 'next/link';
import { ArrowRight, Binary } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';
import Base64Tool from '@/components/tools/Base64Tool';

export default function Base64Page() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-6 pt-10 w-full">
        <Link href="/" className={`inline-flex items-center text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}>
          <ArrowRight size={16} className="ml-1" /> بازگشت به خانه
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-xl ${theme.primary}`}>
            <Binary size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${theme.text}`}>مبدل Base64</h1>
        </div>
        
        <p className={`max-w-2xl leading-relaxed mb-8 ${theme.textMuted}`}>
          تبدیل متن به کد Base64 و برعکس. با پشتیبانی کامل از حروف فارسی و کاراکترهای خاص (UTF-8 Safe).
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-20 w-full flex-1">
        <Base64Tool />
      </div>
    </div>
  );
}
