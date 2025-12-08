"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./excel-viewer.i18n.json";

type DocCategoryKey = "excel";

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

export interface ExcelViewerToolContent extends BaseDocsFields {
  id: "excel-viewer";
  ui: {
    upload: {
      buttonInitial: string;
      acceptHint: string;
    };
    toolbar: {
      zoomOutTitle: string;
      zoomInTitle: string;
      fullscreenTitle: string;
      csvTitle: string;
      jsonTitle: string;
      closeTitle: string;
    };
    search: {
      placeholder: string;
    };
    sheets: {
      iconLabel: string;
    };
    summary: {
      totalPrefix: string;
      visiblePrefix: string;
    };
    empty: {
      title: string;
      description: string;
    };
    page: {
      title: string;
      description: string;
    };
    seo: {
      whyTitle: string;
      reasons: string[];
    };
  };
}

// شکل فایل i18n: { fa: ExcelViewerToolContent; en: ExcelViewerToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, ExcelViewerToolContent>;

export function useExcelViewerContent(): ExcelViewerToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
