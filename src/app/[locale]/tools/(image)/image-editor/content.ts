// app/tools/(image)/image-editor/content.ts

import { useLanguage } from "@/context/LanguageContext";

//  Type مشترک برای SEO
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
        "تصاویر PNG، JPG، WebP و PSD را به صورت کاملاً آفلاین ویرایش کن. با لایه‌ها، حالت‌های ترکیب، فیلترها و تنظیمات رنگ کار کن، متن و شکل اضافه کن و خروجی را در فرمت‌های PNG، JPG، WebP یا PSD ذخیره کن.",
    },
    seo: {
      title: "ویرایشگر تصویر آفلاین PNG، JPG و PSD | QodeForge",
      description:
        "ویرایش حرفه‌ای تصویر با پشتیبانی از PNG، JPG، WebP و PSD. لایه‌ها، حالت‌های ترکیب، فیلترهای پیشرفته، تنظیمات رنگ، متن و شکل با خروجی چندگانه - کاملاً رایگان و آفلاین.",
      canonical: "https://qodeforge.ir/tools/image-editor",
      ogTitle: "ویرایشگر تصویر آفلاین - جایگزین سبک برای Photoshop",
      ogDescription:
        "یک ویرایشگر تصویر لایه‌ای و کاملاً آفلاین برای ویرایش تصاویر PNG، JPG، WebP و PSD با فیلترها، تنظیمات رنگ، متن، شکل و خروجی چندگانه.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Offline Image Editor",
      description:
        "Edit PNG, JPG, WebP and PSD images completely offline. Work with layers, blend modes, filters and color adjustments, add text and shapes, and export to PNG, JPG, WebP or PSD.",
    },
    seo: {
      title: "Offline PNG, JPG & PSD Image Editor | QodeForge",
      description:
        "Professional layered image editing with PNG, JPG, WebP and PSD support. Advanced filters, color adjustments, text and shapes, and multi-format export – completely free and offline.",
      canonical: "https://qodeforge.ir/tools/image-editor",
      ogTitle: "Offline Image Editor - Lightweight Photoshop Alternative",
      ogDescription:
        "A powerful, fully offline layered image editor for PNG, JPG, WebP and PSD with filters, color adjustments, text, shapes and multi-format export.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ImageEditorContent = typeof imageEditorContent.fa;

//  Hook برای استفاده در کامپوننت Client
export function useImageEditorContent() {
  const { locale } = useLanguage();
  return imageEditorContent[locale];
}

//  Hook مخصوص page content
export function useImageEditorPageContent() {
  const content = useImageEditorContent();
  return content.page;
}

//  تابع برای دریافت SEO (برای page.tsx)
export function getImageEditorSeo(locale: "fa" | "en"): SeoContent {
  return imageEditorContent[locale].seo;
}

