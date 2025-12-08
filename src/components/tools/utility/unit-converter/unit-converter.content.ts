"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./unit-converter.i18n.json";

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

export interface UnitConverterToolContent extends BaseDocsFields {
  id: "unit-converter";
  ui: {
    categories: {
      length: {
        label: string;
        units: Record<string, string>;
      };
      mass: {
        label: string;
        units: Record<string, string>;
      };
      temperature: {
        label: string;
        units: Record<string, string>;
      };
    };
    input: {
      amountLabel: string;
      resultLabel: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: UnitConverterToolContent; en: UnitConverterToolContent }
const CONTENT_BY_LOCALE = rawContent as Record<
  Locale,
  UnitConverterToolContent
>;

export function useUnitConverterContent(): UnitConverterToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
