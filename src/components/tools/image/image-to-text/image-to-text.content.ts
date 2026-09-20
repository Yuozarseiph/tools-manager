import { useLanguage } from "@/context/LanguageContext";

export const imageToTextContent = {
  fa: {
    language: "زبان متن",
    languages: {
      fa: "فارسی",
      en: "English",
      faEn: "فارسی + English",
    },
    mode: "نوع متن",
    modes: {
      auto: "تشخیص خودکار",
      document: "متن معمولی / سند",
      stylized: "لوگو / متن گرافیکی",
    },
    quality: "دقت OCR",
    qualities: {
      fast: "سریع",
      balanced: "متعادل",
      accurate: "دقیق‌تر",
    },
    persianHint:
      "برای متن عمدتاً فارسی، حالت «فارسی» را انتخاب کن. «تشخیص خودکار» اگر OCR معمولی ضعیف باشد خودش مسیر مخصوص لوگو و متن گرافیکی را اجرا می‌کند.",
    stylizedHint:
      "حالت لوگو چند نوع شارپ‌سازی، Threshold، معکوس‌سازی و ناحیه‌بندی متن را امتحان می‌کند؛ برای لوگوتایپ، بنر و نوشته روی پس‌زمینه رنگی مناسب‌تر است و زمان بیشتری می‌برد.",
    stylizedFallback:
      "متن معمولی ضعیف بود؛ در حال بررسی حالت لوگو و متن گرافیکی...",
    uploadTitle: "تصویر را انتخاب یا اینجا رها کنید",
    uploadHint: "JPG، PNG یا WebP — تصویر روی سرور آپلود نمی‌شود.",
    selectFile: "انتخاب تصویر",
    pasteImage: "جایگذاری از کلیپ‌بورد",
    remove: "حذف تصویر",
    extract: "استخراج متن",
    extracting: "در حال استخراج متن...",
    recognizingPass: "مرحله تشخیص",
    cancel: "لغو",
    resultTitle: "متن استخراج‌شده",
    previewTitle: "پیش‌نمایش تصویر",
    emptyResult:
      "پس از اجرای OCR، متن قابل ویرایش در این قسمت نمایش داده می‌شود.",
    copy: "کپی متن",
    copied: "کپی شد",
    download: "دانلود TXT",
    clear: "پاک کردن خروجی",
    confidence: "دقت تقریبی",
    progress: "پیشرفت OCR",
    preparing: "در حال آماده‌سازی موتور و تصویر OCR...",
    firstRun:
      "حالت دقیق‌تر مدل OCR بزرگ‌تری دریافت می‌کند؛ اجرای اول ممکن است بیشتر طول بکشد و سپس توسط مرورگر Cache شود.",
    invalidType: "فقط فایل‌های تصویری JPG، PNG و WebP پشتیبانی می‌شوند.",
    noClipboardImage: "تصویری در کلیپ‌بورد پیدا نشد.",
    clipboardDenied: "مرورگر اجازه خواندن تصویر از کلیپ‌بورد را نداد.",
    noText: "متنی در تصویر شناسایی نشد.",
    error: "در استخراج متن خطایی رخ داد.",
    privacy:
      "پردازش OCR در مرورگر انجام می‌شود و تصویر انتخابی به سرور QodeForge ارسال نمی‌شود.",
  },
  en: {
    language: "Text language",
    languages: {
      fa: "Persian",
      en: "English",
      faEn: "Persian + English",
    },
    mode: "Text type",
    modes: {
      auto: "Auto detect",
      document: "Normal text / document",
      stylized: "Logo / stylized text",
    },
    quality: "OCR accuracy",
    qualities: {
      fast: "Fast",
      balanced: "Balanced",
      accurate: "More accurate",
    },
    persianHint:
      "For mostly Persian text, choose Persian only. Auto detect automatically falls back to a logo/stylized-text pipeline when normal OCR is weak.",
    stylizedHint:
      "Logo mode tries sharpening, multiple thresholds, inversion, and text-region detection. It is better for logotypes, banners, and text on colored backgrounds, but takes longer.",
    stylizedFallback:
      "Normal OCR was weak; trying logo and stylized-text recognition...",
    uploadTitle: "Choose an image or drop it here",
    uploadHint: "JPG, PNG or WebP — your image is not uploaded to our server.",
    selectFile: "Select image",
    pasteImage: "Paste from clipboard",
    remove: "Remove image",
    extract: "Extract text",
    extracting: "Extracting text...",
    recognizingPass: "Recognition pass",
    cancel: "Cancel",
    resultTitle: "Extracted text",
    previewTitle: "Image preview",
    emptyResult: "Editable OCR output will appear here after recognition.",
    copy: "Copy text",
    copied: "Copied",
    download: "Download TXT",
    clear: "Clear output",
    confidence: "Approx. confidence",
    progress: "OCR progress",
    preparing: "Preparing OCR engine and image...",
    firstRun:
      "More accurate mode downloads a larger OCR model on first use; the browser can cache it for later runs.",
    invalidType: "Only JPG, PNG and WebP images are supported.",
    noClipboardImage: "No image was found in the clipboard.",
    clipboardDenied:
      "The browser did not allow reading an image from the clipboard.",
    noText: "No text was detected in the image.",
    error: "An error occurred while extracting text.",
    privacy:
      "OCR runs in your browser and the selected image is not uploaded to the QodeForge server.",
  },
};

export type ImageToTextToolContent = typeof imageToTextContent.fa;

export function useImageToTextContent(): ImageToTextToolContent {
  const { locale } = useLanguage();
  return imageToTextContent[locale];
}

