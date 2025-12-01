// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { Wand2, Heart } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function Header() {
  const theme = useThemeColors();

  return (
    <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-500 ${theme.border} ${theme.card}`}>
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* لوگو */}
        <div className="flex items-center gap-2 font-black text-xl tracking-tighter select-none">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md transition-colors duration-300 ${theme.primary}`}>
            <Wand2 size={18} className="text-white" />
          </div>
          <span className={theme.text}>
            Tools<span className={theme.accent}>Manager</span>
          </span>
        </div>
        
        {/* سمت چپ: سوییچر و دکمه حمایت */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />

          <a 
            href="#" 
            className={`text-sm font-medium transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg border 
            ${theme.border} hover:brightness-95 dark:hover:brightness-110`} 
          >
            <Heart size={16} className="text-red-500 fill-red-500 animate-pulse" />
            <span className={theme.textMuted}>حمایت</span>
          </a>
        </div>

      </div>
    </header>
  );
}
