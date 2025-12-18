// app/tools/(excel)/excel-viewer/excel-viewer.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const excelViewerContent = {
  fa: {
    id: "excel-viewer",
    category: "excel",
    title: "نمایش‌گر هوشمند اکسل",
    description: "فایل‌های Excel یا CSV را در مرورگر خود ببینید، جستجو کنید و به JSON یا CSV تبدیل کنید.",
    features: [
      "نمایش داده‌های Excel و CSV در جدول ریسپانسیو",
      "پشتیبانی از چند شیت و جابه‌جایی بین آن‌ها",
      "جستجوی سریع در تمام ستون‌ها",
      "تغییر سطح زوم جدول",
      "خروجی گرفتن از داده‌های فعلی به صورت JSON یا CSV",
      "حالت تمام‌صفحه برای کار روی داده‌های بزرگ"
    ],
    ui: {
      upload: {
        buttonInitial: "انتخاب فایل Excel / CSV",
        acceptHint: "فرمت‌های مجاز: .xlsx، .xls، .csv"
      },
      toolbar: {
        zoomOutTitle: "کوچک‌نمایی جدول",
        zoomInTitle: "بزرگ‌نمایی جدول",
        fullscreenTitle: "تغییر حالت تمام‌صفحه",
        csvTitle: "دانلود داده‌ها به صورت CSV",
        jsonTitle: "دانلود داده‌ها به صورت JSON",
        closeTitle: "بستن فایل و پاک‌کردن داده‌ها"
      },
      search: {
        placeholder: "جستجو در تمام ستون‌ها..."
      },
      sheets: {
        iconLabel: "لیست شیت‌های فایل اکسل"
      },
      summary: {
        totalPrefix: "تعداد کل ردیف‌ها: ",
        visiblePrefix: "تعداد ردیف‌های قابل مشاهده: "
      },
      empty: {
        title: "هیچ فایلی برای نمایش انتخاب نشده است",
        description: "برای شروع، یک فایل Excel یا CSV انتخاب کنید تا داده‌های آن را در جدول زیر ببینید و فیلتر کنید."
      },
      page: {
        title: "نمایش‌گر هوشمند اکسل",
        description: "با این ابزار می‌توانید فایل‌های Excel یا CSV را بدون نصب نرم‌افزار و تنها در مرورگر خود مشاهده و جستجو کنید."
      },
      seo: {
        whyTitle: "چرا از نمایش‌گر اکسل آنلاین استفاده کنیم؟",
        reasons: [
          "عدم نیاز به نصب Microsoft Excel یا نرم‌افزارهای مشابه",
          "امکان مشاهده سریع فایل‌های پیوست شده در هر دستگاه",
          "جستجو و فیلتر کردن داده‌ها بدون تغییر فایل اصلی",
          "خروجی گرفتن از زیرمجموعهٔ داده‌ها به صورت JSON یا CSV"
        ]
      }
    }
  },
  en: {
    id: "excel-viewer",
    category: "excel",
    title: "Smart Excel viewer",
    description: "View Excel or CSV files in your browser, search within them and export filtered rows as JSON or CSV.",
    features: [
      "Display Excel and CSV data in a responsive table",
      "Support for multiple sheets with easy switching",
      "Full‑table search across all columns",
      "Adjustable table zoom level",
      "Export currently visible rows as JSON or CSV",
      "Fullscreen mode for large datasets"
    ],
    ui: {
      upload: {
        buttonInitial: "Choose Excel / CSV file",
        acceptHint: "Supported formats: .xlsx, .xls, .csv"
      },
      toolbar: {
        zoomOutTitle: "Zoom out table",
        zoomInTitle: "Zoom in table",
        fullscreenTitle: "Toggle fullscreen mode",
        csvTitle: "Download data as CSV",
        jsonTitle: "Download data as JSON",
        closeTitle: "Close file and clear data"
      },
      search: {
        placeholder: "Search across all columns..."
      },
      sheets: {
        iconLabel: "List of workbook sheets"
      },
      summary: {
        totalPrefix: "Total rows: ",
        visiblePrefix: "Visible rows: "
      },
      empty: {
        title: "No file selected",
        description: "Upload an Excel or CSV file to preview its data in the table below and search within it."
      },
      page: {
        title: "Smart Excel viewer",
        description: "Preview Excel or CSV files right in your browser, with search and export options."
      },
      seo: {
        whyTitle: "Why use an online Excel viewer?",
        reasons: [
          "No need to install Microsoft Excel or similar software",
          "Quickly preview shared Excel attachments on any device",
          "Search and filter data without changing the original file",
          "Export subsets of the data as JSON or CSV"
        ]
      }
    }
  }
};

export type ExcelViewerToolContent = typeof excelViewerContent.fa;

export function useExcelViewerContent() {
  const { locale } = useLanguage();
  return excelViewerContent[locale];
}
