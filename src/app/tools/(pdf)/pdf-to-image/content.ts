// app/tools/(pdf)/pdf-to-image/content.ts

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

export const pdfToImageContent = {
  fa: {
    page: {
      title: "تبدیل PDF به تصویر (JPG، PNG، WebP)",
      description:
        "فایل PDF را انتخاب کن و هر صفحه را با کیفیت دلخواه به تصویر JPG، PNG یا WebP تبدیل و دانلود کن؛ همه چیز در مرورگر و بدون آپلود انجام می‌شود.",
    },
    seo: {
      title: "تبدیل PDF به عکس آنلاین (JPG/PNG/WebP) | Tools Manager",
      description:
        "صفحات PDF را به تصاویر JPG، PNG یا WebP تبدیل کن، کیفیت را تنظیم کن و تصاویر را تکی یا به‌صورت فایل ZIP دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/pdf-to-image",
      ogTitle: "مبدل آنلاین PDF به تصویر",
      ogDescription:
        "هر صفحه از PDF را با دقت بالا به تصویر تبدیل کن و بدون نصب نرم‌افزار خروجی بگیر.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Convert PDF to images (JPG, PNG, WebP)",
      description:
        "Pick a PDF file and convert each page to a JPG, PNG or WebP image at your chosen quality, then download it — all in your browser with no upload.",
    },
    seo: {
      title: "PDF to image converter online (JPG/PNG/WebP) | Tools Manager",
      description:
        "Convert PDF pages to JPG, PNG or WebP images, adjust the quality and download them individually or as a ZIP.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/pdf-to-image",
      ogTitle: "Online PDF to image converter",
      ogDescription:
        "Turn every PDF page into a high-resolution image and export without installing any software.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type PdfToImageContent = typeof pdfToImageContent.fa;

export function usePdfToImageContent() {
  const { locale } = useLanguage();
  return pdfToImageContent[locale];
}

export function usePdfToImagePageContent() {
  const content = usePdfToImageContent();
  return content.page;
}

export function getPdfToImageSeo(locale: "fa" | "en"): SeoContent {
  return pdfToImageContent[locale].seo;
}
