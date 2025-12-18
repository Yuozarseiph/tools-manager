// app/tools/(image)/image-to-pdf/content.ts

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

export const imageToPdfContent = {
  fa: {
    page: {
      title: "تبدیل آنلاین چندین تصویر به یک فایل PDF",
      description:
        "چند تصویر را انتخاب کن، ترتیب آن‌ها را مشخص کن و یک فایل PDF مرتب برای اشتراک‌گذاری، چاپ یا آرشیو بساز؛ همه چیز در مرورگر انجام می‌شود.",
    },
    seo: {
      title: "ابزار تبدیل تصویر به PDF آنلاین | Tools Manager",
      description:
        "عکس‌ها را به یک یا چند فایل PDF تبدیل کن، ترتیب صفحات را بچین و بدون نصب نرم‌افزار اضافی خروجی را دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-to-pdf",
      ogTitle: "مبدل آنلاین تصویر به PDF",
      ogDescription:
        "چندین تصویر را در مرورگر آپلود کن، آن‌ها را مرتب کن و یک فایل PDF آماده برای ارسال، چاپ یا ذخیره‌سازی بساز.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Convert multiple images to a single PDF online",
      description:
        "Select several images, arrange their order and generate a clean PDF file for sharing, printing or archiving directly in your browser.",
    },
    seo: {
      title: "Image to PDF converter online | Tools Manager",
      description:
        "Turn images into one or more PDF files, reorder pages and download the result without installing extra software.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-to-pdf",
      ogTitle: "Online image to PDF converter",
      ogDescription:
        "Upload multiple images, arrange them visually and create a ready-to-share PDF file entirely in the browser.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ImageToPdfContent = typeof imageToPdfContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useImageToPdfContent() {
  const { locale } = useLanguage();
  return imageToPdfContent[locale];
}

// 🔥 Hook مخصوص page content
export function useImageToPdfPageContent() {
  const content = useImageToPdfContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getImageToPdfSeo(locale: "fa" | "en"): SeoContent {
  return imageToPdfContent[locale].seo;
}
