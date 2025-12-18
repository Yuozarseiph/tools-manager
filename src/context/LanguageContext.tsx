// context/LanguageContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// متن‌های عمومی و مشترک (مثل منو، فوتر و دکمه‌های عمومی)
const commonTranslations = {
  fa: {
    common: {
      appName: "Tools Manager",
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
      appName: "Tools Manager",
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

export type Locale = "fa" | "en";
type Messages = typeof commonTranslations.fa;

type LanguageContextType = {
  locale: Locale;
  messages: Messages; // فقط پیام‌های عمومی اینجا هستن
  setLocale: (next: Locale) => void;
  t: (path: string) => string;
};

const LanguageContext = createContext<LanguageContextType | null>(null);

const FALLBACK_LOCALE: Locale = "fa";

function getByPath(obj: any, path: string): string {
  return path.split(".").reduce((acc, key) => acc?.[key], obj) ?? path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(FALLBACK_LOCALE);
  const [messages, setMessages] = useState<Messages>(
    commonTranslations[FALLBACK_LOCALE]
  );

  const applyLocale = (next: Locale) => {
    setLocaleState(next);
    setMessages(commonTranslations[next]);

    if (typeof window !== "undefined") {
      localStorage.setItem("tm_locale", next);
      document.documentElement.lang = next;
      document.documentElement.dir = next === "fa" ? "rtl" : "ltr";
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("tm_locale") as Locale | null;
    const initialLocale =
      saved && ["fa", "en"].includes(saved) ? saved : FALLBACK_LOCALE;
    applyLocale(initialLocale);
  }, []);

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
