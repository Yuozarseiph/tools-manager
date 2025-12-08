import rawContent from "./content.json";

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

export function getDocsSeo(lang: Lang) {
  return content[lang].seo;
}

export function getDocsPage(lang: Lang) {
  return content[lang].page;
}
