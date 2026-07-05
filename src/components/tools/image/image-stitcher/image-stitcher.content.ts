import { useLanguage } from "@/context/LanguageContext";

type Locale = {
  dropTitle: string;
  dropHint: string;
  addImages: string;
  max: string;
  format: string;
  align: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  bg: string;
  gap: string;
  quality: string;
  generate: string;
  generating: string;
  download: string;
  clear: string;
  crop: string;
  cropTitle: string;
  apply: string;
  cancel: string;
  reset: string;
  moveUp: string;
  moveDown: string;
  remove: string;
  cropped: string;
  limitReached: string;
  resultTitle: string;
};

const fa: Locale = {
  dropTitle: "عکس‌ها را اینجا رها کن",
  dropHint: "یا کلیک کن — تا ۲۰ عکس، پردازش داخل مرورگر",
  addImages: "افزودن عکس",
  max: "حداکثر ۲۰ عکس",
  format: "فرمت خروجی",
  align: "چینش افقی",
  alignLeft: "چپ",
  alignCenter: "وسط",
  alignRight: "راست",
  bg: "رنگ پس‌زمینه",
  gap: "فاصله بین عکس‌ها",
  quality: "کیفیت (JPG)",
  generate: "ساخت تصویر طولانی",
  generating: "در حال ساخت...",
  download: "دانلود تصویر",
  clear: "پاک کردن همه",
  crop: "برش",
  cropTitle: "برش تصویر",
  apply: "اعمال برش",
  cancel: "انصراف",
  reset: "بازنشانی برش",
  moveUp: "انتقال به بالا",
  moveDown: "انتقال به پایین",
  remove: "حذف",
  cropped: "برش‌خورده",
  limitReached: "به حداکثر ۲۰ عکس رسیدی",
  resultTitle: "خروجی نهایی",
};

const en: Locale = {
  dropTitle: "Drop your images here",
  dropHint: "or click — up to 20 images, processed in your browser",
  addImages: "Add images",
  max: "Up to 20 images",
  format: "Output format",
  align: "Horizontal align",
  alignLeft: "Left",
  alignCenter: "Center",
  alignRight: "Right",
  bg: "Background color",
  gap: "Gap between images",
  quality: "Quality (JPG)",
  generate: "Build long image",
  generating: "Building...",
  download: "Download image",
  clear: "Clear all",
  crop: "Crop",
  cropTitle: "Crop image",
  apply: "Apply crop",
  cancel: "Cancel",
  reset: "Reset crop",
  moveUp: "Move up",
  moveDown: "Move down",
  remove: "Remove",
  cropped: "Cropped",
  limitReached: "You reached the 20-image limit",
  resultTitle: "Final output",
};

export const imageStitcherToolContent = { fa, en };

export function useImageStitcherToolContent(): Locale {
  const { locale } = useLanguage();
  return imageStitcherToolContent[locale];
}
