// app/tools/(developer)/base64/content.ts


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
export function getBase64Seo(lang: Lang) {
  return content[lang].seo;
}

// برای استفاده در UI صفحه (سمت کلاینت)
export function useBase64PageContent() {
  const { locale } = useLanguage(); // fa یا en از LanguageContext.[file:10]
  const lang: Lang = locale === "en" ? "en" : "fa";
  return content[lang].page;
}
