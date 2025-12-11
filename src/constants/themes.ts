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

export const THEMES: Record<ThemeName, ThemePalette> = {
  "royal-blue-light": {
    name: "روشن",
    bg: "bg-slate-50",
    card: "bg-white/80",
    text: "text-slate-900",
    textMuted: "text-slate-500",
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20",
    secondary: "bg-blue-50 text-blue-700",
    accent: "text-blue-600",
    border: "border-slate-200",
    ring: "focus:ring-blue-500",
    gradient: "from-blue-600 to-cyan-500",
    note: {
      infoBg: "bg-blue-50",
      infoBorder: "border-blue-200",
      infoText: "text-blue-800",
      warningBg: "bg-amber-50",
      warningBorder: "border-amber-300",
      warningText: "text-amber-800",
      errorBg: "bg-red-50",
      errorBorder: "border-red-300",
      errorText: "text-red-700",
    },
    scrollbar: {
      thumb: "rgba(100, 116, 139, 0.3)",
      thumbHover: "rgba(59, 130, 246, 0.5)",
      track: "transparent",
    },
    divider: {
      via: "via-slate-300",
    },
  },
  "royal-blue-dark": {
    name: "تاریک",
    bg: "bg-slate-950",
    card: "bg-slate-900/80",
    text: "text-slate-50",
    textMuted: "text-slate-400",
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20",
    secondary: "bg-blue-900/20 text-blue-300",
    accent: "text-blue-400",
    border: "border-slate-800",
    ring: "focus:ring-blue-500",
    gradient: "from-blue-400 to-cyan-300",
    note: {
      infoBg: "bg-blue-500/10",
      infoBorder: "border-blue-500/40",
      infoText: "text-blue-100",
      warningBg: "bg-amber-500/10",
      warningBorder: "border-amber-500/40",
      warningText: "text-amber-100",
      errorBg: "bg-red-500/10",
      errorBorder: "border-red-500/40",
      errorText: "text-red-100",
    },
    scrollbar: {
      thumb: "rgba(148, 163, 184, 0.3)",
      thumbHover: "rgba(96, 165, 250, 0.5)",
      track: "transparent",
    },
    divider: {
      via: "via-slate-700",
    },
  },
};
