// app/tools/(security)/exif-remover/content.ts

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

export const exifRemoverContent = {
  fa: {
    page: {
      title: "حذف متادیتای عکس (EXIF) — بدون آپلود",
      description:
        "تصویر را آپلود کن تا متادیتای EXIF مثل موقعیت مکانی (GPS)، مدل گوشی و زمان ثبت حذف شود. پردازش کاملاً محلی در مرورگر انجام می‌شود.",
    },

    seo: {
      title: "حذف متادیتای عکس (EXIF) | Tools Manager",
      description:
        "متادیتای پنهان عکس‌ها را حذف کن (GPS، مدل دستگاه، تاریخ) و نسخه پاک‌سازی‌شده را دانلود کن؛ بدون ارسال فایل به سرور.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/exif-remover",
      ogTitle: "حذف EXIF عکس‌ها (حریم خصوصی و امنیت)",
      ogDescription:
        "قبل از انتشار عکس در شبکه‌های اجتماعی، متادیتای حساس مثل لوکیشن و اطلاعات دستگاه را پاک‌سازی کن.",
      applicationCategory: "SecurityApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "EXIF remover (no upload)",
      description:
        "Upload an image to remove EXIF metadata like GPS location, device model and timestamps. Everything runs locally in your browser.",
    },

    seo: {
      title: "EXIF remover tool | Tools Manager",
      description:
        "Remove hidden image metadata (GPS, device model, timestamps) and download a cleaned file — with no uploads to a server.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/exif-remover",
      ogTitle: "EXIF remover (privacy-first)",
      ogDescription:
        "Clean sensitive photo metadata before sharing on social media, fully local processing.",
      applicationCategory: "SecurityApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ExifRemoverContent = typeof exifRemoverContent.fa;

export function useExifRemoverContent() {
  const { locale } = useLanguage();
  return exifRemoverContent[locale];
}

export function useExifRemoverPageContent() {
  const content = useExifRemoverContent();
  return content.page;
}

export function getExifRemoverSeo(locale: "fa" | "en"): SeoContent {
  return exifRemoverContent[locale].seo;
}
