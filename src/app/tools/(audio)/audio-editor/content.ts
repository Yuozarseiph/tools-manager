// app/tools/audio-editor/content.ts
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
export function getAudioEditorSeo(lang: "fa" | "en" = "fa") {
  return content[lang].seo;
}

// برای استفاده در UI صفحه (سمت کلاینت)
export function useAudioEditorPageContent() {
  const { locale } = useLanguage(); // از LanguageContext می‌آید.[file:10]

  const lang = locale === "en" ? "en" : "fa";
  return content[lang].page;
}
