// app/tools/(developer)/color-picker/color-picker.content.ts

import { useLanguage } from "@/context/LanguageContext";

export const colorPickerContent = {
  fa: {
    id: "color-picker",
    category: "developer",
    title: "انتخاب رنگ از تصویر",
    description: "با آپلود یک تصویر، رنگ پیکسل‌ها را انتخاب کنید، پالت خودکار بسازید و رنگ‌ها را در قالب‌های مختلف کپی یا به CSS تبدیل کنید.",
    features: [
      "انتخاب رنگ مستقیم از هر نقطهٔ تصویر",
      "نمایش رنگ فعلی در قالب‌های HEX، RGB و HSL",
      "تولید خودکار پالت رنگی و ترکیب‌های مکمل",
      "دانلود پالت به صورت متغیرهای CSS",
      "تاریخچهٔ رنگ‌های انتخاب‌شده از تصویر"
    ],
    ui: {
      format: {
        label: "فرمت نمایش رنگ"
      },
      upload: {
        dropTitle: "یک تصویر اینجا رها کن یا کلیک کن تا انتخاب کنی",
        dropSubtitle: "فرمت‌های متداول مانند JPG، PNG و WebP پشتیبانی می‌شوند.",
        loading: "در حال بارگذاری تصویر و آماده‌سازی برای انتخاب رنگ...",
        urlPlaceholder: "آدرس تصویر (URL) را وارد کن",
        urlButton: "افزودن از لینک",
        urlLoading: "در حال دانلود تصویر از لینک…",
        urlHint: "تصویر با اینترنت خودتان دانلود می‌شود و فقط داخل مرورگر شما پردازش می‌شود؛ هیچ فایلی به سرور ما ارسال نمی‌شود."
      },
      currentColor: {
        title: "رنگ زیر نشانگر",
        copy: "کپی رنگ",
        copied: "کپی شد!"
      },
      palette: {
        title: "پالت رنگ خودکار",
        generateComplementaryTitle: "تولید رنگ‌های مکمل و مرتبط",
        downloadCssTitle: "دانلود پالت به صورت CSS"
      },
      history: {
        title: "تاریخچه رنگ‌های انتخاب‌شده",
        clearAll: "حذف تمام رنگ‌ها"
      }
    }
  },
  en: {
    id: "color-picker",
    category: "developer",
    title: "Image color picker",
    description: "Upload an image, pick pixel colors, build an automatic palette and export colors in different formats or as CSS variables.",
    features: [
      "Pick colors from any point on the image",
      "View the current color in HEX, RGB and HSL",
      "Automatically generate a color palette and complementary schemes",
      "Download the palette as CSS custom properties",
      "Keep a history of picked colors from the image"
    ],
    ui: {
      format: {
        label: "Color output format"
      },
      upload: {
        dropTitle: "Drop an image here or click to upload",
        dropSubtitle: "Common image formats such as JPG, PNG and WebP are supported.",
        loading: "Loading image and preparing it for color picking...",
        urlPlaceholder: "Enter image URL",
        urlButton: "Add from URL",
        urlLoading: "Downloading image from URL…",
        urlHint: "The image is downloaded over your own internet connection and processed only in your browser; no files are uploaded to our servers."
      },
      currentColor: {
        title: "Current color under cursor",
        copy: "Copy color",
        copied: "Copied!"
      },
      palette: {
        title: "Automatic color palette",
        generateComplementaryTitle: "Generate complementary related colors",
        downloadCssTitle: "Download palette as CSS"
      },
      history: {
        title: "Picked colors history",
        clearAll: "Clear all colors"
      }
    }
  }
};

export type ColorPickerToolContent = typeof colorPickerContent.fa;

export function useColorPickerContent() {
  const { locale } = useLanguage();
  return colorPickerContent[locale];
}
