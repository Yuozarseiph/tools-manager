"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./hash-generator.i18n.json";

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

export interface HashGeneratorToolContent extends BaseDocsFields {
  id: "hash-generator";
  ui: {
    input: {
      label: string;
      placeholder: string;
    };
    algorithms: {
      sha1: string;
      sha256: string;
      sha384: string;
      sha512: string;
    };
    hashRow: {
      empty: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: HashGeneratorToolContent; en: HashGeneratorToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, HashGeneratorToolContent>;

export function useHashGeneratorContent(): HashGeneratorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
