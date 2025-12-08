"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./json-formatter.i18n.json";

type DocCategoryKey = "developer";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
}

export interface JsonFormatterToolContent extends BaseDocsFields {
  id: "json-formatter";
  ui: {
    upload: {
      button: string;
      sizeHintPrefix: string;
    };
    toolbar: {
      minify: string;
      prettify: string;
      clear: string;
    };
    input: {
      placeholder: string;
    };
    error: {
      prefix: string;
    };
    tabs: {
      code: string;
      graph: string;
    };
    output: {
      copyTitle: string;
      downloadTitle: string;
    };
    codeView: {
      placeholder: string;
    };
    graphView: {
      emptyText: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// شکل فایل i18n: { fa: JsonFormatterToolContent; en: JsonFormatterToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, JsonFormatterToolContent>;

export function useJsonFormatterContent(): JsonFormatterToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
