// context/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. آپدیت لیست نام تم‌ها مطابق با themes.ts
export type ThemeName = 
  | 'royal-blue-light' | 'royal-blue-dark'
  | 'ruby-red-light' | 'ruby-red-dark'
  | 'emerald-green-light' | 'emerald-green-dark'
  | 'classic-light' | 'classic-dark'
  | 'secret-purple';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  themeName: ThemeName;
  changeTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');
  // 2. مقدار پیش‌فرض صحیح
  const [themeName, setThemeName] = useState<ThemeName>('royal-blue-light');

  // 3. نگاشت صحیح تم‌ها به حالت روشن/تاریک
  const themeModes: Record<ThemeName, ThemeMode> = {
    'royal-blue-light': 'light',
    'ruby-red-light': 'light',
    'emerald-green-light': 'light',
    'classic-light': 'light',
    
    'royal-blue-dark': 'dark',
    'ruby-red-dark': 'dark',
    'emerald-green-dark': 'dark',
    'classic-dark': 'dark',
    'secret-purple': 'dark',
  };

  // بارگذاری اولیه
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as ThemeName;
    // چک می‌کنیم که تم ذخیره شده معتبر باشه
    if (savedTheme && themeModes[savedTheme]) {
      changeTheme(savedTheme);
    }
  }, []);

  const changeTheme = (name: ThemeName) => {
    setThemeName(name);
    
    const newMode = themeModes[name];
    setMode(newMode);
    
    localStorage.setItem('app-theme', name);
    
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newMode);
    root.style.colorScheme = newMode;
  };

  // کد مخفی (Cheat Codes) - آپدیت شده با نام‌های جدید
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (e.altKey && e.shiftKey) {
        if (e.key.toLowerCase() === 'p') changeTheme('secret-purple');
        // برای کدهای مخفی، مثلاً نسخه دارک رو فعال می‌کنیم
        if (e.key.toLowerCase() === 'g') changeTheme('emerald-green-dark'); 
        if (e.key.toLowerCase() === 'r') changeTheme('royal-blue-light');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, themeName, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
