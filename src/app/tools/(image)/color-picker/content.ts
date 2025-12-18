// app/tools/(image)/color-picker/content.ts

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

export const colorPickerContent = {
  fa: {
    page: {
      title: "انتخاب و استخراج رنگ از تصویر",
      description:
        "رنگ دلخواه را انتخاب کن یا از روی تصویر رنگ بردار، کدهای HEX، RGB و HSL را ببین و آن‌ها را در طراحی یا کد استفاده کن.",
    },
    seo: {
      title: "ابزار Color Picker آنلاین | Tools Manager",
      description:
        "رنگ‌ها را از روی تصویر یا پالت انتخاب کن، کدهای HEX و RGB را کپی کن و تاریخچهٔ رنگ‌های استفاده‌شده را همیشه در دسترس داشته باش.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/color-picker",
      ogTitle: "انتخاب‌گر رنگ تحت‌وب برای طراحان و توسعه‌دهندگان",
      ogDescription:
        "رنگ دلخواه را انتخاب کن، از روی تصویر نمونه‌برداری کن و پالت رنگی خودت را برای پروژه‌های بعدی ذخیره کن.",
      applicationCategory: "DesignApplication",
      inLanguage: "fa-IR",
    } satisfies SeoContent,
  },

  en: {
    page: {
      title: "Online color picker & image eyedropper",
      description:
        "Pick colors from a palette or sample them from images, then copy HEX, RGB and HSL codes for your designs and code.",
    },
    seo: {
      title: "Color picker online tool | Tools Manager",
      description:
        "Select colors from images or a palette, copy HEX and RGB codes and keep a handy history of recently used colors.",
      canonical: "https://toolsmanager.yuozarseip.top/tools/color-picker",
      ogTitle: "Web-based color picker for designers and developers",
      ogDescription:
        "Choose colors, sample them from images and build reusable palettes for your next UI or branding project.",
      applicationCategory: "DesignApplication",
      inLanguage: "en-US",
    } satisfies SeoContent,
  },
};

export type ColorPickerContent = typeof colorPickerContent.fa;

// 🔥 Hook برای استفاده در کامپوننت Client
export function useColorPickerContent() {
  const { locale } = useLanguage();
  return colorPickerContent[locale];
}

// 🔥 Hook مخصوص page content
export function useColorPickerPageContent() {
  const content = useColorPickerContent();
  return content.page;
}

// 🔥 تابع برای دریافت SEO (برای page.tsx)
export function getColorPickerSeo(locale: "fa" | "en"): SeoContent {
  return colorPickerContent[locale].seo;
}
