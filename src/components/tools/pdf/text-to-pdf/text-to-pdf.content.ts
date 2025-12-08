"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./text-to-pdf.i18n.json";

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

export interface TextToPdfToolContent extends BaseDocsFields {
  id: "text-to-pdf";
  ui: {
    toolbar: {
      alignLeftTitle: string;
      alignCenterTitle: string;
      alignRightTitle: string;
      generateButtonIdle: string;
      generateButtonLoading: string;
    };
    editor: {
      placeholder: string;
      counterSuffixChars: string;
      counterSeparator: string;
      counterSuffixLines: string;
    };
    guide: {
      title: string;
      items: string[];
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

// ساختار فایل i18n: { fa: TextToPdfToolContent; en: TextToPdfToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, TextToPdfToolContent>;

export function useTextToPdfContent(): TextToPdfToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
