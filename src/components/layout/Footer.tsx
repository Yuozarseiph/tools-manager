// components/layout/Footer.tsx
'use client';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function Footer() {
  const theme = useThemeColors();
  
  return (
    <footer className={`border-t py-10 text-center text-sm transition-colors duration-300 ${theme.border} ${theme.textMuted}`}>
      <p>© {new Date().getFullYear()} Tools Manager. <span className={theme.accent}>ساخته شده با ❤️</span></p>
    </footer>
  );
}
