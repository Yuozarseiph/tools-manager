// app/tools/(developer)/markdown/content.ts

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

export const markdownContent = {
  fa: {
    page: {
      title: "ویرایش و پیش‌نمایش Markdown آنلاین",
      description:
        "متن Markdown را در مرورگر بنویس یا بچسبان، پیش‌نمایش زنده را ببین و خروجی نهایی را برای مستندات، README و وبلاگ‌ها استفاده کن.",
    },
    seo: {
      title: "ویرایشگر Markdown آنلاین | QodeForge",
      description:
        "یک ویرایشگر ساده و کاربردی برای نوشتن و پیش‌نمایش Markdown در مرورگر، مناسب برای README، مستندات و محتوای فنی.",
      canonical: "https://qodeforge.ir/tools/markdown",
      ogTitle: "ویرایشگر و پیش‌نمایشگر Markdown در مرورگر",
      ogDescription:
        "Markdown بنویس، پیش‌نمایش رندر شده را ببین و متن را برای استفاده در GitHub، بلاگ یا مستندات کپی کن؛ بدون نیاز به نصب ابزار اضافی.",
      applicationCategory: "ProductivityApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online Markdown editor & preview",
      description:
        "Write or paste Markdown in your browser, see a live preview and reuse the output for docs, READMEs and blog posts.",
    },
    seo: {
      title: "Markdown editor online | QodeForge",
      description:
        "A simple, focused editor for writing and previewing Markdown directly in the browser, ideal for technical content and documentation.",
      canonical: "https://qodeforge.ir/tools/markdown",
      ogTitle: "In‑browser Markdown editor and previewer",
      ogDescription:
        "Compose Markdown, inspect the rendered preview and copy the result for GitHub, blogs or documentation without installing extra tools.",
      applicationCategory: "ProductivityApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type MarkdownContent = typeof markdownContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useMarkdownContent() {
  const { locale } = useLanguage();
  return markdownContent[locale];
}

// 🔥 Hook مخصوص page content
export function useMarkdownPageContent() {
  const content = useMarkdownContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getMarkdownSeo(locale: "fa" | "en"): SeoContent {
  return markdownContent[locale].seo;
}

