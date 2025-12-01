// constants/themes.ts

export type ThemeName = 
  | 'royal-blue-light' | 'royal-blue-dark'
  | 'ruby-red-light' | 'ruby-red-dark'
  | 'emerald-green-light' | 'emerald-green-dark'
  | 'classic-light' | 'classic-dark'
  | 'secret-purple'; // این یکی تک مونده (فقط دارک) چون خاصه

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
  // --- آبی (Royal Blue) ---
  'royal-blue-light': {
    name: 'آبی (روشن)',
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
    name: 'آبی (تاریک)',
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

  // --- قرمز (Ruby Red) ---
  'ruby-red-light': {
    name: 'قرمز (روشن)',
    bg: 'bg-orange-50',
    card: 'bg-white/80',
    text: 'text-zinc-900',
    textMuted: 'text-zinc-500',
    primary: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20',
    secondary: 'bg-red-50 text-red-700',
    accent: 'text-red-600',
    border: 'border-orange-200',
    ring: 'focus:ring-red-500',
    gradient: 'from-red-600 to-orange-500',
  },
  'ruby-red-dark': {
    name: 'قرمز (تاریک)',
    bg: 'bg-red-950',
    card: 'bg-red-900/20',
    text: 'text-red-50',
    textMuted: 'text-red-200/60',
    primary: 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20',
    secondary: 'bg-red-900/30 text-red-300',
    accent: 'text-red-400',
    border: 'border-red-900/50',
    ring: 'focus:ring-red-500',
    gradient: 'from-red-500 to-orange-400',
  },

  // --- سبز (Emerald Green) ---
  'emerald-green-light': {
    name: 'سبز (روشن)',
    bg: 'bg-stone-50',
    card: 'bg-white/80',
    text: 'text-stone-900',
    textMuted: 'text-stone-500',
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
    secondary: 'bg-emerald-50 text-emerald-800',
    accent: 'text-emerald-600',
    border: 'border-stone-200',
    ring: 'focus:ring-emerald-500',
    gradient: 'from-emerald-600 to-yellow-500',
  },
  'emerald-green-dark': {
    name: 'سبز (تاریک)',
    bg: 'bg-[#0c1a15]', // رنگ خاص سبز خیلی تیره
    card: 'bg-[#132e26]/90',
    text: 'text-emerald-50',
    textMuted: 'text-emerald-200/50',
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20',
    secondary: 'bg-emerald-900/30 text-emerald-300',
    accent: 'text-emerald-400',
    border: 'border-emerald-900/40',
    ring: 'focus:ring-emerald-500',
    gradient: 'from-emerald-500 to-yellow-400',
  },

  // --- کلاسیک (Classic Monochrome) ---
  'classic-light': {
    name: 'کلاسیک (روشن)',
    bg: 'bg-white',
    card: 'bg-zinc-50', // کمی متفاوت با پس‌زمینه سفید
    text: 'text-zinc-900',
    textMuted: 'text-zinc-500',
    primary: 'bg-zinc-900 hover:bg-zinc-700 text-white',
    secondary: 'bg-zinc-100 text-zinc-900',
    accent: 'text-zinc-900',
    border: 'border-zinc-200',
    ring: 'focus:ring-zinc-500',
    gradient: 'from-zinc-900 to-zinc-600',
  },
  'classic-dark': {
    name: 'کلاسیک (تاریک)',
    bg: 'bg-zinc-950',
    card: 'bg-zinc-900/80',
    text: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    primary: 'bg-white text-black hover:bg-zinc-200',
    secondary: 'bg-zinc-800 text-zinc-200',
    accent: 'text-white',
    border: 'border-zinc-800',
    ring: 'focus:ring-zinc-500',
    gradient: 'from-white to-zinc-400',
  },

  // --- مخفی ---
  'secret-purple': {
    name: 'بنفش (تاریک)',
    bg: 'bg-black',
    card: 'bg-zinc-900/80',
    text: 'text-purple-50',
    textMuted: 'text-purple-300/50',
    primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/40',
    secondary: 'bg-purple-900/30 text-purple-300',
    accent: 'text-purple-400',
    border: 'border-purple-900/50',
    ring: 'focus:ring-purple-500',
    gradient: 'from-purple-600 via-fuchsia-500 to-pink-500',
  }
};
