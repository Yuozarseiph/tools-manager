// app/tools/(pdf)/pdf-editor/content.ts

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

export const pdfEditorContent = {
  fa: {
    page: {
      title: "ویرایش صفحات PDF در مرورگر",
      description:
        "فایل PDF را باز کن، صفحات دلخواه را حذف یا نگه‌داری کن و نسخه‌ی جدید را بدون آپلود روی سرور دانلود کن.",
    },
    seo: {
      title: "ابزار ویرایش صفحات PDF آنلاین | Tools Manager",
      description:
        "صفحات اضافه‌ی PDF را حذف کن، فقط صفحات موردنیازت را نگه‌دار و نسخه‌ی جدید را در همان مرورگر بساز؛ سریع، امن و بدون آپلود فایل.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/pdf-editor",
      ogTitle: "ویرایشگر صفحات PDF در مرورگر",
      ogDescription:
        "PDF را باز کن، صفحاتش را ببین، حذف کن یا نگه‌دار و یک فایل مرتب جدید تحویل بگیر.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Edit PDF pages in your browser",
      description:
        "Open a PDF, preview all pages, remove or keep selected pages, and download a clean new file without uploading it to a server.",
    },
    seo: {
      title: "Online PDF page editor | Tools Manager",
      description:
        "Remove unwanted pages from a PDF or keep only the ones you need and generate a new document, fully client‑side and private.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/pdf-editor",
      ogTitle: "In‑browser PDF page editor",
      ogDescription:
        "View, select and edit PDF pages directly in your browser, then download the updated file instantly.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type PdfEditorContent = typeof pdfEditorContent.fa;

export function usePdfEditorContent() {
  const { locale } = useLanguage();
  return pdfEditorContent[locale];
}

export function usePdfEditorPageContent() {
  const content = usePdfEditorContent();
  return content.page;
}

export function getPdfEditorSeo(locale: "fa" | "en"): SeoContent {
  return pdfEditorContent[locale].seo;
}
