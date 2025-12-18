// app/tools/(utility)/unit-converter/content.ts

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

export const unitConverterContent = {
  fa: {
    page: {
      title: "تبدیل آنلاین واحدها (طول، وزن، دما و بیشتر)",
      description:
        "میان واحدهای مختلف طول، وزن، دما و سایر دسته‌ها به‌صورت فوری و دقیق تبدیل انجام بده و مقدار معادل را بلافاصله ببین.",
    },
    seo: {
      title: "ابزار تبدیل واحد آنلاین | Tools Manager",
      description:
        "مقادیر را بین واحدهای متداول مانند متر و فوت، کیلوگرم و پوند، سانتی‌گراد و فارنهایت و سایر واحدها تبدیل کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/unit-converter",
      ogTitle: "مبدل تحت‌وب واحدهای مختلف (طول، وزن، دما و …)",
      ogDescription:
        "بدون ماشین‌حساب، به‌سرعت بین واحدهای رایج در مهندسی، زندگی روزمره و برنامه‌نویسی تبدیل انجام بده.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online unit converter (length, mass, temperature and more)",
      description:
        "Quickly convert between different units of length, mass, temperature and other categories with instant results.",
    },
    seo: {
      title: "Unit converter tool online | Tools Manager",
      description:
        "Convert values between common units like meters and feet, kilograms and pounds, Celsius and Fahrenheit and more.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/unit-converter",
      ogTitle: "Web-based unit converter for multiple categories",
      ogDescription:
        "Perform fast conversions between everyday and engineering units directly in your browser.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type UnitConverterContent = typeof unitConverterContent.fa;

export function useUnitConverterContent() {
  const { locale } = useLanguage();
  return unitConverterContent[locale];
}

export function useUnitConverterPageContent() {
  const content = useUnitConverterContent();
  return content.page;
}

export function getUnitConverterSeo(locale: "fa" | "en"): SeoContent {
  return unitConverterContent[locale].seo;
}
