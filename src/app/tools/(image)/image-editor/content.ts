// app/tools/(image)/image-editor/content.ts

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

export const imageEditorContent = {
  fa: {
    page: {
      title: "ویرایشگر تصویر آفلاین",
      description:
        "تصاویر PNG، JPG، WebP و AVIF را به صورت کاملاً آفلاین ویرایش کن. فیلترها را اعمال کن، اندازه و چرخش را تغییر بده، متن و استیکر اضافه کن و خروجی را در فرمت‌های مختلف ذخیره کن.",
    },
    seo: {
      title: "ویرایشگر تصویر آفلاین PNG و JPG | Tools Manager",
      description:
        "ویرایش حرفه‌ای تصویر با پشتیبانی از PNG، JPG، WebP و AVIF. فیلترهای پیشرفته، تغییر اندازه، چرخش، افزودن متن و استیکر و خروجی به فرمت‌های مدرن - کاملاً رایگان و آفلاین.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-editor",
      ogTitle: "ویرایشگر تصویر آفلاین - جایگزین سبک برای Photoshop",
      ogDescription:
        "یک ویرایشگر تصویر قدرتمند و کاملاً آفلاین برای ویرایش تصاویر PNG، JPG، WebP و AVIF با فیلترها، تغییر اندازه، متن، استیکر و خروجی چندگانه.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Offline Image Editor",
      description:
        "Edit PNG, JPG, WebP and AVIF images completely offline. Apply filters, resize and rotate, add text and stickers, and export in multiple formats.",
    },
    seo: {
      title: "Offline PNG & JPG Image Editor | Tools Manager",
      description:
        "Professional image editing with PNG, JPG, WebP and AVIF support. Advanced filters, resize, rotate, text and stickers, and export to modern formats – completely free and offline.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-editor",
      ogTitle: "Offline Image Editor - Lightweight Photoshop Alternative",
      ogDescription:
        "A powerful, fully offline image editor for PNG, JPG, WebP and AVIF with filters, resize, rotate, text, stickers and multi-format export.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ImageEditorContent = typeof imageEditorContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useImageEditorContent() {
  const { locale } = useLanguage();
  return imageEditorContent[locale];
}

// 🔥 Hook مخصوص page content
export function useImageEditorPageContent() {
  const content = useImageEditorContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getImageEditorSeo(locale: "fa" | "en"): SeoContent {
  return imageEditorContent[locale].seo;
}
