import { useLanguage } from "@/context/LanguageContext";
import i18nData from "./image-to-svg.i18n.json";

export type ImageToSvgToolContent = {
  ui: {
    upload: {
      title: string;
      subtitle: string;
    };
    file: {
      sizeUnit: string;
      removeTitle: string;
    };
    buttons: {
      convertIdle: string;
      convertLoading: string;
      manualDownload?: string;
      convertAgain?: string;
    };
    errors: {
      genericPrefix: string;
      invalidType: string;
      emptyContent: string;
      unknown: string;
      loadImage: string;
    };
    preview: {
      title: string;
      originalTitle: string;
      svgTitle: string;
      empty: string;
    };
    guide: {
      title: string;
      items: string[];
    };
    progress: {
      idle: string;
      reading: string;
      converting: string;
      rendering: string;
      generating: string;
      success: string;
    };
    alerts: {
      heavyImageTitle: string;
      heavyImageBody: string;
      heavyImageNote: string;
    };
  };
};

type ImageToSvgI18n = typeof i18nData;
type LocaleKey = keyof ImageToSvgI18n; // "fa" | "en"

export function useImageToSvgContent(): ImageToSvgToolContent {
  const { locale } = useLanguage();
  const langKey: LocaleKey = locale === "en" ? "en" : "fa";
  const data = (i18nData as ImageToSvgI18n)[langKey];

  return {
    ui: data.ui,
  };
}
