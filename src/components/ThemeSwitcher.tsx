'use client';

import { useTheme, ThemeName } from '@/context/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Palette, Check, Moon, Sun } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThemeSwitcher() {
  const { changeTheme, themeName } = useTheme();
  const theme = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const themes: { id: ThemeName; icon: any; label: string }[] = [
    { id: 'royal-blue-light', icon: Sun, label: 'روشن' },
    { id: 'royal-blue-dark', icon: Moon, label: 'تاریک' },
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
            className={`absolute top-full mt-2 left-0 border rounded-xl p-1.5 shadow-xl min-w-[140px] z-50 flex flex-col gap-1
              ${theme.card} ${theme.border}
            `}
          >
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => { changeTheme(t.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-medium transition-colors
                  ${themeName === t.id ? theme.secondary : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                `}
              >
                <t.icon size={16} className={themeName === t.id ? theme.accent : theme.textMuted} />
                <span className={theme.text}>{t.label}</span>
                
                {themeName === t.id && (
                  <Check size={14} className={`mr-auto ${theme.accent}`} />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
