// app/tools/(image)/image-to-svg/content.ts

import rawContent from "./content.json";
import { useLanguage } from "@/context/LanguageContext";

type Lang = "fa" | "en";

const content = rawContent as {
  fa: {
    page: { title: string; description: string };
    seo: {
      title: string;
      description: string;
      canonical: string;
      ogTitle?: string;
      ogDescription?: string;
      applicationCategory?: string;
      inLanguage?: string;
    };
  };
  en: {
    page: { title: string; description: string };
    seo: {
      title: string;
      description: string;
      canonical: string;
      ogTitle?: string;
      ogDescription?: string;
      applicationCategory?: string;
      inLanguage?: string;
    };
  };
};

// برای استفاده در metadata (سمت سرور / بدون هوک)
export function getImageToSvgSeo(lang: Lang) {
  return content[lang].seo;
}

// برای استفاده در UI صفحه (سمت کلاینت)
export function useImageToSvgPageContent() {
  const { locale } = useLanguage(); // 'fa' یا 'en'
  const lang: Lang = locale === "en" ? "en" : "fa";
  return content[lang].page;
}
