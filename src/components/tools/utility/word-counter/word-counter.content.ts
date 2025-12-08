"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./word-counter.i18n.json";

type DocCategoryKey = "utility";

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

export interface WordCounterToolContent extends BaseDocsFields {
  id: "word-counter";
  ui: {
    editor: {
      title: string;
      placeholder: string;
    };
    buttons: {
      clearTitle: string;
      copy: string;
      copied: string;
    };
    stats: {
      title: string;
      words: string;
      chars: string;
      charsNoSpace: string;
      sentences: string;
      paragraphs: string;
    };
    readingTime: {
      label: string;
      unit: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: WordCounterToolContent; en: WordCounterToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, WordCounterToolContent>;

export function useWordCounterContent(): WordCounterToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
