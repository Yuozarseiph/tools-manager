"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./excel-chart.i18n.json";

type DocCategoryKey = "excel";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
}

export interface ExcelChartToolContent extends BaseDocsFields {
  id: "excel-chart";
  ui: {
    upload: {
      buttonInitial: string;
      buttonChange: string;
      acceptHint: string;
    };
    chartTypes: {
      bar: { label: string; title: string };
      line: { label: string; title: string };
      area: { label: string; title: string };
      pie: { label: string; title: string };
    };
    persianNumbers: {
      title: string;
      description: string;
    };
    mapping: {
      xAxisLabel: string;
      numericLabelBar: string;
      numericLabelArea: string;
      numericLabelSingle: string;
      numericPlaceholder: string;
    };
    settings: {
      title: string;
      rangeLabel: string;
      pieHint: string;
      rangeSummaryPrefix: string;
      rangeSummaryMiddle: string;
      rangeSummarySuffix: string;
    };
    zoom: {
      compact: string;
      expanded: string;
      pieDisabled: string;
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

// شکل فایل i18n: { fa: ExcelChartToolContent; en: ExcelChartToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, ExcelChartToolContent>;

export function useExcelChartContent(): ExcelChartToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
