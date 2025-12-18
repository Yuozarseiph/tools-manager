// app/tools/(utility)/word-counter/content.ts

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

export const wordCounterContent = {
  fa: {
    page: {
      title: "شمارش آنلاین کلمات، حروف و پاراگراف‌ها",
      description:
        "متن خود را وارد کن تا تعداد کلمات، حروف با و بدون فاصله، جملات، پاراگراف‌ها و زمان تقریبی مطالعه را ببینی.",
    },
    seo: {
      title: "ابزار شمارش کلمات و حروف آنلاین | Tools Manager",
      description:
        "برای متن‌های مقاله، شبکه‌های اجتماعی، رزومه یا متن‌های رسمی، تعداد کلمات و حروف را به‌سرعت محاسبه کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/word-counter",
      ogTitle: "شمارنده تحت‌وب کلمات، کاراکترها و پاراگراف‌ها",
      ogDescription:
        "بدون نصب نرم‌افزار، متن را در مرورگر وارد کن و آمار کامل آن را برای ویرایش و بهینه‌سازی دریافت کن.",
      applicationCategory: "ProductivityApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online word, character and paragraph counter",
      description:
        "Paste or type your text to instantly see word count, characters (with and without spaces), sentences, paragraphs and estimated reading time.",
    },
    seo: {
      title: "Word and character counter tool | Tools Manager",
      description:
        "Quickly measure the length of articles, posts, resumes or any text by counting words, characters and more.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/word-counter",
      ogTitle: "Web-based word, character and paragraph statistics",
      ogDescription:
        "Check detailed text statistics in your browser to fine‑tune length for publishing and content guidelines.",
      applicationCategory: "ProductivityApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type WordCounterContent = typeof wordCounterContent.fa;

export function useWordCounterContent() {
  const { locale } = useLanguage();
  return wordCounterContent[locale];
}

export function useWordCounterPageContent() {
  const content = useWordCounterContent();
  return content.page;
}

export function getWordCounterSeo(locale: "fa" | "en"): SeoContent {
  return wordCounterContent[locale].seo;
}
