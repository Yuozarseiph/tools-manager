"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";
import rawContent from "./html-to-pptx.i18n.json";

type DocCategoryKey = "pdf" | "developer";

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

export interface HtmlToPptxToolContent extends BaseDocsFields {
  id: "html-to-pptx";
  ui: {
    upload: {
      title: string;
      subtitle: string;
    };
    editor: {
      title: string;
      placeholder: string;
      hint: string;
    };
    filename: {
      label: string;
    };
    buttons: {
      convertIdle: string;
      convertLoading: string;
    };
    progress: {
      idle: string;
      preparing: string;
      exporting: string;
      success: string;
    };
    errors: {
      invalidType: string;
      emptyContent: string;
      genericPrefix: string;
      unknown: string;
      noSlides: string;
      snapshotFallback: string;
    };
    preview: {
      title: string;
      empty: string;
    };
    guide: {
      title: string;
      items: string[];
    };
    labels: {
      themeColor: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: HtmlToPptxToolContent; en: HtmlToPptxToolContent }
const CONTENT_BY_LOCALE = rawContent as Record<Locale, HtmlToPptxToolContent>;

export function useHtmlToPptxContent(): HtmlToPptxToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale] ?? CONTENT_BY_LOCALE["fa"];
}
