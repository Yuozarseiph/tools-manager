'use client';

import { useTheme } from '@/context/ThemeContext';
import { THEMES, ThemePalette, ThemeName } from '@/constants/themes';

export function useThemeColors(): ThemePalette {
  const { themeName } = useTheme();

  const theme = THEMES[themeName as ThemeName];

  return theme || THEMES['royal-blue-light'];
}
