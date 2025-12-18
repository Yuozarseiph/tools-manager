// app/tools/(pdf)/pdf-merge/content.ts

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

export const pdfMergeContent = {
  fa: {
    page: {
      title: "ادغام آنلاین چندین فایل PDF در یک فایل",
      description:
        "چند فایل PDF را آپلود کن، ترتیب آن‌ها را مشخص کن و یک فایل PDF یکپارچه و مرتب برای اشتراک‌گذاری، چاپ یا آرشیو بساز.",
      subtitle:
        "همه‌ی پردازش‌ها در مرورگر شما انجام می‌شود و نیازی به نصب نرم‌افزار یا آپلود روی سرور نیست.",
    },
    seo: {
      title: "ابزار ادغام PDF آنلاین | Tools Manager",
      description:
        "چند فایل PDF را به‌سادگی در یک فایل ترکیب کن، ترتیب صفحات را حفظ کن و خروجی نهایی را برای استفاده شخصی یا کاری دانلود کن.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/pdf-merge",
      ogTitle: "ادغام‌کننده تحت‌وب فایل‌های PDF",
      ogDescription:
        "بدون نصب نرم‌افزار سنگین، چندین PDF را در مرورگر ادغام کن و یک فایل نهایی منظم و آماده‌ی ارسال یا بایگانی بساز.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Merge multiple PDF files into one online",
      description:
        "Upload several PDF files, arrange their order and create a single combined PDF for sharing, printing or archiving.",
      subtitle:
        "All processing happens in your browser, with no software installation or server upload required.",
    },
    seo: {
      title: "PDF merge tool online | Tools Manager",
      description:
        "Easily combine multiple PDF files into one, keep page order intact and download the final document for personal or work use.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/pdf-merge",
      ogTitle: "Web-based PDF merger",
      ogDescription:
        "Merge multiple PDFs directly in your browser and generate a clean, ready-to-share document without heavy desktop tools.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type PdfMergeContent = typeof pdfMergeContent.fa;

export function usePdfMergeContent() {
  const { locale } = useLanguage();
  return pdfMergeContent[locale];
}

export function usePdfMergePageContent() {
  const content = usePdfMergeContent();
  return content.page;
}

export function getPdfMergeSeo(locale: "fa" | "en"): SeoContent {
  return pdfMergeContent[locale].seo;
}
