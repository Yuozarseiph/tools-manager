// components/ThemeBody.tsx
'use client';
import { useThemeColors } from '@/hooks/useThemeColors';
import { MotionConfig } from 'framer-motion';

export default function ThemeBody({ children, className }: { children: React.ReactNode, className: string }) {
  const theme = useThemeColors();
  return (
    <body className={`${className} ${theme.bg} ${theme.text} transition-colors duration-300`}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </body>
  );
}
