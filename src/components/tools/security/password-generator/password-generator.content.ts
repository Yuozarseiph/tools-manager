"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./password-generator.i18n.json";

type DocCategoryKey = "security";

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

export interface PasswordGeneratorToolContent extends BaseDocsFields {
  id: "password-generator";
  ui: {
    tabs: {
      generate: string;
      analyze: string;
    };
    generate: {
      lengthLabel: string;
      options: {
        uppercase: string;
        lowercase: string;
        numbers: string;
        symbols: string;
      };
      strength: {
        weak: string;
        medium: string;
        strong: string;
      };
      regenerateTitle: string;
      copyTitle: string;
    };
    analyze: {
      inputPlaceholder: string;
      showTitle: string;
      hideTitle: string;
      messages: {
        weak: string;
        medium: string;
        strong: string;
      };
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// شکل فایل i18n: { fa: PasswordGeneratorToolContent; en: PasswordGeneratorToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, PasswordGeneratorToolContent>;

export function usePasswordGeneratorContent(): PasswordGeneratorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
