// app/tools/(system)/ip-checker/content.ts

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

export const ipCheckerContent = {
  fa: {
    page: {
      title: "نمایش IP عمومی، موقعیت تقریبی و اطلاعات شبکه",
      description:
        "آی‌پی عمومی خود را ببین، موقعیت جغرافیایی تقریبی، ISP و منطقه‌ی زمانی‌ات را بررسی کن؛ همه‌ی پردازش‌ها در مرورگر انجام می‌شود.",
    },
    seo: {
      title: "ابزار نمایش IP و اطلاعات شبکه آنلاین | Tools Manager",
      description:
        "آدرس IP عمومی، موقعیت تقریبی، سرویس‌دهنده اینترنت و منطقه زمانی خود را ببین و برای عیب‌یابی شبکه یا بررسی تنظیمات امنیتی استفاده کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/ip-checker",
      ogTitle: "نمایش‌دهنده تحت‌وب IP و اطلاعات اتصال",
      ogDescription:
        "به‌سرعت آی‌پی عمومی، شهر/کشور، ISP و سایر جزئیات شبکه را در مرورگر مشاهده کن و از وضعیت اتصال خود آگاه شو.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Show your public IP, approximate location and network info",
      description:
        "See your public IP address, approximate geolocation, ISP and timezone details directly in your browser.",
    },
    seo: {
      title: "Online IP and network info checker | Tools Manager",
      description:
        "Check your public IP address, approximate location, internet provider and timezone to debug networking issues or review security settings.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/ip-checker",
      ogTitle: "Web-based IP and connection info viewer",
      ogDescription:
        "Quickly inspect your public IP, city/country, ISP and other connection details in the browser.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type IPCheckerContent = typeof ipCheckerContent.fa;

export function useIPCheckerContent() {
  const { locale } = useLanguage();
  return ipCheckerContent[locale];
}

export function useIPCheckerPageContent() {
  const content = useIPCheckerContent();
  return content.page;
}

export function getIPCheckerSeo(locale: "fa" | "en"): SeoContent {
  return ipCheckerContent[locale].seo;
}
