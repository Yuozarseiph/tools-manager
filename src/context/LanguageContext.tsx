// context/LanguageContext.tsx
"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import {
  LOCALE_STORAGE_KEY,
  type Locale,
} from "@/lib/locale-detection";
import { localizedPath } from "@/lib/localized-path";

export type { Locale } from "@/lib/locale-detection";

// متن‌های عمومی و مشترک (مثل منو، فوتر و دکمه‌های عمومی)
const commonTranslations = {
  fa: {
    common: {
      appName: "QodeForge",
      loading: "در حال بارگذاری...",
      error: "خطایی رخ داد",
    },
    nav: {
      home: "خانه",
      tools: "ابزارها",
      docs: "مستندات",
      contact: "تماس",
    },
    footer: {
      copyright: "تمامی حقوق محفوظ است.",
    },
  },
  en: {
    common: {
      appName: "QodeForge",
      loading: "Loading...",
      error: "An error occurred",
    },
    nav: {
      home: "Home",
      tools: "Tools",
      docs: "Docs",
      contact: "Contact",
    },
    footer: {
      copyright: "All rights reserved.",
    },
  },
};

type Messages = typeof commonTranslations.fa;

type LanguageContextType = {
  locale: Locale;
  messages: Messages; // فقط پیام‌های عمومی اینجا هستن
  setLocale: (next: Locale) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const FALLBACK_LOCALE: Locale = "fa";

function getByPath(obj: unknown, path: string): string {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (typeof acc !== "object" || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
  return typeof value === "string" ? value : path;
}

export function LanguageProvider({ children, initialLocale = FALLBACK_LOCALE }: { children: ReactNode; initialLocale?: Locale }) {
  const locale = initialLocale;
  const messages: Messages = commonTranslations[locale];
  const applyLocale = (next: Locale) => {

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCALE_STORAGE_KEY, next);
        // Keep the previous key so existing visitors retain their choice.
        localStorage.setItem("tm_locale", next);
      } catch {
        // Language switching still works when storage is unavailable.
      }
      const url = new URL(window.location.href);
      url.pathname = localizedPath(url.pathname, next);
      url.searchParams.delete("lang");
      window.location.assign(url);
    }
  };

  const t = (path: string) => getByPath(messages, path);

  return (
    <LanguageContext.Provider
      value={{ locale, messages, setLocale: applyLocale, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

