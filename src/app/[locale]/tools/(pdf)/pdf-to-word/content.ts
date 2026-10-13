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

export const pdfToWordContent = {
  fa: {
    page: {
      title: "تبدیل آنلاین PDF به Word در مرورگر",
      description:
        "فایل PDF را بدون آپلود به سرور به DOCX تبدیل کنید؛ با حالت متن قابل‌ویرایش یا حفظ حداکثری چیدمان صفحات.",
    },
    seo: {
      title: "تبدیل PDF به Word آنلاین | QodeForge",
      description:
        "PDF را به فایل Word (DOCX) قابل دانلود تبدیل کنید. پردازش کاملاً داخل مرورگر انجام می‌شود و از متن فارسی، انگلیسی، RTL و انتخاب صفحات پشتیبانی می‌کند.",
      canonical: "https://qodeforge.ir/tools/pdf-to-word",
      ogTitle: "مبدل PDF به Word تحت وب",
      ogDescription:
        "تبدیل PDF به DOCX بدون آپلود فایل؛ با حالت قابل‌ویرایش و حالت حفظ چیدمان.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },
  en: {
    page: {
      title: "Convert PDF to Word directly in your browser",
      description:
        "Turn PDF files into DOCX without uploading them, using editable-text or layout-preserving conversion modes.",
    },
    seo: {
      title: "PDF to Word converter online | QodeForge",
      description:
        "Convert PDF files to downloadable Word (DOCX) documents locally in your browser, with Persian/English, RTL and page-range support.",
      canonical: "https://qodeforge.ir/tools/pdf-to-word",
      ogTitle: "In-browser PDF to Word converter",
      ogDescription:
        "Convert PDF to DOCX without uploading your file, using editable or layout-preserving modes.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type PdfToWordContent = typeof pdfToWordContent.fa;

export function usePdfToWordContent() {
  const { locale } = useLanguage();
  return pdfToWordContent[locale];
}

export function usePdfToWordPageContent() {
  return usePdfToWordContent().page;
}

export function getPdfToWordSeo(locale: "fa" | "en"): SeoContent {
  return pdfToWordContent[locale].seo;
}

