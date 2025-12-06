// context/LanguageContext.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import fa from '@/locales/fa.json';
import en from '@/locales/en.json';

export type Locale = 'fa' | 'en';
type Messages = typeof fa;

type LanguageContextType = {
  locale: Locale;
  messages: Messages;
  setLocale: (next: Locale) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const FALLBACK_LOCALE: Locale = 'fa';

const messagesByLocale: Record<Locale, Messages> = { fa, en };

function getByPath(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(FALLBACK_LOCALE);
  const [messages, setMessages] = useState<Messages>(fa);

  const applyLocale = (next: Locale) => {
    setLocaleState(next);
    setMessages(messagesByLocale[next]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tm_locale', next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === 'fa' ? 'rtl' : 'ltr';
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('tm_locale') as Locale | null;
    applyLocale(saved ?? FALLBACK_LOCALE);
  }, []);

  const t = (path: string) => getByPath(messages, path);

  return (
    <LanguageContext.Provider value={{ locale, messages, setLocale: applyLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
