// app/tools/(media)/audio-extractor/content.ts
import rawContent from "./content.json";
import { useLanguage } from "@/context/LanguageContext";

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
export function getAudioExtractorSeo(lang: "fa" | "en" = "fa") {
  return content[lang].seo;
}

// برای استفاده در UI صفحه (سمت کلاینت)
export function useAudioExtractorPageContent() {
  const { locale } = useLanguage();
  const lang = locale === "en" ? "en" : "fa";
  return content[lang].page;
}
