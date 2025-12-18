// app/tools/(developer)/code-visualizer/content.ts

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

export const codeVisualizerContent = {
  fa: {
    page: {
      title: "بصری‌سازی ساختار کد (JS و #C)",
      description:
        "کد جاوااسکریپت، تایپ‌اسکریپت یا #C را وارد کن و گراف ساختار توابع، کلاس‌ها و وابستگی‌ها را به‌صورت بصری در مرورگر ببین.",
    },
    seo: {
      title: "ابزار Code Visualizer آنلاین | Tools Manager",
      description:
        "ساختار کد را به‌صورت گراف بصری مشاهده کن، توابع و وابستگی‌ها را دنبال کن و درک معماری پروژه را سریع‌تر کن؛ همه در مرورگر و بدون نیاز به نصب.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/code-visualizer",
      ogTitle: "بصری‌سازی آنلاین ساختار کد (JavaScript / C#)",
      ogDescription:
        "کد خود را در ابزار Code Visualizer بچسبان، گراف را ببین و بین نماهای مختلف (درختی، سلسله‌مراتبی و ...) جابه‌جا شو تا وابستگی‌ها را بهتر تحلیل کنی.",
      applicationCategory: "DeveloperApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Code structure visualizer (JS & C#)",
      description:
        "Paste your JavaScript, TypeScript or C# code and explore its structure as an interactive graph directly in the browser.",
    },
    seo: {
      title: "Online Code Visualizer | Tools Manager",
      description:
        "Visualize code structure as graphs, inspect functions and dependencies, and understand your project architecture faster in the browser.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/code-visualizer",
      ogTitle: "Online code structure visualizer (JavaScript / C#)",
      ogDescription:
        "Paste your code into the Code Visualizer, see the generated graph, and switch between layouts to better analyze relationships and dependencies.",
      applicationCategory: "DeveloperApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type CodeVisualizerContent = typeof codeVisualizerContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useCodeVisualizerContent() {
  const { locale } = useLanguage();
  return codeVisualizerContent[locale];
}

// 🔥 Hook مخصوص page content
export function useCodeVisualizerPageContent() {
  const content = useCodeVisualizerContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getCodeVisualizerSeo(locale: "fa" | "en"): SeoContent {
  return codeVisualizerContent[locale].seo;
}
