// constants/themes.ts

export type ThemeName = 
  | 'royal-blue-light' 
  | 'royal-blue-dark';

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
}

export const THEMES: Record<ThemeName, ThemePalette> = {
  'royal-blue-light': {
    name: 'روشن',
    bg: 'bg-slate-50',
    card: 'bg-white/80',
    text: 'text-slate-900',
    textMuted: 'text-slate-500',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
    secondary: 'bg-blue-50 text-blue-700',
    accent: 'text-blue-600',
    border: 'border-slate-200',
    ring: 'focus:ring-blue-500',
    gradient: 'from-blue-600 to-cyan-500',
  },
  'royal-blue-dark': {
    name: 'تاریک',
    bg: 'bg-slate-950',
    card: 'bg-slate-900/80',
    text: 'text-slate-50',
    textMuted: 'text-slate-400',
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20',
    secondary: 'bg-blue-900/20 text-blue-300',
    accent: 'text-blue-400',
    border: 'border-slate-800',
    ring: 'focus:ring-blue-500',
    gradient: 'from-blue-400 to-cyan-300',
  },
};
