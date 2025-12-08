"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./qr-generator.i18n.json";

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

export interface QrGeneratorToolContent extends BaseDocsFields {
  id: "qr-generator";
  ui: {
    input: {
      label: string;
      placeholder: string;
    };
    colors: {
      fgLabel: string;
      bgLabel: string;
    };
    size: {
      label: string;
      unit: string;
    };
    buttons: {
      downloadPng: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: QrGeneratorToolContent; en: QrGeneratorToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, QrGeneratorToolContent>;

export function useQrGeneratorContent(): QrGeneratorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
