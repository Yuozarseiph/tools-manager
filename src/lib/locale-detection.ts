export type Locale = "fa" | "en";

export const LOCALE_STORAGE_KEY = "qodeforge_locale";

const isLocale = (value: string | null): value is Locale =>
  value === "fa" || value === "en";

/**
 * Pick a language for a first visit without sending identifying data to a
 * third-party geo service. An explicit URL or saved choice always wins;
 * otherwise Persian browser settings and the Iran timezone select Persian.
 */
export function detectInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";

  const urlLocale = new URLSearchParams(window.location.search).get("lang");
  if (isLocale(urlLocale)) return urlLocale;

  let savedLocale: string | null = null;
  try {
    savedLocale =
      window.localStorage.getItem(LOCALE_STORAGE_KEY) ??
      window.localStorage.getItem("tm_locale");
  } catch {
    // Storage can be disabled in private or embedded browser contexts.
  }
  if (isLocale(savedLocale)) return savedLocale;

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
