// data/theme.content.ts

export const themeContent = {
  fa: {
    switchTitle: "تغییر حالت روشن / تاریک",
    light: "حالت روشن",
    dark: "حالت تاریک",
  } as const,

  en: {
    switchTitle: "Toggle light and dark theme",
    light: "Light mode",
    dark: "Dark mode",
  } as const,
};

export type ThemeContent = typeof themeContent.fa;
