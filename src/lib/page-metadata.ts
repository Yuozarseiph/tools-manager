import type { Metadata } from "next";
import type { Locale } from "./locale-detection";
import { localizedPath } from "./localized-path";
import { TOOLS } from "@/data/tools";

export const SITE_URL = "https://qodeforge.ir";
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
  const cleanTitle = localizedTitle.replace(/\s*\|\s*QodeForge.*$/i, "").replace(/QodeForge/gi, "").replace(/^[\s|]+|[\s|]+$/g, "").trim();
  const shortTitle = cleanTitle.length > 47 ? cleanTitle.slice(0, 47).replace(/\s+\S*$/, "") : cleanTitle;
  const fullTitle = `${shortTitle} | QodeForge`;
  const expandedDescription = description.length < 140 ? `${description} ${locale === "fa" ? "راهنمای استفاده و جزئیات حریم خصوصی را ببینید و تنظیمات مناسب کار خود را انتخاب کنید؛ استفاده رایگان و بدون ثبت‌نام." : "Read the usage guide and privacy details, then choose the settings that fit your task. Free access without an account."}` : description;
  const shortDescription = expandedDescription.length > 160 ? `${expandedDescription.slice(0, 157).replace(/\s+\S*$/, "")}…` : expandedDescription;
  const url = `${SITE_URL}${localizedPath(path, locale)}`;
  const image = tool ? `${url}/opengraph-image.png` : `${SITE_URL}/${locale}/opengraph-image.png`;
  return {
    ...(tool && TOOLS.find(item => item.href === path)?.status === "coming-soon" ? { robots: { index: false, follow: true } } : {}),
    title: fullTitle, description: shortDescription,
    alternates: { canonical: url, languages: {
      "fa-IR": `${SITE_URL}${localizedPath(path, "fa")}`,
      "en-US": `${SITE_URL}${localizedPath(path, "en")}`,
      "x-default": `${SITE_URL}${localizedPath(path, "fa")}`,
    }, ...(tool ? { types: { "text/markdown": `${url}.md` } } : {}) },
    openGraph: { type: "website", title: fullTitle, description: shortDescription, url,
      siteName: "QodeForge", locale: locale === "fa" ? "fa_IR" : "en_US",
      alternateLocale: [locale === "fa" ? "en_US" : "fa_IR"],
      images: [{ url: image, width: 1200, height: 630, alt: cleanTitle }] },
    twitter: { card: "summary_large_image", title: fullTitle, description: shortDescription, images: [image] },
  };
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
