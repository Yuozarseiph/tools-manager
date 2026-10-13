"use client";
import { useEffect, useState } from "react";
import { useLanguage, type Locale } from "@/context/LanguageContext";
import { detectInitialLocale } from "@/lib/locale-detection";
export default function LanguageSuggestion() {
  const { locale, setLocale } = useLanguage();
  const [suggested, setSuggested] = useState<Locale | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { if (sessionStorage.getItem("qodeforge_language_suggestion_dismissed")) return; } catch { /* optional persistence */ }
      const detected = detectInitialLocale();
      if (detected !== locale) setSuggested(detected);
    });
    return () => cancelAnimationFrame(frame);
  }, [locale]);
  if (!suggested) return null;
  return <aside className="fixed bottom-24 start-4 z-[80] flex max-w-sm items-center justify-between gap-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-2 text-sm text-[var(--app-text)] shadow-lg" aria-label={locale === "fa" ? "پیشنهاد زبان" : "Language suggestion"}>
    <button type="button" className="underline" onClick={() => setLocale(suggested)} lang={suggested}>
      {suggested === "en" ? "Prefer English? View this page in English" : "نسخه فارسی این صفحه را ببینید"}
    </button>
    <button type="button" aria-label={locale === "fa" ? "بستن پیشنهاد زبان" : "Dismiss language suggestion"} onClick={() => {
      setSuggested(null); try { sessionStorage.setItem("qodeforge_language_suggestion_dismissed", "1"); } catch { /* optional persistence */ }
    }}>×</button>
  </aside>;
}
