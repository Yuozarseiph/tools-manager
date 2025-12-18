// app/tools/(media)/audio-extractor/content.ts

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

export const audioExtractorContent = {
  fa: {
    page: {
      title: "استخراج صدا از ویدیو",
      description:
        "فایل صوتی را مستقیماً از ویدیوهای خود در مرورگر جدا کنید و به فرمت‌های MP3، WAV، OGG یا M4A دانلود کنید بدون نیاز به آپلود.",
    },
    seo: {
      title: "استخراج صدا از ویدیو آنلاین | Tools Manager",
      description:
        "ابزار استخراج صدا از ویدیو که به شما اجازه می‌دهد فایل صوتی را از فرمت‌های مختلف ویدیو جدا کنید و با کیفیت دلخواه دانلود نمایید؛ تمام پردازش روی دستگاه شما.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/audio-extractor",
      ogTitle: "استخراج صدا از ویدیو در مرورگر (MP3, WAV, OGG, M4A)",
      ogDescription:
        "ویدیوهای MP4، AVI، MOV یا MKV را باز کنید و صدای آن‌ها را به فرمت دلخواه استخراج کنید؛ بدون آپلود، همه چیز در مرورگر شما.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Extract audio from video",
      description:
        "Extract audio tracks from your videos directly in the browser and download them as MP3, WAV, OGG or M4A without uploading anything.",
    },
    seo: {
      title: "Extract audio from video online | Tools Manager",
      description:
        "Extract audio from various video formats and download with customizable quality; all processing done on your device.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/audio-extractor",
      ogTitle: "Browser-based audio extractor (MP3, WAV, OGG, M4A)",
      ogDescription:
        "Load MP4, AVI, MOV or MKV files and extract their audio to your desired format; no upload, everything in your browser.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type AudioExtractorContent = typeof audioExtractorContent.fa;

export function useAudioExtractorContent() {
  const { locale } = useLanguage();
  return audioExtractorContent[locale];
}

export function useAudioExtractorPageContent() {
  const content = useAudioExtractorContent();
  return content.page;
}

export function getAudioExtractorSeo(locale: "fa" | "en"): SeoContent {
  return audioExtractorContent[locale].seo;
}
