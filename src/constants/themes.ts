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
      infoBg: "bg-[var(--app-secondary-bg)]",
      infoBorder: "border-[var(--app-border)]",
      infoText: "text-[var(--app-accent)]",
      warningBg: "bg-[var(--app-warning-bg)]",
      warningBorder: "border-[var(--app-warning-border)]",
      warningText: "text-[var(--app-warning-text)]",
      errorBg: "bg-[var(--app-error-bg)]",
      errorBorder: "border-[var(--app-error-border)]",
      errorText: "text-[var(--app-error-text)]",
    },
    scrollbar: {
      thumb: "rgba(0,50,96,0.3)",
      thumbHover: "rgba(0,50,96,0.5)",
      track: "transparent",
    },
    divider: {
      via: "via-[var(--app-border)]",
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
      infoBg: "bg-[var(--app-secondary-bg)]",
      infoBorder: "border-[var(--app-border)]",
      infoText: "text-[var(--app-accent)]",
      warningBg: "bg-[var(--app-warning-bg)]",
      warningBorder: "border-[var(--app-warning-border)]",
      warningText: "text-[var(--app-warning-text)]",
      errorBg: "bg-[var(--app-error-bg)]",
      errorBorder: "border-[var(--app-error-border)]",
      errorText: "text-[var(--app-error-text)]",
    },
    scrollbar: {
      thumb: "rgba(201,193,176,0.3)",
      thumbHover: "rgba(127,167,201,0.5)",
      track: "transparent",
    },
    divider: {
      via: "via-[var(--app-border)]",
    },
  },
};
