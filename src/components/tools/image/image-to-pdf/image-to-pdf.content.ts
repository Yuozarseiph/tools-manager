"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./image-to-pdf.i18n.json";

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

export interface ImageToPdfToolContent extends BaseDocsFields {
  id: "image-to-pdf";
  ui: {
    upload: {
      selectText: string;
      dropHint: string;
    };
    list: {
      title: string;
      countSuffix: string;
      clearAll: string;
      sizeUnit: string;
    };
    buttons: {
      convert: string;
      converting: string;
      download: string;
    };
    result: {
      ready: string;
    };
    alerts: {
      error: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: ImageToPdfToolContent; en: ImageToPdfToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, ImageToPdfToolContent>;

export function useImageToPdfContent(): ImageToPdfToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
