// app/tools/(excel-tools)/excel-editor/content.ts

import { useLanguage } from "@/context/LanguageContext";

// 🔥 Type مشترک برای SEO
export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const excelEditorContent = {
  fa: {
    page: {
      title: "ویرایش آنلاین فایل‌های Excel و CSV",
      description:
        "فایل‌های Excel یا CSV را در مرورگر باز کن، ردیف‌ها را ویرایش و اضافه یا حذف کن و در نهایت خروجی به‌روز را دوباره به‌صورت Excel دانلود کن.",
    },
    seo: {
      title: "ویرایشگر Excel و CSV آنلاین | QodeForge",
      description:
        "جدول‌های Excel و CSV را مستقیماً در مرورگر ویرایش کن، ردیف‌ها را مدیریت کن و بدون نصب نرم‌افزار، نسخهٔ جدید فایل را ذخیره کن.",
      canonical: "https://qodeforge.ir/tools/excel-editor",
      ogTitle: "ویرایشگر تحت‌وب برای فایل‌های Excel و CSV",
      ogDescription:
        "فایل‌های جدولی را آپلود کن، داده‌ها را اصلاح کن و خروجی را برای استفاده در گزارش‌ها و سیستم‌های دیگر به‌سرعت دریافت کن.",
      applicationCategory: "BusinessApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online Excel & CSV editor",
      description:
        "Open Excel or CSV files in your browser, edit rows and cells, then download an updated Excel file without installing any software.",
    },
    seo: {
      title: "Excel and CSV editor online | QodeForge",
      description:
        "Edit Excel and CSV tables directly in the browser, manage rows and values, and save a fresh file for use in reports and systems.",
      canonical: "https://qodeforge.ir/tools/excel-editor",
      ogTitle: "Web-based editor for Excel and CSV files",
      ogDescription:
        "Upload tabular data, fix and adjust values, then export a clean Excel file ready for reporting or further processing.",
      applicationCategory: "BusinessApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ExcelEditorContent = typeof excelEditorContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useExcelEditorContent() {
  const { locale } = useLanguage();
  return excelEditorContent[locale];
}

// 🔥 Hook مخصوص page content
export function useExcelEditorPageContent() {
  const content = useExcelEditorContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getExcelEditorSeo(locale: "fa" | "en"): SeoContent {
  return excelEditorContent[locale].seo;
}

