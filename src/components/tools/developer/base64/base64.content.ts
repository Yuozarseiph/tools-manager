"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./base64.i18n.json";

type DocCategoryKey = "developer";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
}

export interface Base64ToolContent extends BaseDocsFields {
  id: "base64";
  ui: {
    input: {
      labelPlain: string;
      labelBase64: string;
      badge: string;
      placeholderPlain: string;
      placeholderBase64: string;
    };
    output: {
      labelPlain: string;
      labelBase64: string;
      badge: string;
      placeholder: string;
    };
    buttons: {
      swapTitle: string;
      copy: string;
      copied: string;
    };
    errors: {
      invalid: string;
    };
  };
}

// شکل فایل i18n: { fa: Base64ToolContent; en: Base64ToolContent }
const CONTENT_BY_LOCALE = rawContent as Record<Locale, Base64ToolContent>;

export function useBase64Content(): Base64ToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
