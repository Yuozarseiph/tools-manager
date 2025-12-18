// app/tools/(excel)/excel-chart/excel-chart.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const excelChartContent = {
  fa: {
    id: "excel-chart",
    category: "excel",
    title: "نمودار ساز فایل اکسل",
    description: "فایل Excel یا CSV خود را آپلود کنید و به‌سرعت انواع نمودارهای تعاملی بسازید.",
    features: [
      "پشتیبانی از Excel و CSV",
      "نمودار میله‌ای، خطی، مساحتی و دایره‌ای",
      "انتخاب ستون متنی برای محور افقی",
      "انتخاب یک یا چند ستون عددی برای نمودار",
      "تشخیص و تبدیل خودکار اعداد فارسی"
    ],
    ui: {
      upload: {
        buttonInitial: "انتخاب فایل Excel / CSV",
        buttonChange: "تغییر فایل داده",
        acceptHint: "فرمت‌های مجاز: .xlsx، .xls، .csv"
      },
      chartTypes: {
        bar: { label: "میله‌ای", title: "نمودار میله‌ای" },
        line: { label: "خطی", title: "نمودار خطی" },
        area: { label: "مساحتی", title: "نمودار مساحتی" },
        pie: { label: "دایره‌ای", title: "نمودار دایره‌ای" }
      },
      persianNumbers: {
        title: "تبدیل خودکار اعداد فارسی",
        description: "برخی از مقادیر عددی شما با ارقام فارسی نوشته شده بودند و به‌صورت خودکار به ارقام انگلیسی تبدیل شدند تا نمودارها به‌درستی رسم شوند."
      },
      mapping: {
        xAxisLabel: "ستون محور افقی (X)",
        numericLabelBar: "ستون‌های عددی برای نمودار میله‌ای",
        numericLabelArea: "ستون‌های عددی برای نمودار مساحتی",
        numericLabelSingle: "ستون عددی",
        numericPlaceholder: "ستون‌های عددی را انتخاب کنید"
      },
      settings: {
        title: "تنظیمات نمایش داده‌ها",
        rangeLabel: "بازه ردیف‌ها برای نمایش در نمودار",
        pieHint: "در نمودار دایره‌ای حداکثر ۲۰ ردیف پیشنهاد می‌شود.",
        rangeSummaryPrefix: "نمایش ",
        rangeSummaryMiddle: " ردیف از ",
        rangeSummarySuffix: " ردیف کل داده‌ها"
      },
      zoom: {
        compact: "فشرده",
        expanded: "گسترده",
        pieDisabled: "بزرگ‌نمایی برای نمودار دایره‌ای غیرفعال است."
      },
      empty: {
        title: "هنوز فایلی انتخاب نشده است",
        description: "یک فایل Excel یا CSV انتخاب کنید تا نمودار تعاملی آن را اینجا ببینید."
      },
      page: {
        title: "نمودار ساز فایل اکسل",
        description: "با چند کلیک، داده‌های موجود در فایل‌های Excel یا CSV را به نمودارهای زیبا تبدیل کنید."
      }
    }
  },
  en: {
    id: "excel-chart",
    category: "excel",
    title: "Excel chart builder",
    description: "Upload an Excel or CSV file and quickly build interactive charts.",
    features: [
      "Supports Excel and CSV files",
      "Bar, line, area and pie charts",
      "Choose a text column for the X axis",
      "Select one or more numeric columns as series",
      "Automatically normalizes Persian digits"
    ],
    ui: {
      upload: {
        buttonInitial: "Choose Excel / CSV file",
        buttonChange: "Change data file",
        acceptHint: "Supported formats: .xlsx, .xls, .csv"
      },
      chartTypes: {
        bar: { label: "Bar", title: "Bar chart" },
        line: { label: "Line", title: "Line chart" },
        area: { label: "Area", title: "Area chart" },
        pie: { label: "Pie", title: "Pie chart" }
      },
      persianNumbers: {
        title: "Persian digit normalization",
        description: "Some numeric values contained Persian digits and were automatically converted to English digits so charts can be rendered correctly."
      },
      mapping: {
        xAxisLabel: "X axis column",
        numericLabelBar: "Numeric columns for bar chart",
        numericLabelArea: "Numeric columns for area chart",
        numericLabelSingle: "Numeric column",
        numericPlaceholder: "Select numeric columns"
      },
      settings: {
        title: "Data display settings",
        rangeLabel: "Row range to show in chart",
        pieHint: "For pie charts, up to 20 rows is recommended.",
        rangeSummaryPrefix: "Showing ",
        rangeSummaryMiddle: " rows out of ",
        rangeSummarySuffix: " total rows"
      },
      zoom: {
        compact: "Compact",
        expanded: "Expanded",
        pieDisabled: "Zoom is disabled for pie charts."
      },
      empty: {
        title: "No file selected yet",
        description: "Select an Excel or CSV file to see its data as an interactive chart here."
      },
      page: {
        title: "Excel chart builder",
        description: "Turn data from Excel or CSV files into charts in just a few clicks."
      }
    }
  }
};

export type ExcelChartToolContent = typeof excelChartContent.fa;

export function useExcelChartContent() {
  const { locale } = useLanguage();
  return excelChartContent[locale];
}
