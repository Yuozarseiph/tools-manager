"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./image-compressor.i18n.json";

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

export interface ImageCompressorToolContent extends BaseDocsFields {
  id: "image-compressor";
  ui: {
    upload: {
      dropTitle: string;
    };
    fileInfo: {
      original: string;
      compressed: string;
      reductionSuffix: string;
    };
    settings: {
      title: string;
      qualityLabel: string;
    };
    buttons: {
      start: string;
      download: string;
    };
    alerts: {
      error: string;
    };
  };
}

// شکل فایل i18n: { fa: ImageCompressorToolContent; en: ImageCompressorToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, ImageCompressorToolContent>;

export function useImageCompressorContent(): ImageCompressorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
