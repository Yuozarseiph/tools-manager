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

// برای metadata (سمت سرور)
export function getPdfEditorSeo(lang: Lang) {
  return content[lang].seo;
}

// برای UI صفحه (سمت کلاینت)
export function usePdfEditorPageContent() {
  const { locale } = useLanguage();
  const lang: Lang = locale === "en" ? "en" : "fa";
  return content[lang].page;
}
