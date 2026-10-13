// app/tools/(image)/image-to-svg/content.ts

import { useLanguage } from "@/context/LanguageContext";

// 🔥 Type مشترک برای SEO
export type SeoContent = {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  applicationCategory?: string;
  inLanguage?: string;
};

export const imageToSvgContent = {
  fa: {
    page: {
      title: "تبدیل تصویر به SVG وکتور",
      description:
        "تصاویر بیت‌مپ مثل JPG، PNG و WebP را در مرورگر به خروجی SVG وکتوری و قابل‌ویرایش تبدیل کن؛ بدون نیاز به ارسال فایل به سرور.",
    },
    seo: {
      title: "ابزار تبدیل تصویر به SVG | QodeForge",
      description:
        "تبدیل آنلاین تصویر به SVG وکتور، مناسب برای طراحان و توسعه‌دهندگان؛ پشتیبانی از JPG، PNG و WebP با پیش‌نمایش زنده و دانلود مستقیم.",
      canonical: "https://qodeforge.ir/tools/image-to-svg",
      ogTitle: "مبدل آنلاین تصویر به SVG (Raster به Vector)",
      ogDescription:
        "یک تصویر را انتخاب کن و نسخهٔ وکتوری آن را در قالب فایل SVG خروجی بگیر؛ ایده‌آل برای طراحی لوگو، آیکون و گرافیک‌های مقیاس‌پذیر.",
      applicationCategory: "ImageApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Image to SVG converter",
      description:
        "Convert bitmap images like JPG, PNG, and WebP into editable vector SVG output directly in your browser, no server upload required.",
    },
    seo: {
      title: "Image to SVG tool | QodeForge",
      description:
        "Online image to SVG vector converter for designers and developers; supports JPG, PNG, and WebP with live preview and direct download.",
      canonical: "https://qodeforge.ir/tools/image-to-svg",
      ogTitle: "Online image to SVG converter (Raster to Vector)",
      ogDescription:
        "Select an image and get a vector SVG version ready to edit in your favorite design tools. Ideal for logos, icons, and scalable graphics.",
      applicationCategory: "ImageApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ImageToSvgContent = typeof imageToSvgContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useImageToSvgContent() {
  const { locale } = useLanguage();
  return imageToSvgContent[locale];
}

// 🔥 Hook مخصوص page content
export function useImageToSvgPageContent() {
  const content = useImageToSvgContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getImageToSvgSeo(locale: "fa" | "en"): SeoContent {
  return imageToSvgContent[locale].seo;
}

