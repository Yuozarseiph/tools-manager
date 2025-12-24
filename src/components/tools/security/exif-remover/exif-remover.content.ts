// components/tools/security/exif-remover/exif-remover.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const exifRemoverContent = {
  fa: {
    id: "exif-remover",
    category: "security",
    title: "حذف متادیتا (EXIF) از تصویر",
    description:
      "تصویر را آپلود کن یا از لینک اضافه کن تا متادیتای EXIF (مثل موقعیت مکانی، مدل گوشی و تاریخ) قبل از انتشار حذف شود. پردازش فقط روی دستگاه شما انجام می‌شود.",
    features: [
      "حذف EXIF از تصاویر JPEG",
      "پیش‌نمایش تصویر ورودی و خروجی",
      "دانلود نسخه پاک‌سازی‌شده",
      "گزارش ساده از وضعیت پاک‌سازی (فرمت/حجم)",
      "افزودن تصویر از لینک (در صورت اجازه CORS)",
    ],
    ui: {
      upload: {
        dropTitle: "تصویر را اینجا رها کن یا کلیک کن تا انتخاب شود",
        dropSubtitle: "بهترین پشتیبانی برای حذف EXIF مربوط به JPEG است.",
        loading: "در حال پردازش و حذف متادیتا…",
        urlPlaceholder: "آدرس تصویر (URL) را وارد کن",
        urlButton: "افزودن از لینک",
        urlLoading: "در حال دانلود تصویر از لینک…",
        urlHint:
          "تصویر با اینترنت خودتان دانلود و فقط داخل مرورگر پردازش می‌شود؛ هیچ فایلی به سرور ما ارسال نمی‌شود.",
      },
      input: {
        title: "تصویر ورودی",
        meta: "حجم: {size} | نوع: {type}",
      },
      output: {
        title: "خروجی بدون EXIF",
        meta: "حجم: {size} | نوع: {type}",
        download: "دانلود خروجی",
        done: "متادیتا حذف شد",
      },
      actions: {
        reset: "حذف تصویر",
      },
      errors: {
        notImage: "فایل انتخاب‌شده تصویر نیست.",
        fetchFailed:
          "لود از لینک ناموفق بود. ممکن است سایت مبدا CORS را مسدود کرده باشد؛ تصویر را دانلود و سپس آپلود کنید.",
        processingFailed: "پردازش تصویر ناموفق بود.",
      },
      notes: {
        jpegOnly:
          "نکته: حذف EXIF به‌صورت مستقیم برای JPEG انجام می‌شود. برای سایر فرمت‌ها ممکن است متادیتا متفاوت باشد.",
      },
    },
  },

  en: {
    id: "exif-remover",
    category: "security",
    title: "EXIF remover",
    description:
      "Upload an image (or add from URL) to remove EXIF metadata (GPS, device model, timestamps) before sharing. Processing runs locally on your device.",
    features: [
      "Remove EXIF from JPEG images",
      "Preview input and cleaned output",
      "Download the cleaned version",
      "Simple processing report (type/size)",
      "Add image from URL (if CORS allows)",
    ],
    ui: {
      upload: {
        dropTitle: "Drop an image here or click to upload",
        dropSubtitle: "Best EXIF removal support is for JPEG files.",
        loading: "Removing metadata…",
        urlPlaceholder: "Enter image URL",
        urlButton: "Add from URL",
        urlLoading: "Downloading image from URL…",
        urlHint:
          "The image is downloaded via your own connection and processed only in your browser; no files are uploaded to our servers.",
      },
      input: {
        title: "Input image",
        meta: "Size: {size} | Type: {type}",
      },
      output: {
        title: "Cleaned (no EXIF)",
        meta: "Size: {size} | Type: {type}",
        download: "Download output",
        done: "Metadata removed",
      },
      actions: {
        reset: "Remove image",
      },
      errors: {
        notImage: "The selected file is not an image.",
        fetchFailed:
          "Failed to load from URL. The source site may block CORS; please download the file and upload it.",
        processingFailed: "Image processing failed.",
      },
      notes: {
        jpegOnly:
          "Note: EXIF removal is applied directly for JPEG. Other formats may carry metadata differently.",
      },
    },
  },
};

export type ExifRemoverToolContent = typeof exifRemoverContent.fa;

export function useExifRemoverContent() {
  const { locale } = useLanguage();
  return exifRemoverContent[locale];
}
