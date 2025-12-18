// app/tools/(presentation)/html-to-pptx/content.ts

import { useLanguage } from "@/context/LanguageContext";

export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const htmlToPptxContent = {
  fa: {
    page: {
      title: "تبدیل آنلاین HTML و Markdown به پاورپوینت (PPTX)",
      description:
        "محتوای HTML یا Markdown را وارد کن، اسلایدها را در مرورگر پیش‌نمایش بگیر و یک فایل پاورپوینت (PPTX) ساختارمند برای ارائه بساز.",
    },
    seo: {
      title: "ابزار تبدیل HTML به پاورپوینت آنلاین | Tools Manager",
      description:
        "متن HTML یا Markdown را به اسلایدهای پاورپوینت تبدیل کن، ساختار عنوان‌ها را حفظ کن و فایل PPTX نهایی را برای ارائه یا ویرایش دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/html-to-pptx",
      ogTitle: "مبدل تحت‌وب HTML و Markdown به پاورپوینت (PPTX)",
      ogDescription:
        "بدون نصب نرم‌افزار، از روی HTML یا Markdown اسلایدهای قابل ویرایش پاورپوینت بساز و آن‌ها را برای جلسات، کلاس‌ها یا وبینارها آماده کن.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Convert HTML & Markdown to PowerPoint (PPTX) online",
      description:
        "Paste HTML or Markdown, preview how it maps to slides and generate a structured PPTX file for your presentations.",
    },
    seo: {
      title: "HTML to PPTX converter online | Tools Manager",
      description:
        "Turn HTML or Markdown content into PowerPoint slides, keep heading structure and download an editable PPTX file for talks or classes.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/html-to-pptx",
      ogTitle: "Web-based HTML & Markdown to PowerPoint (PPTX) converter",
      ogDescription:
        "Quickly build editable PowerPoint decks from HTML or Markdown directly in the browser, ready for presenting or further styling.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type HtmlToPptxContent = typeof htmlToPptxContent.fa;

export function useHtmlToPptxContent() {
  const { locale } = useLanguage();
  return htmlToPptxContent[locale];
}

export function useHtmlToPptxPageContent() {
  const content = useHtmlToPptxContent();
  return content.page;
}

export function getHtmlToPptxSeo(locale: "fa" | "en"): SeoContent {
  return htmlToPptxContent[locale].seo;
}
