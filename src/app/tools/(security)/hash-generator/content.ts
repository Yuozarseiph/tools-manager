// app/tools/(security)/hash-generator/content.ts

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

export const hashGeneratorContent = {
  fa: {
    page: {
      title: "تولید آنلاین هش‌ (SHA‑1، SHA‑256، SHA‑384، SHA‑512)",
      description:
        "رشته‌ی متن یا داده‌ی خود را وارد کن تا هش‌ آن را با الگوریتم‌های مختلف مانند SHA‑1، SHA‑256، SHA‑384 و SHA‑512 به‌صورت محلی در مرورگر به‌دست بیاوری.",
    },
    seo: {
      title: "ابزار تولید هش آنلاین | Tools Manager",
      description:
        "هش امن برای متن‌ها و رمزهایت بساز، چند الگوریتم مختلف را هم‌زمان ببین و بدون ارسال داده‌ها به سرور، خروجی را کپی کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/hash-generator",
      ogTitle: "تولیدکننده تحت‌وب هش (SHA و دیگر الگوریتم‌ها)",
      ogDescription:
        "با وارد کردن متن، هش‌ آن را با چند الگوریتم پرکاربرد امنیتی تولید کن و برای ذخیره‌سازی امن یا بررسی یکپارچگی از آن استفاده کن.",
      applicationCategory: "SecurityApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online hash generator (SHA‑1, SHA‑256, SHA‑384, SHA‑512)",
      description:
        "Enter your text or data to compute its hash using algorithms like SHA‑1, SHA‑256, SHA‑384 and SHA‑512 directly in your browser.",
    },
    seo: {
      title: "Online hash generator tool | Tools Manager",
      description:
        "Generate secure hashes for strings and passwords, compare multiple algorithms at once and copy the results without sending data to a server.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/hash-generator",
      ogTitle: "Web-based hash generator (SHA and more)",
      ogDescription:
        "Quickly compute hashes with popular cryptographic algorithms in the browser and use them for integrity checks or secure storage.",
      applicationCategory: "SecurityApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type HashGeneratorContent = typeof hashGeneratorContent.fa;

export function useHashGeneratorContent() {
  const { locale } = useLanguage();
  return hashGeneratorContent[locale];
}

export function useHashGeneratorPageContent() {
  const content = useHashGeneratorContent();
  return content.page;
}

export function getHashGeneratorSeo(locale: "fa" | "en"): SeoContent {
  return hashGeneratorContent[locale].seo;
}
