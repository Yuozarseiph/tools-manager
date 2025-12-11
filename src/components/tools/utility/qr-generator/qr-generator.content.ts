"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";
import rawContent from "./qr-generator.i18n.json";

type DocCategoryKey = "developer" | "utility";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
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
    margin: {
      label: string;
      unit: string;
    };
    corners: {
      label: string;
      square: string;
      rounded: string;
    };
    logo: {
      label: string;
      selectButton: string;
      removeButton: string;
      sizeLabel: string;
      sizeUnit: string;
    };
    buttons: {
      downloadPng: string;
    };
  };
  page: {
    title: string;
    description: string;
  };
}

const content = rawContent as Record<Locale, QrGeneratorToolContent>;

export function useQrGeneratorContent(): QrGeneratorToolContent {
  const { locale } = useLanguage(); // اینجا رو تغییر دادم
  return content[locale] || content["en"];
}
