// app/tools/(excel-tools)/excel-viewer/content.ts

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

export const excelViewerContent = {
  fa: {
    page: {
      title: "نمایش آنلاین فایل‌های Excel و CSV",
      description:
        "فایل‌های Excel یا CSV را در مرورگر باز کن، بین شیت‌ها جابه‌جا شو، جستجو انجام بده و بدون نیاز به نصب آفیس، داده‌ها را ببین.",
    },
    seo: {
      title: "نمایشگر Excel و CSV آنلاین | Tools Manager",
      description:
        "فایل‌های Excel و CSV را مستقیماً در مرورگر نمایش بده، شیت‌ها و سطرها را ببین و برای بررسی سریع داده‌ها دیگر به نرم‌افزار دسکتاپ وابسته نباش.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/excel-viewer",
      ogTitle: "نمایشگر تحت‌وب برای فایل‌های Excel و CSV",
      ogDescription:
        "فایل جدولی را آپلود کن، شیت‌های مختلف را بررسی کن، روی داده‌ها جستجو کن و اگر خواستی آن‌ها را به CSV یا JSON تبدیل کن.",
      applicationCategory: "BusinessApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
    why: {
      title: "چرا از نمایشگر آنلاین Excel استفاده کنیم؟",
      reasons: [
        "نیازی به نصب Excel یا مجموعه‌ی آفیس روی سیستم نیست.",
        "فایل‌ها فقط روی مرورگر شما پردازش می‌شوند و جایی آپلود نمی‌شوند.",
        "برای بررسی سریع داده‌ها، گزارش‌ها و خروجی سیستم‌ها بسیار مناسب است.",
        "می‌توانید روی داده‌ها جستجو کنید و بین شیت‌های مختلف به‌سرعت جابه‌جا شوید.",
      ],
    },
  },

  en: {
    page: {
      title: "Online Excel & CSV viewer",
      description:
        "Open Excel or CSV files in your browser, switch between sheets, search data and inspect tables without installing Office.",
    },
    seo: {
      title: "Excel and CSV viewer online | Tools Manager",
      description:
        "Display Excel and CSV files directly in the browser, browse sheets and rows, and review data quickly without desktop software.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/excel-viewer",
      ogTitle: "Web-based viewer for Excel and CSV files",
      ogDescription:
        "Upload tabular files, inspect different sheets, search within the data and optionally export content as CSV or JSON.",
      applicationCategory: "BusinessApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
    why: {
      title: "Why use an online Excel viewer?",
      reasons: [
        "No need to install Excel or Office on your device.",
        "Files are processed in your browser and are not uploaded to a server.",
        "Great for quickly reviewing reports, exports and system outputs.",
        "You can search through data and switch between sheets effortlessly.",
      ],
    },
  },
};

export type ExcelViewerContent = typeof excelViewerContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useExcelViewerContent() {
  const { locale } = useLanguage();
  return excelViewerContent[locale];
}

// 🔥 Hook مخصوص page content
export function useExcelViewerPageContent() {
  const content = useExcelViewerContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getExcelViewerSeo(locale: "fa" | "en"): SeoContent {
  return excelViewerContent[locale].seo;
}
