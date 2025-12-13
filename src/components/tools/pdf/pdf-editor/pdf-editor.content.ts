"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";
import rawContent from "./pdf-editor.i18n.json";

interface BaseFields {
  id: string;
  category: "pdf";
  title: string;
  description: string;
  features: string[];
}

export interface PdfEditorToolContent extends BaseFields {
  id: "pdf-editor";
  ui: {
    upload: {
      title: string;
      subtitle: string;
    };
    file: {
      sizeUnit: string;
      removeTitle: string;
    };
    errors: {
      invalidType: string;
      loadFailed: string;
      noPages: string;
      noSelection: string;
      process: string;
      unknown: string;
    };
    mode: {
      keep: string;
      remove: string;
    };
    viewer: {
      title: string;
      tabs: {
        original: string;
        edited: string;
      };
      openInNewTabTitle: string;
      selectedBadge: string;
      pageLabel: string;
      mobile: {
        androidInlineNote: string;
        inlineNotSupported: string;
      };
    };

    progress: {
      loading: string;
      generating: string;
      preparingPreview: string;
    };

    buttons: {
      editIdle: string;
      editLoading: string;
      download: string;
      open: string;
      openPdf: string;
      newTab: string;
    };

    guide: {
      title: string;
      items: string[];
    };
  };
}
const CONTENT_BY_LOCALE = rawContent as Record<Locale, PdfEditorToolContent>;

export function usePdfEditorContent(): PdfEditorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
