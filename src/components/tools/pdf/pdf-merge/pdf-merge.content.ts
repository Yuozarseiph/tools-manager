"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./pdf-merge.i18n.json";

type DocCategoryKey = "pdf";

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

export interface PdfMergeToolContent extends BaseDocsFields {
  id: "pdf-merge";
  ui: {
    dropzone: {
      title: string;
      subtitle: string;
    };
    list: {
      title: string;
      countSuffix: string;
      clearAll: string;
      sizeUnit: string;
    };
    buttons: {
      mergeAndDownload: string;
      processing: string;
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

// ساختار فایل i18n: { fa: PdfMergeToolContent; en: PdfMergeToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, PdfMergeToolContent>;

export function usePdfMergeContent(): PdfMergeToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
