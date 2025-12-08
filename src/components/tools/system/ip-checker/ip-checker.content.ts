"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./ip-checker.i18n.json";

type DocCategoryKey = "system";

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

export interface IPCheckerToolContent extends BaseDocsFields {
  id: "ip-checker";
  ui: {
    main: {
      loading: string;
      error: string;
      retry: string;
      refreshTitle: string;
      publicIpLabel: string;
    };
    details: {
      countryTitle: string;
      regionTitle: string;
      coordsTitle: string;
      ispTitle: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: IPCheckerToolContent; en: IPCheckerToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, IPCheckerToolContent>;

export function useIPCheckerContent(): IPCheckerToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
