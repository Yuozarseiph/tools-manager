// app/tools/(utility)/qr-generator/content.ts

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

export const qrGeneratorContent = {
  fa: {
    page: {
      title: "ساخت آنلاین QR Code برای لینک، متن و شماره تماس",
      description:
        "برای آدرس سایت، متن، شماره تلفن یا هر داده‌ی دلخواه یک QR Code قابل اسکن بساز و آن را به‌صورت تصویر باکیفیت دانلود کن.",
    },
    seo: {
      title: "ابزار ساخت QR Code آنلاین | Tools Manager",
      description:
        "برای لینک سایت، شبکه‌های اجتماعی، Wi‑Fi یا متن ساده یک QR Code خوانا بساز، رنگ و اندازه آن را تنظیم کن و خروجی PNG دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/qr-generator",
      ogTitle: "ساخت QR Code تحت‌وب برای انواع داده",
      ogDescription:
        "بدون نصب برنامه، کد QR بساز و در کارت ویزیت، پوستر، سایت یا شبکه‌های اجتماعی استفاده کن.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Generate QR codes online for links, text and contacts",
      description:
        "Create scannable QR codes for URLs, plain text, phone numbers or other data and download them as high‑quality images.",
    },
    seo: {
      title: "Online QR code generator | Tools Manager",
      description:
        "Build readable QR codes for websites, social profiles, Wi‑Fi or plain text, customize colors and size and download as PNG.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/qr-generator",
      ogTitle: "Web-based QR code generator for any data",
      ogDescription:
        "Create QR codes without installing apps and use them on business cards, posters, websites or social media.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type QrGeneratorContent = typeof qrGeneratorContent.fa;

export function useQrGeneratorContent() {
  const { locale } = useLanguage();
  return qrGeneratorContent[locale];
}

export function useQrGeneratorPageContent() {
  const content = useQrGeneratorContent();
  return content.page;
}

export function getQrGeneratorSeo(locale: "fa" | "en"): SeoContent {
  return qrGeneratorContent[locale].seo;
}
