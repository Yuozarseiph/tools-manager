// app/tools/(excel-tools)/excel-chart/content.ts

import { useLanguage } from "@/context/LanguageContext";

//  Type مشترک برای SEO
export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const excelChartContent = {
  fa: {
    page: {
      title: "ساخت نمودار از فایل Excel و CSV",
      description:
        "فایل Excel یا CSV را در مرورگر آپلود کن، ستون‌های داده را انتخاب کن و انواع نمودارها (میله‌ای، خطی، دایره‌ای و ناحیه‌ای) را بدون نصب نرم‌افزار بساز.",
    },
    seo: {
      title: "ابزار ساخت نمودار از Excel | QodeForge",
      description:
        "با آپلود فایل‌های Excel یا CSV، به‌سرعت نمودارهای تعاملی بساز، محدودهٔ داده را تنظیم کن و برای گزارش‌ها و پرزنتیشن‌ها خروجی بگیر.",
      canonical: "https://qodeforge.ir/tools/excel-chart",
      ogTitle: "نمودارساز آنلاین از فایل‌های Excel و CSV",
      ogDescription:
        "داده‌های جدولی را از Excel یا CSV بارگذاری کن، نوع نمودار را انتخاب کن و نتیجه را برای استفاده در اسلایدها یا داشبوردها آماده کن.",
      applicationCategory: "BusinessApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Create charts from Excel and CSV",
      description:
        "Upload Excel or CSV files in your browser, map data columns and generate bar, line, pie and area charts without installing any software.",
    },
    seo: {
      title: "Excel to chart online tool | QodeForge",
      description:
        "Quickly turn Excel or CSV data into interactive charts, configure ranges and use the output in reports and presentations.",
      canonical: "https://qodeforge.ir/tools/excel-chart",
      ogTitle: "Online chart builder for Excel and CSV data",
      ogDescription:
        "Load tabular data from Excel or CSV, pick a chart type and prepare clean visualizations for slides, dashboards or documents.",
      applicationCategory: "BusinessApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ExcelChartContent = typeof excelChartContent.fa;

//  Hook برای استفاده در کامپوننت Client
export function useExcelChartContent() {
  const { locale } = useLanguage();
  return excelChartContent[locale];
}

//  Hook مخصوص page content
export function useExcelChartPageContent() {
  const content = useExcelChartContent();
  return content.page;
}

//  تابع برای دریافت SEO (برای page.tsx)
export function getExcelChartSeo(locale: "fa" | "en"): SeoContent {
  return excelChartContent[locale].seo;
}

