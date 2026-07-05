// app/tools/(image)/image-stitcher/content.ts

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

export const imageStitcherContent = {
  fa: {
    page: {
      title: "چسباندن و ترکیب عمودی عکس‌ها (تصویر طولانی)",
      description:
        "تا ۲۰ عکس را زیر هم بچسبان و یک تصویر طولانی با ارتفاع زیاد بساز؛ ترتیب هر عکس را تغییر بده و در صورت نیاز هر تصویر را جداگانه Crop کن.",
    },
    seo: {
      title: "ابزار ترکیب عمودی عکس‌ها (تصویر طولانی) | Tools Manager",
      description:
        "چند عکس را انتخاب کن، مرتب کن، هر کدام را برش بزن و همه را زیر هم به یک تصویر طولانی PNG یا JPG تبدیل کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-stitcher",
      ogTitle: "مبدل ترکیب عمودی عکس‌ها",
      ogDescription:
        "عکس‌ها را زیر هم بچسبان و تصویر طولانی بساز؛ همه چیز داخل مرورگر و بدون آپلود.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Stitch and combine images vertically (long image)",
      description:
        "Stack up to 20 images on top of each other to build one tall, long image; reorder each image and crop any of them when needed.",
    },
    seo: {
      title: "Vertical image stitcher (long image) | Tools Manager",
      description:
        "Pick multiple images, reorder them, crop each one and merge them vertically into a single long PNG or JPG image.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/image-stitcher",
      ogTitle: "Vertical image stitcher",
      ogDescription:
        "Combine images vertically into a tall long image — entirely in your browser with no upload.",
      applicationCategory: "MultimediaApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ImageStitcherContent = typeof imageStitcherContent.fa;

export function useImageStitcherContent() {
  const { locale } = useLanguage();
  return imageStitcherContent[locale];
}

export function useImageStitcherPageContent() {
  const content = useImageStitcherContent();
  return content.page;
}

export function getImageStitcherSeo(locale: "fa" | "en"): SeoContent {
  return imageStitcherContent[locale].seo;
}
