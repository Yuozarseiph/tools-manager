// components/ThemeSwitcher.tsx
'use client';

import { useTheme, ThemeName } from '@/context/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Palette, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeSwitcher() {
  const { changeTheme, themeName } = useTheme();
  const theme = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // لیست تم‌های قابل انتخاب برای کاربر
  // نکته: تم 'secret-purple' اینجا نیست چون مخفیه!
  const themes: { id: ThemeName; color: string; label: string }[] = [
    // تم‌های روشن
    { id: 'royal-blue-light', color: '#2563eb', label: 'آبی (روشن)' },
    { id: 'ruby-red-light', color: '#dc2626', label: 'قرمز (روشن)' },
    { id: 'emerald-green-light', color: '#16a34a', label: 'سبز (روشن)' },
    { id: 'classic-light', color: '#e4e4e7', label: 'کلاسیک (روشن)' },
    
    // جداکننده (اختیاری، فقط برای نظم ذهنی)
    
    // تم‌های تاریک
    { id: 'royal-blue-dark', color: '#1e3a8a', label: 'آبی (تاریک)' },
    { id: 'ruby-red-dark', color: '#7f1d1d', label: 'قرمز (تاریک)' },
    { id: 'emerald-green-dark', color: '#064e3b', label: 'سبز (تاریک)' },
    { id: 'classic-dark', color: '#18181b', label: 'کلاسیک (تاریک)' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg transition-colors duration-200 flex items-center justify-center
          ${isOpen ? theme.secondary : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}
        `}
        title="تغییر ظاهر"
      >
        <Palette size={20} className={isOpen ? theme.accent : ''} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-2 left-0 border rounded-xl p-2 shadow-xl min-w-[200px] z-50 flex flex-col gap-1 max-h-[400px] overflow-y-auto
              ${theme.card} ${theme.border}
            `}
          >
            <span className={`text-xs font-bold px-2 py-1 mb-1 opacity-50 ${theme.text}`}>ظاهر روشن</span>
            {themes.slice(0, 4).map((t) => renderThemeButton(t))}
            
            <div className={`h-px my-1 ${theme.border}`} />
            
            <span className={`text-xs font-bold px-2 py-1 mb-1 opacity-50 ${theme.text}`}>ظاهر تاریک</span>
            {themes.slice(4).map((t) => renderThemeButton(t))}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // تابع کمکی برای رندر کردن دکمه‌ها (برای جلوگیری از تکرار کد)
  function renderThemeButton(t: { id: ThemeName; color: string; label: string }) {
    return (
      <button
        key={t.id}
        onClick={() => { changeTheme(t.id); setIsOpen(false); }}
        className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-colors
          ${themeName === t.id ? theme.secondary : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}
        `}
      >
        <span 
          className="w-4 h-4 rounded-full shadow-sm ring-1 ring-white/20 shrink-0"
          style={{ backgroundColor: t.color }}
        />
        <span className={theme.text}>{t.label}</span>
        
        {themeName === t.id && (
          <Check size={14} className={`mr-auto ${theme.accent}`} />
        )}
      </button>
    );
  }
}
