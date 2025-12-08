"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./excel-editor.i18n.json";

type DocCategoryKey = "excel";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
}

export interface ExcelEditorToolContent extends BaseDocsFields {
  id: "excel-editor";
  ui: {
    upload: {
      buttonInitial: string;
      buttonChange: string;
      acceptHint: string;
    };
    actions: {
      exportExcel: string;
      addRow: string;
      undoTitle: string;
      closeFileTitle: string;
      resetConfirm: string;
    };
    search: {
      placeholder: string;
    };
    table: {
      indexHeader: string;
      deleteHeader: string;
      deleteTooltip: string;
    };
    pagination: {
      summaryPrefix: string;
      summaryFromToSeparator: string;
      summaryOfWord: string;
      summarySuffix: string;
    };
    empty: {
      title: string;
      description: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// شکل فایل i18n: { fa: ExcelEditorToolContent; en: ExcelEditorToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, ExcelEditorToolContent>;

export function useExcelEditorContent(): ExcelEditorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
