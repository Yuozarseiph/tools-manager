// app/tools/(image)/image-converter/content.ts

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

export const imageConverterContent = {
  fa: {
    page: {
      title: "تبدیل فرمت آنلاین تصاویر (JPG، PNG، WEBP، AVIF...)",
      description:
        "چندین تصویر را هم‌زمان آپلود کن و آن‌ها را به فرمت‌های مختلف مانند JPG، PNG، WEBP، AVIF یا GIF تبدیل کن؛ همه چیز در مرورگر انجام می‌شود.",
      subtitle:
        "برای کاهش حجم، یکسان‌سازی فرمت تصاویر سایت یا آماده‌سازی برای اشتراک‌گذاری در شبکه‌های اجتماعی مناسب است.",
    },
    seo: {
      title: "مبدل فرمت تصویر آنلاین | Tools Manager",
      description:
        "تصاویر را به‌صورت گروهی بین فرمت‌های رایج مثل JPG، PNG، WEBP و AVIF تبدیل کن، کیفیت را تنظیم کن و خروجی را دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-converter",
      ogTitle: "تبدیل‌کننده تحت‌وب فرمت تصاویر (Batch Image Converter)",
      ogDescription:
        "چند تصویر را انتخاب کن، فرمت مقصد و کیفیت را مشخص کن و خروجی نهایی را برای استفاده در وب‌سایت، اپلیکیشن یا شبکه‌های اجتماعی دانلود کن.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online image format converter (JPG, PNG, WEBP, AVIF...)",
      description:
        "Upload multiple images at once and convert them between formats like JPG, PNG, WEBP, AVIF or GIF directly in your browser.",
      subtitle:
        "Ideal for reducing size, unifying formats for websites or preparing images for social media sharing.",
    },
    seo: {
      title: "Image format converter online | Tools Manager",
      description:
        "Batch-convert images between popular formats such as JPG, PNG, WEBP and AVIF, adjust quality and download the results.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-converter",
      ogTitle: "Web-based image format converter (Batch)",
      ogDescription:
        "Select multiple images, choose the target format and quality, then download ready-to-use files for web, apps or social media.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ImageConverterContent = typeof imageConverterContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useImageConverterContent() {
  const { locale } = useLanguage();
  return imageConverterContent[locale];
}

// 🔥 Hook مخصوص page content
export function useImageConverterPageContent() {
  const content = useImageConverterContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getImageConverterSeo(locale: "fa" | "en"): SeoContent {
  return imageConverterContent[locale].seo;
}
