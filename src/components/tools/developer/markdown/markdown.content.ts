"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./markdown.i18n.json";

type DocCategoryKey = "developer";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
}

export interface MarkdownToolContent extends BaseDocsFields {
  id: "markdown";
  ui: {
    editor: {
      title: string;
      placeholder: string;
    };
    buttons: {
      clear: string;
      copy: string;
    };
    preview: {
      title: string;
    };
    demo: {
      defaultMarkdown: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// شکل فایل i18n: { fa: MarkdownToolContent; en: MarkdownToolContent }
const CONTENT_BY_LOCALE = rawContent as Record<Locale, MarkdownToolContent>;

export function useMarkdownContent(): MarkdownToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
