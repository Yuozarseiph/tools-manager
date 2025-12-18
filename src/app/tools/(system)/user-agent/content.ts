// app/tools/(system)/user-agent/content.ts

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

export const userAgentContent = {
  fa: {
    page: {
      title: "نمایش User Agent، مرورگر، سیستم‌عامل و مشخصات دستگاه",
      description:
        "اطلاعات کامل User Agent، مرورگر، سیستم‌عامل، نوع دستگاه و وضعیت اتصال خود را در مرورگر ببین و برای دیباگ یا تست ریسپانسیو از آن استفاده کن.",
    },
    seo: {
      title: "ابزار نمایش User Agent و اطلاعات دستگاه آنلاین | Tools Manager",
      description:
        "رشته‌ی User Agent، مرورگر، سیستم‌عامل، رزولوشن صفحه، پشتیبانی کوکی و وضعیت آنلاین بودن خود را بررسی کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/user-agent",
      ogTitle: "نمایش‌دهنده تحت‌وب User Agent و مشخصات سیستم",
      ogDescription:
        "برای اشکال‌زدایی، گزارش باگ یا تنظیمات سازگاری، اطلاعات کامل مرورگر و دستگاه خود را به‌صورت ساختاریافته مشاهده کن.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "View your User Agent, browser, OS and device details",
      description:
        "Inspect your full User Agent string, browser, operating system, device type and connection status directly in your browser.",
    },
    seo: {
      title: "Online User Agent & device info viewer | Tools Manager",
      description:
        "Check your User Agent string, browser, OS, screen size, cookie support and online status for debugging or compatibility reports.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/user-agent",
      ogTitle: "Web-based User Agent and system info viewer",
      ogDescription:
        "Quickly see structured information about your browser and device to help with debugging, bug reports or responsive testing.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type UserAgentContent = typeof userAgentContent.fa;

export function useUserAgentContent() {
  const { locale } = useLanguage();
  return userAgentContent[locale];
}

export function useUserAgentPageContent() {
  const content = useUserAgentContent();
  return content.page;
}

export function getUserAgentSeo(locale: "fa" | "en"): SeoContent {
  return userAgentContent[locale].seo;
}
