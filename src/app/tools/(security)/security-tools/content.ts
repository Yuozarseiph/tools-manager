// app/tools/(security)/security-tools/content.ts

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

export const securityToolsContent = {
  fa: {
    page: {
      title: "ابزارهای امنیتی و تبدیل",
      description:
        "اسکن QR Code، ساخت بارکد، رمزنگاری AES، یادداشت یکبارمصرف، تبدیل HTML به متن، متن به مورس، متن به باینری و متن به هگز - همه در یک مکان.",
    },
    seo: {
      title: "ابزارهای امنیتی و تبدیل آنلاین | Tools Manager",
      description:
        "اسکن کد QR، ساخت بارکد، رمزنگاری AES، یادداشت موقت، تبدیل HTML، کد مورس، باینری و هگزادسیمال به صورت رایگان.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/security-tools",
      ogTitle: "ابزارهای امنیتی و تبدیل (Security & Conversion Tools)",
      ogDescription:
        "ابزارهای قدرتمند برای اسکن QR، ساخت بارکد، رمزنگاری، تبدیل متن و کدها - همه رایگان و آنلاین.",
      applicationCategory: "SecurityApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Security & Conversion Tools",
      description:
        "QR Code scanner, barcode generator, AES encryption, one-time note, HTML to text, text to morse, text to binary and text to hex - all in one place.",
    },
    seo: {
      title: "Online Security & Conversion Tools | Tools Manager",
      description:
        "QR scanner, barcode generator, AES encryption, temporary note, HTML converter, morse code, binary and hexadecimal converters for free.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/security-tools",
      ogTitle: "Security & Conversion Tools",
      ogDescription:
        "Powerful tools for QR scanning, barcode generation, encryption, text conversion and encoding - all free and online.",
      applicationCategory: "SecurityApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type SecurityToolsContent = typeof securityToolsContent.fa;

export function useSecurityToolsContent() {
  const { locale } = useLanguage();
  return securityToolsContent[locale];
}

export function useSecurityToolsPageContent() {
  const content = useSecurityToolsContent();
  return content.page;
}

export function getSecurityToolsSeo(locale: "fa" | "en"): SeoContent {
  return securityToolsContent[locale].seo;
}
