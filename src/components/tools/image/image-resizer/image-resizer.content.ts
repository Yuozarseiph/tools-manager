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
      dropSubtitle: string;
      urlPlaceholder: string;
      urlButton: string;
      urlLoading: string;
      urlHint: string;
      urlError: string;
    };
    alerts: {
      error: string;
    };
    fileInfo: {
      originalDims: string;
      currentDims: string;
    };
    inputs: {
      widthLabel: string;
      heightLabel: string;
      widthPlaceholder: string;
      heightPlaceholder: string;
    };
    buttons: {
      clear: string;
      lockTitle: string;
      unlockTitle: string;
      resizeAndDownload: string;
      resetDims: string;
    };
    info: {
      aspectRatioLocked: string;
      aspectRatioUnlocked: string;
    };
  };
  page: {
    title: string;
    description: string;
  };
}

const CONTENT_BY_LOCALE = rawContent as Record<Locale, ImageResizerToolContent>;

export function useImageResizerContent(): ImageResizerToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
