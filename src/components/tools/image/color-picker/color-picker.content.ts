"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./color-picker.i18n.json";

type DocCategoryKey = "image";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
  howItWorks?: string[];
  privacyNote?: string;
  technicalNote?: {
    title: string;
    content: string;
  };
}

export interface ColorPickerToolContent extends BaseDocsFields {
  id: "color-picker";
  ui: {
    format: {
      label: string;
    };
    upload: {
      dropTitle: string;
      dropSubtitle: string;
      loading: string;
    };
    currentColor: {
      title: string;
      copy: string;
      copied: string;
    };
    palette: {
      title: string;
      generateComplementaryTitle: string;
      downloadCssTitle: string;
    };
    history: {
      title: string;
      clearAll: string;
    };
  };
}

// شکل فایل i18n: { fa: ColorPickerToolContent; en: ColorPickerToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, ColorPickerToolContent>;

export function useColorPickerContent(): ColorPickerToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
