// hooks/useThemeColors.ts
'use client';

import { useTheme } from '@/context/ThemeContext';
import { THEMES, ThemePalette } from '@/constants/themes';

export function useThemeColors(): ThemePalette {
  const { themeName, mode } = useTheme(); 
  
  return THEMES[themeName] || THEMES['royal-blue-light'];
}
