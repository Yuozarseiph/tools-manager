// app/tools/(media)/audio-editor/content.ts

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

export const audioEditorContent = {
  fa: {
    page: {
      title: "ویرایشگر صوتی در مرورگر",
      description:
        "فایل‌های صوتی را مستقیماً در مرورگر باز کن، برش بزن، فید این/اوت بده و نسخه‌ی جدید را بدون آپلود روی سرور دانلود کن.",
    },
    seo: {
      title: "ویرایشگر صوتی آنلاین | Tools Manager",
      description:
        "ابزار ویرایش صوت که به تو اجازه می‌دهد بخش دلخواه را انتخاب کنی، فید این/اوت اعمال کنی و صدا را نرمال‌سازی کنی؛ همه روی دستگاه خودت.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/audio-editor",
      ogTitle: "ویرایشگر صوتی در مرورگر (Trim, Fade, Normalize)",
      ogDescription:
        "فایل‌های MP3، WAV یا OGG را در مرورگر باز کن، بازه‌ی دلخواه را ببُر و با چند کلیک نسخه‌ی جدید را به‌صورت WAV دریافت کن.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Browser audio editor",
      description:
        "Open audio files in your browser, trim ranges, apply fades and download the result without uploading anything.",
    },
    seo: {
      title: "Online audio editor | Tools Manager",
      description:
        "Edit audio directly in your browser: trim, fade and normalize sound with all processing done on your device.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/audio-editor",
      ogTitle: "Browser-based audio editor (Trim, Fade, Normalize)",
      ogDescription:
        "Load MP3, WAV or OGG files in the browser, select a range, apply fade-in/fade-out and export a fresh WAV file locally.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type AudioEditorContent = typeof audioEditorContent.fa;

export function useAudioEditorContent() {
  const { locale } = useLanguage();
  return audioEditorContent[locale];
}

export function useAudioEditorPageContent() {
  const content = useAudioEditorContent();
  return content.page;
}

export function getAudioEditorSeo(locale: "fa" | "en"): SeoContent {
  return audioEditorContent[locale].seo;
}
