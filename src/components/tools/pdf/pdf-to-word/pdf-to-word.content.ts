import { useLanguage } from "@/context/LanguageContext";

export const pdfToWordContent = {
  fa: {
    id: "pdf-to-word",
    category: "pdf",
    title: "تبدیل PDF به Word",
    description:
      "PDF را به DOCX تبدیل کنید؛ کاملاً داخل مرورگر و بدون آپلود فایل به سرور.",
    mode: {
      editable: "متن قابل‌ویرایش",
      editableHint:
        "متن PDF استخراج و به پاراگراف‌های Word تبدیل می‌شود. تصاویر نیز در صورت فعال بودن منتقل می‌شوند.",
      layout: "حفظ چیدمان",
      layoutHint:
        "هر صفحه با کیفیت بالا داخل Word قرار می‌گیرد؛ ظاهر دقیق‌تر است اما متن داخل صفحه قابل‌ویرایش نیست.",
    },
    controls: {
      pageRange: "محدوده صفحات",
      pageRangePlaceholder: "مثلاً 1-3,5 یا خالی برای همه",
      pageRangeHint: "اعداد فارسی و انگلیسی پشتیبانی می‌شوند.",
      includeImages: "انتقال تصاویر",
      includeImagesHint:
        "تصاویر داخلی PDF را در خروجی قابل‌ویرایش نیز اضافه می‌کند.",
      quality: "سطح کیفیت خروجی",
      qualityFast: "سریع",
      qualityBalanced: "متعادل",
      qualityHigh: "کیفیت بالا",
      qualityFastHint:
        "سرعت بیشتر و فایل سبک‌تر؛ مناسب PDFهای طولانی یا دستگاه‌های ضعیف‌تر.",
      qualityBalancedHint:
        "تعادل بین سرعت، حجم فایل و وضوح تصاویر؛ گزینه پیشنهادی برای اکثر فایل‌ها.",
      qualityHighHint:
        "وضوح بیشتر برای صفحات و تصاویر؛ پردازش کندتر و فایل Word بزرگ‌تر می‌شود.",
    },
    upload: {
      title: "فایل PDF را اینجا رها کنید",
      hint: "یا برای انتخاب فایل کلیک کنید",
      select: "انتخاب PDF",
    },
    file: {
      pages: "صفحه",
      size: "حجم",
      remove: "حذف فایل",
      ready: "فایل آماده تبدیل است",
      inspecting: "در حال بررسی فایل...",
    },
    progress: {
      loading: "در حال بارگذاری PDF...",
      analyzing: "در حال استخراج و تحلیل متن...",
      images: "در حال استخراج تصاویر...",
      rendering: "در حال رندر صفحات...",
      building: "در حال ساخت فایل Word...",
      done: "تبدیل کامل شد.",
    },
    buttons: {
      convert: "تبدیل به Word",
      converting: "در حال تبدیل...",
      cancel: "لغو",
      download: "دانلود فایل Word",
      convertAgain: "تبدیل مجدد",
      reset: "فایل جدید",
    },
    result: {
      title: "فایل Word آماده است",
      convertedPages: "صفحات تبدیل‌شده",
      textCharacters: "کاراکتر متنی",
      images: "تصویر منتقل‌شده",
      fallbackPages: "صفحه تصویری",
      fallbackHint:
        "صفحات بدون Text Layer به‌صورت تصویر وارد Word شده‌اند؛ برای ویرایش متن این صفحات OCR لازم است.",
      layoutHint:
        "خروجی حالت حفظ چیدمان عمداً تصویری است تا ظاهر PDF تا حد ممکن حفظ شود.",
    },
    errors: {
      invalidType: "لطفاً فقط فایل PDF انتخاب کنید.",
      invalidRange: "محدوده صفحات معتبر نیست.",
      password: "این PDF رمزگذاری شده است و بدون رمز قابل پردازش نیست.",
      aborted: "فرآیند تبدیل لغو شد.",
      generic: "تبدیل PDF به Word با خطا مواجه شد.",
    },
    privacy: "پردازش فایل کاملاً محلی است و PDF شما آپلود نمی‌شود.",
    guide: {
      title: "کدام حالت مناسب‌تر است؟",
      items: [
        "برای PDFهای متنی و ویرایش محتوا، حالت «متن قابل‌ویرایش» را انتخاب کنید.",
        "برای فرم‌ها، طراحی‌های پیچیده و فایل‌هایی که ظاهر مهم‌تر است، حالت «حفظ چیدمان» مناسب‌تر است.",
        "PDF اسکن‌شده Text Layer ندارد؛ در حالت قابل‌ویرایش، چنین صفحاتی به‌صورت تصویر fallback می‌شوند.",
        "جدول‌ها و ستون‌بندی پیچیده PDF همیشه به‌صورت کاملاً مشابه در Word قابل بازسازی نیستند.",
      ],
    },
  },
  en: {
    id: "pdf-to-word",
    category: "pdf",
    title: "PDF to Word converter",
    description:
      "Convert PDF files to DOCX entirely in your browser without uploading them to a server.",
    mode: {
      editable: "Editable text",
      editableHint:
        "Extract PDF text into editable Word paragraphs and optionally include embedded images.",
      layout: "Preserve layout",
      layoutHint:
        "Place each page as a high-quality image in Word. Layout is more faithful, but page text is not editable.",
    },
    controls: {
      pageRange: "Page range",
      pageRangePlaceholder: "e.g. 1-3,5 or leave empty for all",
      pageRangeHint: "Persian and Latin digits are supported.",
      includeImages: "Include images",
      includeImagesHint:
        "Also adds embedded PDF images to editable-text output.",
      quality: "Output quality",
      qualityFast: "Fast",
      qualityBalanced: "Balanced",
      qualityHigh: "High quality",
      qualityFastHint:
        "Faster processing and a smaller file; ideal for long PDFs or lower-powered devices.",
      qualityBalancedHint:
        "Balances speed, file size and image clarity; recommended for most documents.",
      qualityHighHint:
        "Higher page and image clarity; conversion takes longer and the Word file is larger.",
    },
    upload: {
      title: "Drop a PDF file here",
      hint: "or click to choose a file",
      select: "Select PDF",
    },
    file: {
      pages: "pages",
      size: "Size",
      remove: "Remove file",
      ready: "File is ready to convert",
      inspecting: "Inspecting PDF...",
    },
    progress: {
      loading: "Loading PDF...",
      analyzing: "Extracting and analyzing text...",
      images: "Extracting images...",
      rendering: "Rendering PDF pages...",
      building: "Building Word document...",
      done: "Conversion complete.",
    },
    buttons: {
      convert: "Convert to Word",
      converting: "Converting...",
      cancel: "Cancel",
      download: "Download Word file",
      convertAgain: "Convert again",
      reset: "New file",
    },
    result: {
      title: "Your Word file is ready",
      convertedPages: "Converted pages",
      textCharacters: "Text characters",
      images: "Embedded images",
      fallbackPages: "Image-only pages",
      fallbackHint:
        "Pages without a text layer were inserted as images. OCR is required to make their text editable.",
      layoutHint:
        "Preserve-layout output intentionally uses page images to keep the PDF appearance as close as possible.",
    },
    errors: {
      invalidType: "Please select a PDF file only.",
      invalidRange: "The selected page range is invalid.",
      password:
        "This PDF is password-protected and cannot be processed without its password.",
      aborted: "Conversion was cancelled.",
      generic: "PDF to Word conversion failed.",
    },
    privacy:
      "All processing happens locally in your browser. Your PDF is not uploaded.",
    guide: {
      title: "Which mode should you use?",
      items: [
        "Use Editable text for normal text PDFs when you need to edit the content in Word.",
        "Use Preserve layout for forms, complex designs and documents where visual fidelity matters more.",
        "Scanned PDFs have no text layer; in Editable mode those pages fall back to images.",
        "Complex tables and multi-column layouts cannot always be reconstructed perfectly as editable Word content.",
      ],
    },
  },
} as const;

export type PdfToWordToolContent = typeof pdfToWordContent.fa;

export function usePdfToWordToolContent() {
  const { locale } = useLanguage();
  return pdfToWordContent[locale];
}
