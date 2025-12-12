"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./excel-editor.i18n.json";

type DocCategoryKey = "excel";
type FilterOpKey = "contains" | "equals" | "startsWith" | "gt" | "lt" | "between";

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
    upload: { buttonInitial: string; buttonChange: string; acceptHint: string };
    actions: {
      exportExcel: string;
      addRow: string;
      undoTitle: string;
      closeFileTitle: string;
      resetConfirm: string;
      fullscreenEnterTitle: string;
      fullscreenExitTitle: string;
      copy: string;
      copied: string;
    };
    search: { placeholder: string };
    filter: {
      title: string;
      noFilter: string;
      columnPlaceholder: string;
      opPlaceholder: string;
      valuePlaceholder: string;
      value2Placeholder: string;
      clear: string;
      rowsLabel: string;
      ofLabel: string;
      sizeLabel: string;
      typeNumber: string;
      typeText: string;
      ops: Record<FilterOpKey, string>;
    };
    sort: {
      title: string;
      noSort: string;
      directionAsc: string;
      directionDesc: string;
      clear: string;
    };
    sum: {
      title: string;
      modeColumn: string;
      modeRow: string;
      rowNumberLabel: string;
      rowNumberPlaceholder: string;
      rangeRowsTitle: string;
      rangeColsTitle: string;
      from: string;
      to: string;
      resultLabel: string;
      countedLabel: string;
      copyResult: string;
    };
    export: {
      title: string;
      rangeTitle: string;
      fromRowPlaceholder: string;
      toRowPlaceholder: string;
      filteredButton: string;
      rangeButton: string;
    };
    table: { indexHeader: string; deleteHeader: string; deleteTooltip: string };
    pagination: {
      summaryPrefix: string;
      summaryFromToSeparator: string;
      summaryOfWord: string;
      summarySuffix: string;
      rowsPerPageLabel: string;
      perPageSuffix: string;
    };
    empty: { title: string; description: string };
    page: { title: string; description: string };
  };
}

const CONTENT_BY_LOCALE = rawContent as Record<Locale, ExcelEditorToolContent>;

export function useExcelEditorContent(): ExcelEditorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
