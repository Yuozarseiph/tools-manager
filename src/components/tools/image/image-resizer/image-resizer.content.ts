"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./image-resizer.i18n.json";

type DocCategoryKey = "image";

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

export interface ImageResizerToolContent extends BaseDocsFields {
  id: "image-resizer";
  ui: {
    upload: {
      dropTitle: string;
    };
    fileInfo: {
      originalDims: string;
    };
    inputs: {
      widthLabel: string;
      heightLabel: string;
    };
    buttons: {
      lockTitle: string;
      resizeAndDownload: string;
      clear: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: ImageResizerToolContent; en: ImageResizerToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, ImageResizerToolContent>;

export function useImageResizerContent(): ImageResizerToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
