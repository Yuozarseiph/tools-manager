// constants/themes.ts
export type ThemeName = "royal-blue-light" | "royal-blue-dark";

export interface ThemePalette {
  name: string;
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  ring: string;
  gradient: string;
  note: {
    infoBg: string;
    infoBorder: string;
    infoText: string;
    warningBg: string;
    warningBorder: string;
    warningText: string;
    errorBg: string;
    errorBorder: string;
    errorText: string;
  };
  scrollbar: {
    thumb: string;
    thumbHover: string;
    track: string;
  };
  divider: {
    via: string;
  };
}

// تمام کلاس‌ها از متغیرهای CSS استفاده می‌کنند.
// با تغییر کلاس dark روی<html> متغیرها عوض می‌شوند،
// در نتیجه خودِ کلاس‌های Tailwind هم رنگ عوض می‌کنند.
export const THEMES: Record<ThemeName, ThemePalette> = {
  "royal-blue-light": {
    name: "روشن",
    bg: "bg-[var(--app-bg)]",
    card: "bg-[var(--app-card)]",
    text: "text-[var(--app-text)]",
    textMuted: "text-[var(--app-text-muted)]",
    primary:
      "bg-[var(--app-primary-bg)] hover:bg-[var(--app-primary-hover)] text-white shadow-[0_0_15px_var(--app-accent)]",
    secondary: "bg-[var(--app-secondary-bg)] text-[var(--app-secondary-text)]",
    accent: "text-[var(--app-accent)]",
    border: "border-[var(--app-border)]",
    ring: "focus:ring-[var(--app-ring)]",
    gradient: "from-[var(--app-gradient-from)] to-[var(--app-gradient-to)]",
    note: {
      infoBg: "bg-blue-50 dark:bg-blue-500/10",
      infoBorder: "border-blue-200 dark:border-blue-500/40",
      infoText: "text-blue-800 dark:text-blue-100",
      warningBg: "bg-amber-50 dark:bg-amber-500/10",
      warningBorder: "border-amber-300 dark:border-amber-500/40",
      warningText: "text-amber-800 dark:text-amber-100",
      errorBg: "bg-red-50 dark:bg-red-500/10",
      errorBorder: "border-red-300 dark:border-red-500/40",
      errorText: "text-red-700 dark:text-red-100",
    },
    scrollbar: {
      thumb: "rgba(100,116,139,0.3)",
      thumbHover: "rgba(59,130,246,0.5)",
      track: "transparent",
    },
    divider: {
      via: "via-slate-300",
    },
  },
  "royal-blue-dark": {
    name: "تاریک",
    // توجه: اینجا هم همان کلاس‌های light نوشته می‌شوند!
    // چون رنگ نهایی را متغیرهای CSS تعیین می‌کنند.
    bg: "bg-[var(--app-bg)]",
    card: "bg-[var(--app-card)]",
    text: "text-[var(--app-text)]",
    textMuted: "text-[var(--app-text-muted)]",
    primary:
      "bg-[var(--app-primary-bg)] hover:bg-[var(--app-primary-hover)] text-white shadow-[0_0_15px_var(--app-accent)]",
    secondary: "bg-[var(--app-secondary-bg)] text-[var(--app-secondary-text)]",
    accent: "text-[var(--app-accent)]",
    border: "border-[var(--app-border)]",
    ring: "focus:ring-[var(--app-ring)]",
    gradient: "from-[var(--app-gradient-from)] to-[var(--app-gradient-to)]",
    note: {
      infoBg: "bg-blue-50 dark:bg-blue-500/10",
      infoBorder: "border-blue-200 dark:border-blue-500/40",
      infoText: "text-blue-800 dark:text-blue-100",
      warningBg: "bg-amber-50 dark:bg-amber-500/10",
      warningBorder: "border-amber-300 dark:border-amber-500/40",
      warningText: "text-amber-800 dark:text-amber-100",
      errorBg: "bg-red-50 dark:bg-red-500/10",
      errorBorder: "border-red-300 dark:border-red-500/40",
      errorText: "text-red-700 dark:text-red-100",
    },
    scrollbar: {
      thumb: "rgba(148,163,184,0.3)",
      thumbHover: "rgba(96,165,250,0.5)",
      track: "transparent",
    },
    divider: {
      via: "via-slate-700",
    },
  },
};
