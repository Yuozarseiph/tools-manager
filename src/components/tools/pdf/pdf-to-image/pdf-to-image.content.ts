import { useLanguage } from "@/context/LanguageContext";

type Locale = {
  dropTitle: string;
  dropHint: string;
  selectFile: string;
  format: string;
  quality: string;
  scale: string;
  scaleHint: string;
  rendering: string;
  extracting: string;
  page: string;
  pages: string;
  image: string;
  images: string;
  downloadAll: string;
  downloadZip: string;
  download: string;
  reset: string;
  reprocess: string;
  loading: string;
  error: string;
  passwordError: string;
  invalidRange: string;
  modePages: string;
  modeImages: string;
  modePagesHint: string;
  modeImagesHint: string;
  pageRange: string;
  pageRangePlaceholder: string;
  pageRangeHint: string;
  minSize: string;
  minSizeAll: string;
  dedupe: string;
  dedupeHint: string;
  edit: string;
  editorTitle: string;
  cropHint: string;
  fullImage: string;
  rotateLeft: string;
  rotateRight: string;
  flipH: string;
  flipV: string;
  filters: string;
  brightness: string;
  contrast: string;
  saturate: string;
  grayscale: string;
  sepia: string;
  invert: string;
  aspect: string;
  aspectFree: string;
  resetEdits: string;
  cancel: string;
  apply: string;
  noImages: string;
  noImagesHint: string;
  switchToPages: string;
  zipping: string;
  fromPage: string;
};

const fa: Locale = {
  dropTitle: "فایل PDF را اینجا رها کن",
  dropHint: "یا برای انتخاب کلیک کن — پردازش کاملاً داخل مرورگر",
  selectFile: "انتخاب فایل PDF",
  format: "فرمت خروجی",
  quality: "کیفیت (فقط JPG/WebP)",
  scale: "دقت رندر",
  scaleHint: "مقدار بالاتر = تصویر باکیفیت‌تر و بزرگ‌تر",
  rendering: "در حال رندر صفحات...",
  extracting: "در حال استخراج تصاویر...",
  page: "صفحه",
  pages: "صفحه",
  image: "تصویر",
  images: "تصویر",
  downloadAll: "دانلود همه",
  downloadZip: "دانلود همه (ZIP)",
  download: "دانلود",
  reset: "شروع دوباره",
  reprocess: "پردازش مجدد",
  loading: "در حال بارگذاری PDF...",
  error: "خطا در پردازش فایل PDF",
  passwordError: "این فایل رمزگذاری شده و قابل باز شدن نیست",
  invalidRange: "محدوده صفحات معتبر نیست",
  modePages: "رندر صفحات",
  modeImages: "استخراج تصاویر",
  modePagesHint: "هر صفحه به یک تصویر کامل تبدیل می‌شود",
  modeImagesHint: "عکس‌های جاسازی‌شده در فایل PDF را جدا می‌کند",
  pageRange: "محدوده صفحات",
  pageRangePlaceholder: "مثال: 1-3,5,8",
  pageRangeHint: "خالی بگذار = همه صفحات",
  minSize: "حداقل ابعاد تصویر",
  minSizeAll: "همه",
  dedupe: "حذف تصاویر تکراری",
  dedupeHint: "لوگو و تصاویر مشابه فقط یک‌بار نگه داشته می‌شوند",
  edit: "ویرایش",
  editorTitle: "ویرایش تصویر",
  cropHint:
    "کادر را بکش یا دستگیره‌ها را جابه‌جا کن — کلیک روی تصویر برای انتخاب جدید",
  fullImage: "کل تصویر",
  rotateLeft: "چرخش به چپ",
  rotateRight: "چرخش به راست",
  flipH: "آینه افقی",
  flipV: "آینه عمودی",
  filters: "فیلترها",
  brightness: "روشنایی",
  contrast: "کنتراست",
  saturate: "اشباع رنگ",
  grayscale: "سیاه‌وسفید",
  sepia: "سپیا",
  invert: "معکوس",
  aspect: "نسبت برش",
  aspectFree: "آزاد",
  resetEdits: "بازنشانی",
  cancel: "انصراف",
  apply: "اعمال تغییرات",
  noImages: "هیچ تصویری داخل این PDF پیدا نشد",
  noImagesHint: "احتمالاً فایل فقط متن دارد — حالت «رندر صفحات» را امتحان کن",
  switchToPages: "رفتن به رندر صفحات",
  zipping: "در حال ساخت ZIP...",
  fromPage: "از صفحه",
};

const en: Locale = {
  dropTitle: "Drop your PDF file here",
  dropHint: "or click to choose — processed entirely in your browser",
  selectFile: "Select PDF file",
  format: "Output format",
  quality: "Quality (JPG/WebP only)",
  scale: "Render resolution",
  scaleHint: "Higher value = sharper, larger image",
  rendering: "Rendering pages...",
  extracting: "Extracting images...",
  page: "Page",
  pages: "pages",
  image: "Image",
  images: "images",
  downloadAll: "Download all",
  downloadZip: "Download all (ZIP)",
  download: "Download",
  reset: "Start over",
  reprocess: "Re-process",
  loading: "Loading PDF...",
  error: "Failed to process the PDF file",
  passwordError: "This file is encrypted and cannot be opened",
  invalidRange: "Invalid page range",
  modePages: "Render pages",
  modeImages: "Extract images",
  modePagesHint: "Each page becomes one full image",
  modeImagesHint: "Pulls out photos embedded inside the PDF",
  pageRange: "Page range",
  pageRangePlaceholder: "e.g. 1-3,5,8",
  pageRangeHint: "Leave empty = all pages",
  minSize: "Minimum image size",
  minSizeAll: "All",
  dedupe: "Remove duplicates",
  dedupeHint: "Logos and repeated images are kept only once",
  edit: "Edit",
  editorTitle: "Edit image",
  cropHint:
    "Drag the box or its handles — click on the image for a new selection",
  fullImage: "Full image",
  rotateLeft: "Rotate left",
  rotateRight: "Rotate right",
  flipH: "Flip horizontal",
  flipV: "Flip vertical",
  filters: "Filters",
  brightness: "Brightness",
  contrast: "Contrast",
  saturate: "Saturation",
  grayscale: "Grayscale",
  sepia: "Sepia",
  invert: "Invert",
  aspect: "Crop ratio",
  aspectFree: "Free",
  resetEdits: "Reset",
  cancel: "Cancel",
  apply: "Apply changes",
  noImages: "No images found inside this PDF",
  noImagesHint: "The file is probably text-only — try Render pages mode",
  switchToPages: "Switch to render pages",
  zipping: "Building ZIP...",
  fromPage: "from page",
};

export const pdfToImageToolContent = { fa, en };

export function usePdfToImageToolContent(): Locale {
  const { locale } = useLanguage();
  return pdfToImageToolContent[locale];
}
