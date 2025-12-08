"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./date-converter.i18n.json";

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

export interface DateConverterToolContent extends BaseDocsFields {
  id: "date-converter";
  ui: {
    modes: {
      shamsiToGregorian: string;
      gregorianToShamsi: string;
    };
    inputs: {
      dayLabel: string;
      monthLabel: string;
      yearLabel: string;
      placeholderShamsiYear: string;
      placeholderGregorianYear: string;
    };
    result: {
      title: string;
      invalid: string;
    };
  };
}

// ساختار فایل i18n: { fa: DateConverterToolContent; en: DateConverterToolContent }
const CONTENT_BY_LOCALE = rawContent as Record<
  Locale,
  DateConverterToolContent
>;

export function useDateConverterContent(): DateConverterToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
