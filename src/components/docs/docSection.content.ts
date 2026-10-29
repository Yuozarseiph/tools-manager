import { useLanguage } from "@/context/LanguageContext";

export type DocSectionUiContent = {
  section: {
    featuresTitle: string;
    howItWorksTitle: string;
    privacyTitle: string;
    openTool: string;
  };
  categories: Record<string, string>;
};

export const docSectionContent: Record<"fa" | "en", DocSectionUiContent> = {
  fa: {
    section: {
      featuresTitle: "ویژگی‌ها",
      howItWorksTitle: "نحوه کار",
      privacyTitle: "حریم خصوصی",
      openTool: "باز کردن ابزار",
    },
    categories: {
      ai: "آماده‌سازی برای هوش مصنوعی",
      pdf: "PDF",
      image: "تصویر",
      developer: "توسعه‌دهنده",
      excel: "اکسل",
      security: "امنیت",
      utility: "ابزارهای کاربردی",
      audio: "صوت",
      presentation: "پاورپوینت",
      text: "متن",
      other: "سایر",
    },
  },
  en: {
    section: {
      featuresTitle: "Features",
      howItWorksTitle: "How it works",
      privacyTitle: "Privacy",
      openTool: "Open tool",
    },
    categories: {
      ai: "AI preparation",
      pdf: "PDF",
      image: "Image",
      developer: "Developer",
      excel: "Excel",
      security: "Security",
      utility: "Utility",
      audio: "Audio",
      presentation: "PowerPoint",
      text: "Text",
      other: "Other",
    },
  },
};

export function useDocSectionContent(): DocSectionUiContent {
  const { locale } = useLanguage();
  return docSectionContent[locale];
}
