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

export const qrReaderPageContent = {
  fa: {
    page: {
      title: "QR Code Reader",
      description:
        "QR Code را از تصویر، اسکرین‌شات، کلیپ‌بورد یا دوربین بخوان؛ پردازش به‌صورت محلی در مرورگر انجام می‌شود.",
    },
    seo: {
      title: "QR Code Reader آنلاین | QodeForge",
      description:
        "خواندن QR Code از عکس، اسکرین‌شات یا دوربین با پردازش محلی در مرورگر، بدون آپلود فایل روی سرور.",
      canonical: "https://qodeforge.ir/tools/qr-reader",
      ogTitle: "QR Code Reader Online",
      ogDescription:
        "Read QR codes from images, screenshots, clipboard or camera.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },
  en: {
    page: {
      title: "QR Code Reader",
      description:
        "Read QR codes from images, screenshots, clipboard or your camera. Processing stays in your browser.",
    },
    seo: {
      title: "Online QR Code Reader | QodeForge",
      description:
        "Scan QR codes from images, screenshots, clipboard or camera directly in the browser without uploading files.",
      canonical: "https://qodeforge.ir/tools/qr-reader",
      ogTitle: "Online QR Code Reader",
      ogDescription:
        "Read QR codes from images, screenshots, clipboard or camera.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export function useQrReaderPageContent() {
  const { locale } = useLanguage();
  return qrReaderPageContent[locale].page;
}

export function getQrReaderSeo(locale: "fa" | "en"): SeoContent {
  return qrReaderPageContent[locale].seo;
}

