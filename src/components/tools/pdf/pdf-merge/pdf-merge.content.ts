// components/tools/pdf/pdf-merge/pdf-merge.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const pdfMergeContent = {
  fa: {
    id: "pdf-merge",
    category: "pdf",
    title: "ادغام‌کننده فایل‌های PDF",
    description:
      "چند فایل PDF را انتخاب کنید و آن‌ها را در یک فایل واحد پشت‌سرهم ادغام و دانلود کنید.",
    features: [
      "آپلود و ادغام چندین فایل PDF",
      "نمایش نام و حجم هر فایل انتخاب‌شده",
      "حذف فایل‌های اضافه قبل از ادغام",
      "دانلود سریع فایل PDF نهایی",
    ],
    ui: {
      dropzone: {
        title: "فایل‌های PDF خود را اینجا رها کنید یا کلیک کنید",
        subtitle: "برای ادغام، حداقل دو فایل PDF انتخاب کنید.",
      },
      list: {
        title: "فهرست فایل‌های انتخاب‌شده",
        countSuffix: "فایل",
        clearAll: "حذف همه فایل‌ها",
        sizeUnit: "MB",
      },
      buttons: {
        mergeAndDownload: "ادغام و دانلود PDF",
        processing: "در حال ادغام فایل‌ها...",
      },
      alerts: {
        error:
          "در هنگام ادغام فایل‌های PDF مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
      },
      page: {
        title: "ادغام‌کننده PDF",
        description:
          "چند فایل PDF را در یک فایل واحد ترکیب کنید و خروجی را دانلود کنید.",
        subtitle: "ادغام سریع PDF‌ها در مرورگر شما",
      },
    },
  },
  en: {
    id: "pdf-merge",
    category: "pdf", // or 'pdf'
    title: "PDF merger",
    description:
      "Select multiple PDF files, merge them into a single document and download the result.",
    features: [
      "Upload and merge multiple PDF files",
      "See name and size of each selected file",
      "Remove unwanted files before merging",
      "Quickly download the merged PDF",
    ],
    ui: {
      dropzone: {
        title: "Drop your PDF files here or click to upload",
        subtitle: "Select at least two PDF files to merge them.",
      },
      list: {
        title: "Selected PDF files",
        countSuffix: "files",
        clearAll: "Clear all files",
        sizeUnit: "MB",
      },
      buttons: {
        mergeAndDownload: "Merge & download PDF",
        processing: "Merging PDF files...",
      },
      alerts: {
        error:
          "Something went wrong while merging PDF files. Please try again.",
      },
      page: {
        title: "PDF merger",
        description:
          "Combine multiple PDF files into a single document and download it.",
        subtitle: "Fast PDF merging directly in your browser",
      },
    },
  },
};

export type PdfMergeToolContent = typeof pdfMergeContent.fa;

export function usePdfMergeContent() {
  const { locale } = useLanguage();
  return pdfMergeContent[locale];
}
