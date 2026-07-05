import { useLanguage } from "@/context/LanguageContext";

type Locale = {
  dropTitle: string;
  dropHint: string;
  selectFile: string;
  format: string;
  quality: string;
  scale: string;
  scaleHint: string;
  rendering: string;
  page: string;
  pages: string;
  downloadAll: string;
  download: string;
  reset: string;
  loading: string;
  error: string;
  passwordError: string;
};

const fa: Locale = {
  dropTitle: "فایل PDF را اینجا رها کن",
  dropHint: "یا برای انتخاب کلیک کن — پردازش کاملاً داخل مرورگر",
  selectFile: "انتخاب فایل PDF",
  format: "فرمت خروجی",
  quality: "کیفیت (فقط JPG/WebP)",
  scale: "دقت رندر",
  scaleHint: "مقدار بالاتر = تصویر باکیفیت‌تر و بزرگ‌تر",
  rendering: "در حال رندر صفحات...",
  page: "صفحه",
  pages: "صفحه",
  downloadAll: "دانلود همه",
  download: "دانلود",
  reset: "شروع دوباره",
  loading: "در حال بارگذاری PDF...",
  error: "خطا در پردازش فایل PDF",
  passwordError: "این فایل رمزگذاری شده و قابل باز شدن نیست",
};

const en: Locale = {
  dropTitle: "Drop your PDF file here",
  dropHint: "or click to choose — processed entirely in your browser",
  selectFile: "Select PDF file",
  format: "Output format",
  quality: "Quality (JPG/WebP only)",
  scale: "Render resolution",
  scaleHint: "Higher value = sharper, larger image",
  rendering: "Rendering pages...",
  page: "Page",
  pages: "pages",
  downloadAll: "Download all",
  download: "Download",
  reset: "Start over",
  loading: "Loading PDF...",
  error: "Failed to process the PDF file",
  passwordError: "This file is encrypted and cannot be opened",
};

export const pdfToImageToolContent = { fa, en };

export function usePdfToImageToolContent(): Locale {
  const { locale } = useLanguage();
  return pdfToImageToolContent[locale];
}
