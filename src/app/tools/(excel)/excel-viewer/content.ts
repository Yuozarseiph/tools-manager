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
    why: {
      title: string;
      reasons: string[];
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
    why: {
      title: string;
      reasons: string[];
    };
  };
};

// برای استفاده در metadata (سمت سرور / بدون هوک)
export function getExcelViewerSeo(lang: Lang) {
  return content[lang].seo;
}

// برای استفاده در UI صفحه (سمت کلاینت)
export function useExcelViewerContent() {
  const { locale } = useLanguage(); // fa یا en.[file:10]
  const lang: Lang = locale === "en" ? "en" : "fa";
  return content[lang]; // { page, seo, why }
}
