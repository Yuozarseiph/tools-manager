// components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wand2, Heart, Book, Mail } from 'lucide-react';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function Header() {
  const theme = useThemeColors();
  const pathname = usePathname();

  // تابع کمکی برای استایل لینک‌های فعال
  const navLinkClass = (path: string) => 
    `text-sm font-bold transition-all hover:text-blue-500 ${
      pathname === path ? 'text-blue-600 dark:text-blue-400' : theme.textMuted
    }`;

  return (
    <header className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-500 ${theme.border} ${theme.card}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* بخش راست: لوگو و نویگیشن */}
        <div className="flex items-center gap-8">
          {/* لوگو */}
          <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter select-none">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform hover:scale-105 ${theme.primary}`}>
              <Wand2 size={20} className="text-white" />
            </div>
            <span className={theme.text}>
              Tools<span className={theme.accent}>Manager</span>
            </span>
          </Link>

          {/* لینک‌های نویگیشن (فقط در دسکتاپ) */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/docs" className={navLinkClass('/docs')}>
              <span className="flex items-center gap-1.5">
                <Book size={16} /> مستندات
              </span>
            </Link>
            <Link href="/contact" className={navLinkClass('/contact')}>
              <span className="flex items-center gap-1.5">
                <Mail size={16} /> تماس با ما
              </span>
            </Link>
          </nav>
        </div>
        
        {/* بخش چپ: ابزارها و دکمه حمایت */}
        <div className="flex items-center gap-3">
          
          {/* دکمه‌های موبایل (فقط آیکون) */}
          <div className="flex md:hidden items-center gap-1 ml-2">
             <Link href="/docs" className={`p-2 rounded-lg ${theme.textMuted} hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
                <Book size={20} />
             </Link>
             <Link href="/contact" className={`p-2 rounded-lg ${theme.textMuted} hover:bg-zinc-100 dark:hover:bg-zinc-800`}>
                <Mail size={20} />
             </Link>
          </div>

          <ThemeSwitcher />

          <a 
            href="https://reymit.ir/yuozarseiph" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`hidden sm:flex text-sm font-bold transition-all items-center gap-2 px-4 py-2 rounded-xl border 
            ${theme.border} hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/10 group`} 
          >
            <Heart size={18} className="text-red-500 fill-red-500 group-hover:animate-pulse" />
            <span className={theme.textMuted}>حمایت</span>
          </a>
        </div>

      </div>
    </header>
  );
}
