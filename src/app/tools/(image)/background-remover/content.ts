// app/tools/(image)/background-remover/content.ts

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

export const backgroundRemoverContent = {
  fa: {
    page: {
      title: "حذف پس‌زمینه تصویر (آفلاین)",
      description:
        "تصویر را آپلود کن تا پس‌زمینه به‌صورت خودکار حذف شود و خروجی PNG با پس‌زمینه شفاف بگیری. پردازش روی دستگاه شما انجام می‌شود.",
    },
    seo: {
      title: "حذف پس‌زمینه تصویر (آفلاین) | Tools Manager",
      description:
        "حذف پس‌زمینه عکس با هوش مصنوعی به‌صورت محلی در مرورگر، بدون آپلود فایل. خروجی PNG شفاف دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/background-remover",
      ogTitle: "حذف پس‌زمینه عکس (کاملاً آفلاین)",
      ogDescription:
        "پس‌زمینه تصویر را حذف کن و خروجی شفاف (PNG) بگیر — بدون ارسال فایل به سرور.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Background remover (offline)",
      description:
        "Upload an image to automatically remove the background and download a transparent PNG. Processing runs on your device.",
    },
    seo: {
      title: "Offline background remover | Tools Manager",
      description:
        "Remove image backgrounds locally in your browser with no uploads and export a transparent PNG.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/background-remover",
      ogTitle: "Offline background remover",
      ogDescription:
        "Remove backgrounds and export transparent PNG output — privacy-first, no uploads.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type BackgroundRemoverContent = typeof backgroundRemoverContent.fa;

export function useBackgroundRemoverContent() {
  const { locale } = useLanguage();
  return backgroundRemoverContent[locale];
}

export function useBackgroundRemoverPageContent() {
  const content = useBackgroundRemoverContent();
  return content.page;
}

export function getBackgroundRemoverSeo(locale: "fa" | "en"): SeoContent {
  return backgroundRemoverContent[locale].seo;
}
