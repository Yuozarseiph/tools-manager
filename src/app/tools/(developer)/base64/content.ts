// app/tools/(developer)/base64/content.ts

import { useLanguage } from "@/context/LanguageContext";

// 🔥 تعریف Type برای SEO
export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const base64Content = {
  fa: {
    page: {
      title: "تبدیل متن به Base64 و برعکس",
      description:
        "متن ساده را به Base64 تبدیل کن یا خروجی Base64 را به متن قابل خواندن برگردان؛ همه در مرورگر و بدون ارسال به سرور.",
    },
    seo: {
      title: "ابزار Base64 آنلاین | Tools Manager",
      description:
        "رمزگذاری و رمزگشایی Base64 برای متن و داده‌ها، مناسب برای توسعه‌دهندگان و کار با APIها، بدون نیاز به نصب نرم‌افزار.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/base64",
      ogTitle: "مبدل آنلاین Base64 (Encode/Decode)",
      ogDescription:
        "رشته‌های متنی را به Base64 تبدیل کن یا آن‌ها را به‌سرعت از Base64 به متن اصلی برگردان، با رابط کاربری ساده و واکنش‌گرا.",
      applicationCategory: "DeveloperApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent, // 🔥 اضافه شد
  },

  en: {
    page: {
      title: "Base64 encoder & decoder",
      description:
        "Convert plain text to Base64 or decode Base64 strings back to readable text directly in your browser.",
    },
    seo: {
      title: "Online Base64 tool | Tools Manager",
      description:
        "Encode and decode Base64 for text and data, ideal for developers and API work, without installing any software.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/base64",
      ogTitle: "Online Base64 converter (Encode / Decode)",
      ogDescription:
        "Quickly convert strings to Base64 or decode Base64 back to the original text with a clean, responsive UI.",
      applicationCategory: "DeveloperApplication",
      inLanguage: "en-US",
    } satisfies SeoContent, // 🔥 اضافه شد
  },
};

export type Base64Content = typeof base64Content.fa;

// 🔥 Custom hook برای استفاده در کامپوننت‌های Client
export function useBase64Content() {
  const { locale } = useLanguage();
  return base64Content[locale];
}

// 🔥 Hook مخصوص page content
export function useBase64PageContent() {
  const content = useBase64Content();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (بدون hook - برای page.tsx)
export function getBase64Seo(locale: "fa" | "en"): SeoContent {
  return base64Content[locale].seo;
}
