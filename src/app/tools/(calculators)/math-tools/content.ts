import { useLanguage } from "@/context/LanguageContext";

export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
};

export const mathToolsContent = {
  fa: {
    page: {
      title: "ابزارهای ریاضی",
      description:
        "مجموعه کامل ابزارهای ریاضی شامل ماشین حساب، درصد، آمار، هندسه، معادلات و بسیاری امکانات دیگر.",
    },
    seo: {
      title: "ابزارهای ریاضی آنلاین رایگان | Tools Manager",
      description:
        "ماشین حساب، محاسبه درصد، آمار، هندسه، معادلات، فاکتوریل و بسیاری ابزار ریاضی دیگر.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/math-tools",
      ogTitle: "ابزارهای ریاضی آنلاین",
      ogDescription: "مجموعه کامل ابزارهای ریاضی رایگان و آنلاین.",
    } satisfies SeoContent,
  },
  en: {
    page: {
      title: "Math Tools",
      description:
        "Complete math tools including calculator, percentage, statistics, geometry, equations and more.",
    },
    seo: {
      title: "Free Online Math Tools | Tools Manager",
      description:
        "Calculator, percentage, statistics, geometry, equations, factorial and many more math tools.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/math-tools",
      ogTitle: "Online Math Tools",
      ogDescription: "Complete collection of free online math tools.",
    } satisfies SeoContent,
  },
};

export function useMathToolsContent() {
  const { locale } = useLanguage();
  return mathToolsContent[locale];
}

export function useMathToolsPageContent() {
  return useMathToolsContent().page;
}

export function getMathToolsSeo(locale: "fa" | "en"): SeoContent {
  return mathToolsContent[locale].seo;
}
