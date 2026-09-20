import { useLanguage } from "@/context/LanguageContext";

export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const imageToTextPageContent = {
  fa: {
    page: {
      title: "استخراج متن از تصویر",
      description:
        "متن فارسی و انگلیسی را مستقیماً در مرورگر از تصاویر JPG، PNG و WebP استخراج کن؛ بدون آپلود تصویر روی سرور.",
    },
    seo: {
      title: "استخراج متن از عکس آنلاین (OCR) | QodeForge",
      description:
        "ابزار OCR آنلاین برای استخراج متن فارسی و انگلیسی از تصویر، با پردازش داخل مرورگر، امکان کپی و دانلود متن و بدون آپلود فایل.",
      canonical: "https://qodeforge.ir/tools/image-to-text",
      ogTitle: "Image to Text OCR | QodeForge",
      ogDescription:
        "Extract editable Persian and English text from images directly in your browser.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },
  en: {
    page: {
      title: "Image to Text (OCR)",
      description:
        "Extract Persian and English text from JPG, PNG and WebP images directly in your browser without uploading the image to a server.",
    },
    seo: {
      title: "Image to Text OCR online | QodeForge",
      description:
        "Extract editable text from images with browser-based OCR. Supports Persian and English, copy, editing and TXT download.",
      canonical: "https://qodeforge.ir/tools/image-to-text",
      ogTitle: "Online Image to Text OCR",
      ogDescription:
        "Extract editable Persian and English text from images directly in your browser.",
      applicationCategory: "UtilitiesApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export function useImageToTextPageContent() {
  const { locale } = useLanguage();
  return imageToTextPageContent[locale].page;
}

export function getImageToTextSeo(locale: "fa" | "en"): SeoContent {
  return imageToTextPageContent[locale].seo;
}

