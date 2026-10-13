import type { Locale } from "./locale-detection";

export function stripLocale(path: string): string {
  return path.replace(/^\/(fa|en)(?=[/?#]|$)/, "") || "/";
}

export function localizedPath(path: string, locale: Locale): string {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  const plain = stripLocale(path.replace(/\.html(?=$|[?#])/i, ""));
  if (/^\/(fonts|icons|images|downloads|_next)\b/.test(plain) || /\.[a-z0-9]+(?:[?#]|$)/i.test(plain)) return path;
  return `/${locale}${plain === "/" ? "" : plain}`;
}

export function parseLocale(value: string): Locale {
  if (value !== "fa" && value !== "en") throw new Error(`Unsupported locale: ${value}`);
  return value;
}
