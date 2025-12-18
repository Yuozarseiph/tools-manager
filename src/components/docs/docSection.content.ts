// components/docs/docSection.content.ts
import { useLanguage } from "@/context/LanguageContext";

export type DocSectionUiContent = {
  section: {
    featuresTitle: string;
    howItWorksTitle: string;
    privacyTitle: string;
  };
  categories: Record<string, string>;
};

export const docSectionContent: Record<"fa" | "en", DocSectionUiContent> = {
  fa: {
    section: {
      featuresTitle: "ویژگی‌ها",
      howItWorksTitle: "نحوه کار",
      privacyTitle: "حریم خصوصی",
    },
    categories: {
      pdf: "PDF",
      image: "تصویر",
      excel: "اکسل",
      security: "امنیت",
      system: "سیستم",
      text: "متن",
      other: "سایر",
    },
  },
  en: {
    section: {
      featuresTitle: "Features",
      howItWorksTitle: "How it works",
      privacyTitle: "Privacy",
    },
    categories: {
      pdf: "PDF",
      image: "Image",
      excel: "Excel",
      security: "Security",
      system: "System",
      text: "Text",
      other: "Other",
    },
  },
};

export function useDocSectionContent(): DocSectionUiContent {
  const { locale } = useLanguage();
  return docSectionContent[locale];
}
