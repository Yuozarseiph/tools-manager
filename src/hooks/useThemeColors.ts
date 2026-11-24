// hooks/useThemeColors.ts
"use client";
import { useTheme } from "@/providers/ThemeContext";
import { THEMES, ThemePalette, ThemeName } from "@/config/themes";

export function useThemeColors(): ThemePalette {
  const { themeName } = useTheme();
  // دیگر نیازی به mode نیست، چون رنگ‌ها از متغیرهای CSS می‌آیند
  return THEMES[themeName as ThemeName] || THEMES["royal-blue-light"];
}
