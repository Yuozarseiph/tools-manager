// components/tools/pdf/word-to-pdf/word-to-pdf.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const wordToPdfContent = {
  fa: {
    id: "word-to-pdf",
    category: "developer",
    title: "تبدیل Word به PDF",
    description:
      "فایل‌های DOCX خود را به‌صورت امن در مرورگر به PDF تبدیل کنید، با پیش‌نمایش زندهٔ محتوا قبل از دانلود.",
    features: [
      "پشتیبانی از فایل‌های DOCX (Word جدید)",
      "پیش‌نمایش HTML از محتوای سند قبل از تبدیل",
      "رندر صفحه‌به‌صفحه برای کاهش خطای تبدیل",
      "دانلود مستقیم فایل PDF تولیدشده",
    ],
    ui: {
      upload: {
        title: "انتخاب فایل Word (DOCX)",
        subtitle: "فایل DOCX خود را انتخاب کنید تا محتوای آن به PDF تبدیل شود.",
      },
      file: {
        sizeUnit: "مگابایت",
        removeTitle: "حذف فایل انتخاب‌شده",
      },
      errors: {
        invalidType:
          "فقط فایل‌های DOCX پشتیبانی می‌شوند. لطفاً یک فایل Word جدید با پسوند .docx انتخاب کنید.",
        emptyContent:
          "محتوایی در فایل Word پیدا نشد. لطفاً فایل را بررسی کنید.",
        iframeAccess:
          "امکان آماده‌سازی محیط رندر برای پیش‌نمایش و تبدیل وجود ندارد.",
        genericPrefix: "در هنگام پردازش فایل خطایی رخ داد:",
        unknown: "خطای ناشناخته در فرآیند تبدیل.",
      },
      progress: {
        idle: "",
        reading: "در حال خواندن فایل Word...",
        converting: "در حال تبدیل فایل Word به HTML...",
        rendering: "در حال آماده‌سازی پیش‌نمایش برای تبدیل...",
        generating: "در حال تولید صفحات PDF...",
        success: "فایل PDF با موفقیت تولید شد.",
      },
      buttons: {
        convertIdle: "تبدیل به PDF",
        convertLoading: "در حال تبدیل به PDF...",
        manualDownload: "دانلود فایل PDF",
        convertAgain: "تبدیل مجدد با تنظیمات فعلی",
      },
      preview: {
        title: "پیش‌نمایش محتوای Word",
        liveLabel: "پیش‌نمایش زنده",
        empty:
          "پس از انتخاب فایل Word، پیش‌نمایش آن در این بخش نمایش داده می‌شود.",
      },
      guide: {
        title: "نکات استفاده از تبدیل Word به PDF",
        items: [
          "فقط از فایل‌های با فرمت DOCX (نسخه‌های جدید Word) استفاده کنید.",
          "در صورت داشتن جداول و تصاویر پیچیده، پیش‌نمایش را با دقت بررسی کنید.",
          "اگر خروجی PDF به‌هم‌ریخته بود، فونت‌های استفاده‌شده در سند را ساده‌تر انتخاب کنید.",
          "برای فایل‌های بزرگ، فرآیند تبدیل ممکن است چند ثانیه طول بکشد.",
        ],
      },
      page: {
        title: "تبدیل Word به PDF",
        description:
          "سند Word خود را مستقیماً در مرورگر به PDF تبدیل کنید و قبل از دانلود، پیش‌نمایش آن را ببینید.",
      },
    },
  },
  en: {
    id: "word-to-pdf",
    category: "developer",
    title: "Word to PDF converter",
    description:
      "Securely convert your DOCX files to PDF in the browser, with a live HTML preview before downloading.",
    features: [
      "Supports DOCX (modern Word) files",
      "HTML preview of the document content before conversion",
      "Chunk‑based rendering to improve PDF output stability",
      "Download the generated PDF directly in your browser",
    ],
    ui: {
      upload: {
        title: "Select Word file (DOCX)",
        subtitle: "Choose a DOCX file that you want to convert to PDF.",
      },
      file: {
        sizeUnit: "MB",
        removeTitle: "Remove selected file",
      },
      errors: {
        invalidType:
          "Only DOCX files are supported. Please select a modern Word document with .docx extension.",
        emptyContent:
          "No readable content was found in the Word file. Please check the document.",
        iframeAccess:
          "Unable to prepare the rendering environment for preview and conversion.",
        genericPrefix: "An error occurred while processing the file:",
        unknown: "Unknown error during conversion.",
      },
      progress: {
        idle: "",
        reading: "Reading the Word file...",
        converting: "Converting Word document to HTML...",
        rendering: "Preparing preview for conversion...",
        generating: "Generating PDF pages...",
        success: "PDF file generated successfully.",
      },
      buttons: {
        convertIdle: "Convert to PDF",
        convertLoading: "Converting to PDF...",
        manualDownload: "Download PDF file",
        convertAgain: "Convert again with current settings",
      },
      preview: {
        title: "Word document preview",
        liveLabel: "Live preview",
        empty: "After selecting a Word file, its preview will appear here.",
      },
      guide: {
        title: "Tips for using the Word to PDF converter",
        items: [
          "Make sure you are using DOCX files (modern Word format).",
          "If your document has complex tables or images, carefully check the preview.",
          "If the PDF looks misaligned, try using simpler fonts in the original document.",
          "For large files, the conversion process may take several seconds.",
        ],
      },
      page: {
        title: "Word to PDF converter",
        description:
          "Convert your Word documents to PDF directly in the browser, with a built‑in live preview.",
      },
    },
  },
};

export type WordToPdfToolContent = typeof wordToPdfContent.fa;

export function useWordToPdfContent() {
  const { locale } = useLanguage();
  return wordToPdfContent[locale];
}
