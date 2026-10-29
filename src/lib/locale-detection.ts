export type Locale = "fa" | "en";

export const LOCALE_STORAGE_KEY = "qodeforge_locale";

const isLocale = (value: string | null): value is Locale =>
  value === "fa" || value === "en";

export function getSavedLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    for (const key of [LOCALE_STORAGE_KEY, "tm_locale"]) {
      const value = window.localStorage.getItem(key);
      if (isLocale(value)) return value;
    }
  } catch { /* An explicit route remains usable without browser storage. */ }
  return null;
}

/**
 * Pick a language for a first visit without sending identifying data to a
 * third-party geo service. An explicit URL or saved choice always wins;
 * otherwise Persian browser settings and the Iran timezone select Persian.
 */
export function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const saved = getSavedLocale();
  if (saved) return saved;
  const urlLocale = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(urlLocale)) return urlLocale;


  const browserLanguages = [
    navigator.language,
    ...(navigator.languages ?? []),
  ].filter(Boolean);
  if (
    browserLanguages.some((language) =>
      language.toLowerCase().startsWith("fa"),
    )
  ) {
    return "fa";
  }

  try {
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Tehran") {
      return "fa";
    }
  } catch {
    // Some embedded browsers do not expose a timezone. English is the
    // international fallback in that case.
  }

  return "en";
}
