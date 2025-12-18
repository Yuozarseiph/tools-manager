// app/tools/(developer)/json-formatter/content.ts

import { useLanguage } from "@/context/LanguageContext";

// 🔥 Type مشترک برای SEO
export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const jsonFormatterContent = {
  fa: {
    page: {
      title: "فرمت و اعتبارسنجی JSON آنلاین",
      description:
        "رشته‌های JSON را در مرورگر بچسبان، فرمت خروجی را مرتب کن، خطاهای نحوی را ببین و در صورت نیاز نسخهٔ فشرده تولید کن.",
    },
    seo: {
      title: "ابزار JSON Formatter آنلاین | Tools Manager",
      description:
        "JSON را به‌صورت خوانا (Pretty) یا فشرده (Minified) فرمت کن، خطاها را سریع پیدا کن و خروجی را برای استفاده در کد یا API کپی و دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/json-formatter",
      ogTitle: "فرمت‌کننده و اعتبارسنج JSON در مرورگر",
      ogDescription:
        "با این ابزار JSON را بچسبان، ساختار درختی را ببین، آن را فرمت یا کوچک کن و با یک کلیک خروجی را کپی یا ذخیره کن.",
      applicationCategory: "DeveloperApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online JSON formatter & validator",
      description:
        "Paste JSON in your browser, pretty‑print it, validate the syntax and optionally generate a minified version.",
    },
    seo: {
      title: "JSON Formatter online tool | Tools Manager",
      description:
        "Format JSON as pretty or minified, quickly spot syntax errors, and copy or download the result for use in code or APIs.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/json-formatter",
      ogTitle: "In‑browser JSON formatter and validator",
      ogDescription:
        "Paste JSON, inspect the tree, format or minify it and copy or save the output with a single click.",
      applicationCategory: "DeveloperApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type JsonFormatterContent = typeof jsonFormatterContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useJsonFormatterContent() {
  const { locale } = useLanguage();
  return jsonFormatterContent[locale];
}

// 🔥 Hook مخصوص page content
export function useJsonFormatterPageContent() {
  const content = useJsonFormatterContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getJsonFormatterSeo(locale: "fa" | "en"): SeoContent {
  return jsonFormatterContent[locale].seo;
}
