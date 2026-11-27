import type { Metadata } from "next";
import type { Locale } from "../i18n/locale-detection";
import { localizedPath } from "../i18n/localized-path";
import { TOOLS } from "@/config/tools";

export const SITE_URL = "https://qodeforge.ir";
export function pageAlternates(path: string) {
  return {
    "fa-IR": `${SITE_URL}${localizedPath(path, "fa")}`,
    "en-US": `${SITE_URL}${localizedPath(path, "en")}`,
    "x-default": `${SITE_URL}${localizedPath(path, "fa")}`,
  };
}

const persianSearchTitles: Record<string, string> = {
  "/tools/image-compressor": "کاهش حجم عکس آنلاین رایگان",
  "/tools/image-resizer": "تغییر اندازه عکس آنلاین",
  "/tools/pdf-to-word": "تبدیل PDF به ورد آنلاین رایگان",
  "/tools/word-to-pdf": "تبدیل ورد به PDF آنلاین رایگان",
  "/tools/pdf-merge": "ادغام فایل PDF آنلاین رایگان",
  "/tools/image-to-text": "تبدیل عکس به متن آنلاین",
};
export function pageMetadata(locale: Locale, path: string, title: string, description: string, tool = false): Metadata {
  const localizedTitle = locale === "fa" ? persianSearchTitles[path] ?? title : title;
  const cleanTitle = localizedTitle.trim().replace(/\s*\|\s*QodeForge$/i, "").trim();
  const fullTitle = /\bQodeForge\b/i.test(cleanTitle) ? cleanTitle : `${cleanTitle} | QodeForge`;
  const summary = description.trim();
  const url = `${SITE_URL}${localizedPath(path, locale)}`;
  const image = tool ? `${url}/opengraph-image.png` : `${SITE_URL}/${locale}/opengraph-image.png`;
  return {
    ...(tool && TOOLS.find(item => item.href === path)?.status === "coming-soon" ? { robots: { index: false, follow: true } } : {}),
    title: fullTitle, description: summary,
    alternates: { canonical: url, languages: pageAlternates(path),
      ...(tool ? { types: { "text/markdown": `${url}.md` } } : {}) },
    openGraph: { type: "website", title: fullTitle, description: summary, url,
      siteName: "QodeForge", locale: locale === "fa" ? "fa_IR" : "en_US",
      alternateLocale: [locale === "fa" ? "en_US" : "fa_IR"],
      images: [{ url: image, width: 1200, height: 630, alt: cleanTitle }] },
    twitter: { card: "summary_large_image", title: fullTitle, description: summary, images: [image] },
  };
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
