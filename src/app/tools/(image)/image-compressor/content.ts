// app/tools/(image)/image-compressor/content.ts

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

export const imageCompressorContent = {
  fa: {
    page: {
      title: "فشرده‌سازی آنلاین تصاویر بدون افت محسوس کیفیت",
      description:
        "عکس‌های خود را در مرورگر آپلود کن، حجم آن‌ها را کاهش بده و نسخه‌ی بهینه‌شده را برای وب‌سایت، شبکه‌های اجتماعی یا ارسال سریع‌تر دانلود کن.",
    },
    seo: {
      title: "ابزار فشرده‌سازی تصویر آنلاین | QodeForge",
      description:
        "تصاویر JPG و PNG را بدون افت شدید کیفیت فشرده کن، حجم فایل را کم کن و خروجی را برای استفاده در وب و اپلیکیشن‌ها ذخیره کن.",
      canonical: "https://qodeforge.ir/tools/image-compressor",
      ogTitle: "فشرده‌ساز آنلاین تصاویر در مرورگر",
      ogDescription:
        "تصویر را آپلود کن، تنظیمات کیفیت را انتخاب کن و نسخه‌ی کم‌حجم‌شده را بلافاصله دانلود کن؛ همه چیز روی دستگاه شما انجام می‌شود.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online image compressor without noticeable quality loss",
      description:
        "Upload your images in the browser, reduce their size and download optimized versions for websites, social media or faster sharing.",
    },
    seo: {
      title: "Image compressor online tool | QodeForge",
      description:
        "Compress JPG and PNG images without heavy quality loss, shrink file sizes and save the result for web and app usage.",
      canonical: "https://qodeforge.ir/tools/image-compressor",
      ogTitle: "In‑browser image compression tool",
      ogDescription:
        "Upload an image, choose quality settings and download a lighter version instantly, with all processing done on your device.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ImageCompressorContent = typeof imageCompressorContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useImageCompressorContent() {
  const { locale } = useLanguage();
  return imageCompressorContent[locale];
}

// 🔥 Hook مخصوص page content
export function useImageCompressorPageContent() {
  const content = useImageCompressorContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getImageCompressorSeo(locale: "fa" | "en"): SeoContent {
  return imageCompressorContent[locale].seo;
}

