// app/tools/(image)/background-remover/background-remover.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const backgroundRemoverContent = {
  fa: {
    id: "background-remover",
    category: "image",
    title: "حذف پس‌زمینه تصویر",
    description:
      "تصویر را آپلود کن تا پس‌زمینه به‌صورت خودکار حذف شود و خروجی PNG با پس‌زمینه شفاف بگیری.",
    features: [
      "حذف خودکار پس‌زمینه از تصاویر",
      "پیش‌نمایش تصویر ورودی و خروجی",
      "دانلود نسخه پاک‌سازی‌شده با پس‌زمینه شفاف",
      "پردازش کاملاً آفلاین و محلی در مرورگر",
      "افزودن تصویر از لینک (در صورت اجازه CORS)",
    ],
    ui: {
      upload: {
        dropTitle: "تصویر را اینجا رها کن یا کلیک کن تا انتخاب شود",
        dropSubtitle: "فقط پردازش تصاویر معمولی پشتیبانی می‌شود.",
        loading: "در حال پردازش و حذف پس‌زمینه…",
        export: "برای شروع روی دکمه Remove بالا کلیک کنید",
        urlPlaceholder: "آدرس تصویر (URL) را وارد کن",
        urlButton: "افزودن از لینک",
        urlLoading: "در حال دانلود تصویر از لینک…",
        urlHint:
          "تصویر با اینترنت خودتان دانلود و فقط داخل مرورگر شما پردازش می‌شود؛ هیچ فایلی به سرور ما ارسال نمی‌شود.",
        firstRunWarning:
          "هشدار: بار اول ممکن است چند ثانیه تا چند دقیقه طول بکشد (مدل و موتور پردازش دانلود می‌شود). دفعات بعد سریع‌تر است.",
      },
      input: {
        title: "تصویر ورودی",
        meta: "حجم: {size} | نوع: {type}",
      },
      output: {
        title: "خروجی بدون پس‌زمینه",
        meta: "حجم: {size} | نوع: {type}",
        download: "دانلود خروجی",
        done: "پس‌زمینه حذف شد",
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
    },
  },
  en: {
    id: "background-remover",
    category: "image",
    title: "Background remover",
    description:
      "Upload an image to automatically remove the background and download a transparent PNG.",
    features: [
      "Automatically remove background from images",
      "Preview input and output images",
      "Download the cleaned version with transparent background",
      "Fully offline and local processing in the browser",
      "Add image from URL (if CORS allows)",
    ],
    ui: {
      upload: {
        dropTitle: "Drop an image here or click to upload",
        dropSubtitle: "Only regular images are supported.",
        loading: "Removing background…",
        export: "For start click Remove button on top.",
        urlPlaceholder: "Enter image URL",
        urlButton: "Add from URL",
        urlLoading: "Downloading image from URL…",
        urlHint:
          "The image is downloaded via your own connection and processed only in your browser; no files are uploaded to our servers.",
        firstRunWarning:
          "Warning: First run may take a few seconds to a few minutes (model and engine are downloaded). Subsequent runs are faster.",
      },
      input: {
        title: "Input image",
        meta: "Size: {size} | Type: {type}",
      },
      output: {
        title: "Output without background",
        meta: "Size: {size} | Type: {type}",
        download: "Download output",
        done: "Background removed",
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
    },
  },
};

export type BackgroundRemoverToolContent = typeof backgroundRemoverContent.fa;

export function useBackgroundRemoverContent() {
  const { locale } = useLanguage();
  return backgroundRemoverContent[locale];
}
