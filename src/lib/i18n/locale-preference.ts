import type { Locale } from "./locale-detection";
import { localizedPath } from "./localized-path";

export function preferredLocaleTarget(href: string, locale: Locale): string | null {
  const url = new URL(href);
  const path = localizedPath(url.pathname, locale);
  if (path === url.pathname) return null;
  url.pathname = path;
  url.searchParams.delete("lang");
  return url.href;
}
