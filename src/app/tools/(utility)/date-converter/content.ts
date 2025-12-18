// app/tools/(utility)/date-converter/content.ts

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

export const dateConverterContent = {
  fa: {
    page: {
      title: "تبدیل تاریخ شمسی و میلادی به یکدیگر",
      description:
        "تاریخ را بین تقویم شمسی و میلادی به‌صورت دقیق تبدیل کن، روز، ماه و سال را وارد کن و نتیجه را بلافاصله در مرورگر ببین.",
    },
    seo: {
      title: "ابزار تبدیل تاریخ شمسی و میلادی آنلاین | Tools Manager",
      description:
        "تاریخ‌ها را به‌سادگی بین تقویم شمسی و میلادی تبدیل کن و برای فرم‌ها، قراردادها، رزومه یا کارهای روزمره از آن استفاده کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/date-converter",
      ogTitle: "مبدل تحت‌وب تاریخ شمسی ↔ میلادی",
      ogDescription:
        "بدون نیاز به حفظ فرمول‌ها، تاریخ‌ها را بین شمسی و میلادی تبدیل کن و از نتیجه‌ی دقیق در کارهای اداری یا شخصی استفاده کن.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Convert dates between Gregorian and Jalali (Shamsi)",
      description:
        "Quickly convert dates between Gregorian and Jalali calendars by entering day, month and year directly in your browser.",
    },
    seo: {
      title: "Online Gregorian ↔ Jalali date converter | Tools Manager",
      description:
        "Easily switch dates between Gregorian and Jalali calendars and use the results in forms, documents or everyday tasks.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/date-converter",
      ogTitle: "Web-based Gregorian ↔ Jalali date converter",
      ogDescription:
        "Convert dates accurately between Shamsi (Jalali) and Gregorian calendars without memorizing any rules.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type DateConverterContent = typeof dateConverterContent.fa;

export function useDateConverterContent() {
  const { locale } = useLanguage();
  return dateConverterContent[locale];
}

export function useDateConverterPageContent() {
  const content = useDateConverterContent();
  return content.page;
}

export function getDateConverterSeo(locale: "fa" | "en"): SeoContent {
  return dateConverterContent[locale].seo;
}
