// app/tools/(image)/image-resizer/content.ts

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

export const imageResizerContent = {
  fa: {
    page: {
      title: "تغییر اندازه آنلاین تصاویر با حفظ نسبت",
      description:
        "تصویر خود را در مرورگر آپلود کن، عرض و ارتفاع جدید را وارد کن و نسخه‌ی تغییر اندازه‌داده‌شده را بدون افت محسوس کیفیت دانلود کن.",
    },
    seo: {
      title: "ابزار تغییر اندازه تصویر آنلاین | Tools Manager",
      description:
        "ابعاد تصاویر را برای وب، شبکه‌های اجتماعی یا اپلیکیشن‌ها تنظیم کن، نسبت تصویر را قفل کن و خروجی جدید را به‌سرعت دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-resizer",
      ogTitle: "تغییر اندازه آنلاین تصاویر (Image Resizer)",
      ogDescription:
        "طول و عرض تصویر را دقیق تنظیم کن، پیش‌نمایش ابعاد جدید را ببین و بدون نیاز به نرم‌افزار سنگین، خروجی مناسب بگیر.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online image resizer with aspect ratio lock",
      description:
        "Upload an image in your browser, set a new width and height and download a resized version without noticeable quality loss.",
    },
    seo: {
      title: "Image resizer online tool | Tools Manager",
      description:
        "Adjust image dimensions for the web, social media or apps, lock the aspect ratio and quickly download the resized result.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-resizer",
      ogTitle: "Online image resizer (Image Resizer)",
      ogDescription:
        "Precisely set image width and height, preview the new dimensions and get a ready-to-use file without heavy desktop software.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ImageResizerContent = typeof imageResizerContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useImageResizerContent() {
  const { locale } = useLanguage();
  return imageResizerContent[locale];
}

// 🔥 Hook مخصوص page content
export function useImageResizerPageContent() {
  const content = useImageResizerContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getImageResizerSeo(locale: "fa" | "en"): SeoContent {
  return imageResizerContent[locale].seo;
}
