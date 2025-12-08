"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./image-converter.i18n.json";

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

export interface ImageConverterToolContent extends BaseDocsFields {
  id: "image-converter";
  ui: {
    upload: {
      dropTitle: string;
      dropSubtitle: string;
      addMore: string;
      counterSuffix: string;
    };
    gallery: {
      sizeUnit: string;
    };
    formats: {
      title: string;
      jpegDesc: string;
      pngDesc: string;
      webpDesc: string;
      avifDesc: string;
      gifDesc: string;
      bmpDesc: string;
    };
    quality: {
      label: string;
      low: string;
      high: string;
    };
    buttons: {
      convertSingle: string;
      convertMulti: string;
      processing: string;
      clearAll: string;
    };
    alerts: {
      error: string;
    };
    page: {
      title: string;
      description: string;
      subtitle: string;
    };
  };
}

// ساختار فایل i18n: { fa: ImageConverterToolContent; en: ImageConverterToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, ImageConverterToolContent>;

export function useImageConverterContent(): ImageConverterToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
