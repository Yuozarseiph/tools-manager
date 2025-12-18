import { useLanguage } from "@/context/LanguageContext";
export const imageEditorContent = {
  fa: {
    id: "image-editor",
    category: "image",
    title: "ویرایشگر تصویر حرفه‌ای",
    description:
      "ویرایش فایل‌های PSD، PNG و JPG به صورت کاملاً آفلاین با قابلیت‌های حرفه‌ای لایه، فیلتر و خروجی چندگانه.",
    features: [
      "باز کردن و ویرایش فایل‌های PSD با حفظ لایه‌ها",
      "مدیریت کامل لایه‌ها (افزودن، حذف، ترتیب، opacity، blend mode)",
      "ابزارهای پایه (Move، Crop، Resize، Rotate، Flip)",
      "فیلترهای پیشرفته (Brightness، Contrast، Saturation، Blur، Sharpen)",
      "افزودن و ویرایش متن با فونت‌های مختلف",
      "خروجی به فرمت‌های PSD، PNG، JPG، WebP، AVIF و SVG",
      "کاملاً آفلاین و محلی - هیچ آپلودی به سرور نیست",
    ],
    ui: {
      editorHeader: {
        upload: "انتخاب تصویر از دستگاه",
        clear: "حذف تصویر",
        urlPlaceholder: "آدرس تصویر (URL)",
        urlLoad: "بارگذاری از لینک",
        urlHint:
          "تصویر با اینترنت خودتان دانلود و فقط داخل مرورگر شما پردازش می‌شود؛ هیچ فایلی به سرور ما ارسال نمی‌شود.",
        noImageHint: "برای شروع، یک تصویر آپلود کن.",
      },
      canvas: {
        noImage: "هیچ تصویری بارگذاری نشده است",
        loading: "در حال بارگذاری...",
      },
      properties: {
        width: "عرض",
        height: "ارتفاع",
        maintainRatio: "حفظ نسبت",
      },
      resizeTab: {
        title: "تغییر اندازه",
        scale: "درصد بزرگ‌نمایی",
        apply: "اعمال تغییر اندازه",
        download: "دانلود تصویر تغییر اندازه داده‌شده",
      },
      rotateTab: {
        title: "چرخش و برگردان",
        rotateLeft: "چرخش ۹۰° به چپ",
        rotateRight: "چرخش ۹۰° به راست",
        rotate180: "چرخش ۱۸۰°",
        flipH: "برگردان افقی",
        flipV: "برگردان عمودی",
        download: "دانلود تصویر چرخش‌یافته",
      },
      textTab: {
        title: "متن روی تصویر",
        content: "متن",
        fontFamily: "فونت",
        fontSize: "اندازه فونت",
        fontWeight: "ضخامت",
        align: "تراز متن",
        color: "رنگ متن",
        strokeColor: "رنگ دور متن",
        strokeWidth: "ضخامت دور متن",
        shadowColor: "رنگ سایه",
        shadowBlur: "میزان محو سایه",
        shadowOffsetX: "انحراف افقی سایه",
        shadowOffsetY: "انحراف عمودی سایه",
        positionY: "جایگاه عمودی متن",
        download: "دانلود تصویر با متن",
      },
      filters: {
        title: "فیلترها",
        brightness: "روشنایی",
        contrast: "کنتراست",
        saturation: "اشباع رنگ",
        hue: "رنگ",
        blur: "محو",
        sharpen: "تیز کردن",
        grayscale: "سیاه‌وسفید",
        sepia: "سپیا",
        apply: "اعمال",
        reset: "بازنشانی",
        download: "دانلود تصویر",
      },
    },
  },
  en: {
    id: "image-editor",
    category: "image",
    title: "Professional Image Editor",
    description:
      "Edit PSD, PNG and JPG files completely offline with professional layer, filter and multi-format export capabilities.",
    features: [
      "Open and edit PSD files with preserved layers",
      "Complete layer management (add, remove, reorder, opacity, blend mode)",
      "Basic tools (Move, Crop, Resize, Rotate, Flip)",
      "Advanced filters (Brightness, Contrast, Saturation, Blur, Sharpen)",
      "Add and edit text with various fonts",
      "Export to PSD, PNG, JPG, WebP, AVIF and SVG formats",
      "Fully offline and local - no server uploads",
    ],
    ui: {
      editorHeader: {
        upload: "Choose image from device",
        clear: "Remove image",
        urlPlaceholder: "Image URL",
        urlLoad: "Load from URL",
        urlHint:
          "The image is downloaded over your own internet connection and processed only in your browser; no files are uploaded to our servers.",
        noImageHint: "Upload an image to get started.",
      },
      canvas: {
        noImage: "No image loaded",
        loading: "Loading...",
      },
      properties: {
        width: "Width",
        height: "Height",
        maintainRatio: "Maintain ratio",
      },
      resizeTab: {
        title: "Resize",
        scale: "Scale percentage",
        apply: "Apply resize",
        download: "Download resized image",
      },
      rotateTab: {
        title: "Rotate & Flip",
        rotateLeft: "Rotate 90° left",
        rotateRight: "Rotate 90° right",
        rotate180: "Rotate 180°",
        flipH: "Flip horizontally",
        flipV: "Flip vertically",
        download: "Download rotated image",
      },
      textTab: {
        title: "Text on image",
        content: "Text",
        fontFamily: "Font family",
        fontSize: "Font size",
        fontWeight: "Weight",
        align: "Alignment",
        color: "Text color",
        strokeColor: "Outline color",
        strokeWidth: "Outline width",
        shadowColor: "Shadow color",
        shadowBlur: "Shadow blur",
        shadowOffsetX: "Shadow offset X",
        shadowOffsetY: "Shadow offset Y",
        positionY: "Vertical position",
        download: "Download image with text",
      },
      filters: {
        title: "Filters",
        brightness: "Brightness",
        contrast: "Contrast",
        saturation: "Saturation",
        hue: "Hue",
        blur: "Blur",
        sharpen: "Sharpen",
        grayscale: "Grayscale",
        sepia: "Sepia",
        apply: "Apply",
        reset: "Reset",
        download: "Download image",
      },
    },
  },
};



export type ImageEditorContent = typeof imageEditorContent.fa;

export function useImageEditorContent() {
  const { locale } = useLanguage();
  return imageEditorContent[locale];
}
