import { useLanguage } from "@/context/LanguageContext";

export const qrReaderContent = {
  fa: {
    uploadTitle: "تصویر یا اسکرین‌شات QR را اینجا رها کنید",
    uploadHint: "JPG، PNG و WebP — برای QRهای داخل اسکرین‌شات هم مناسب است.",
    selectImage: "انتخاب تصویر",
    pasteImage: "جایگذاری تصویر",
    camera: "اسکن با دوربین",
    stopCamera: "توقف دوربین",
    scanning: "در حال اسکن...",
    scanAnother: "اسکن تصویر دیگر",
    result: "محتوای QR Code",
    copy: "کپی",
    copied: "کپی شد",
    openLink: "باز کردن لینک",
    type: "نوع محتوا",
    types: {
      url: "لینک",
      email: "ایمیل",
      phone: "شماره تلفن",
      wifi: "Wi-Fi",
      text: "متن",
    },
    noResult:
      "QR Code در تصویر پیدا نشد. تصویر واضح‌تر یا با رزولوشن بالاتر امتحان کنید.",
    invalidType: "فقط فایل‌های تصویری پشتیبانی می‌شوند.",
    cameraError:
      "دسترسی به دوربین ممکن نشد. مجوز دوربین و HTTPS را بررسی کنید.",
    clipboardError:
      "تصویری در کلیپ‌بورد پیدا نشد یا دسترسی Clipboard مجاز نیست.",
    privacy: "تصویر و فریم دوربین فقط در مرورگر شما پردازش می‌شوند.",
  },
  en: {
    uploadTitle: "Drop a QR image or screenshot here",
    uploadHint:
      "JPG, PNG and WebP — also optimized for QR codes inside screenshots.",
    selectImage: "Select image",
    pasteImage: "Paste image",
    camera: "Scan with camera",
    stopCamera: "Stop camera",
    scanning: "Scanning...",
    scanAnother: "Scan another image",
    result: "QR Code content",
    copy: "Copy",
    copied: "Copied",
    openLink: "Open link",
    type: "Content type",
    types: {
      url: "Link",
      email: "Email",
      phone: "Phone number",
      wifi: "Wi-Fi",
      text: "Text",
    },
    noResult: "No QR code was found. Try a clearer or higher-resolution image.",
    invalidType: "Only image files are supported.",
    cameraError: "Camera access failed. Check camera permissions and HTTPS.",
    clipboardError:
      "No image was found in the clipboard or clipboard access was denied.",
    privacy: "Images and camera frames are processed only in your browser.",
  },
};

export type QrReaderToolContent = typeof qrReaderContent.fa;

export function useQrReaderContent(): QrReaderToolContent {
  const { locale } = useLanguage();
  return qrReaderContent[locale];
}
