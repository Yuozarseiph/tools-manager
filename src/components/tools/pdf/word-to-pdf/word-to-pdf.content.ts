"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./word-to-pdf.i18n.json";

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

export interface WordToPdfToolContent extends BaseDocsFields {
  id: "word-to-pdf";
  ui: {
    upload: {
      title: string;
      subtitle: string;
    };
    file: {
      sizeUnit: string;
      removeTitle: string;
    };
    errors: {
      invalidType: string;
      emptyContent: string;
      iframeAccess: string;
      genericPrefix: string;
      unknown: string;
    };
    progress: {
      idle: string;
      reading: string;
      converting: string;
      rendering: string;
      generating: string;
      success: string;
    };
    buttons: {
      convertIdle: string;
      convertLoading: string;
      manualDownload: string;
      convertAgain?: string;
    };
    preview?: {
      title?: string;
      liveLabel?: string;
      empty?: string;
    };
    guide: {
      title: string;
      items: string[];
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: WordToPdfToolContent; en: WordToPdfToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, WordToPdfToolContent>;

export function useWordToPdfContent(): WordToPdfToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
