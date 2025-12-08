"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./code-visualizer.i18n.json";

type DocCategoryKey = "developer";

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

export interface CodeVisualizerToolContent extends BaseDocsFields {
  id: "code-visualizer";
  ui: {
    header: {
      title: string;
      subtitleJs: string;
      subtitleCsharp: string;
    };
    languageToggle: {
      js: string;
      csharp: string;
    };
    layout: {
      hierarchical: string;
      tree: string;
      compact: string;
    };
    actions: {
      loadExample: string;
      refresh: string;
      fullscreen: string;
      exitFullscreen: string;
    };
    stats: {
      nodes: string;
      edges: string;
      depth: string;
      status: string;
      statusProcessing: string;
      statusReady: string;
      statusEmpty: string;
      statusPromptMobile: string;
      summaryPrefix: string;
      summaryNodesSuffix: string;
      summaryEdgesSuffix: string;
    };
    editor: {
      title: string;
      placeholderJs: string;
      placeholderCsharp: string;
      modeBadgeJs: string;
      modeBadgeCsharp: string;
      linesSuffix: string;
      hintTitle: string;
      hintJs: string;
      hintCsharp: string;
      debounceDesktop: string;
      debounceMobile: string;
    };
    graph: {
      building: string;
      emptyTitleMobile: string;
      emptyTitleDesktop: string;
      emptyDescription: string;
      backToEditorMobile: string;
      statusEmpty: string;
      statusWithNodesPrefix: string;
      statusNodesSuffix: string;
      dragHint: string;
    };
    mobile: {
      toggleEditor: string;
      toggleGraph: string;
      betterOnDesktop: string;
    };
    tips: {
      title: string;
      items: string[];
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: CodeVisualizerToolContent; en: CodeVisualizerToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, CodeVisualizerToolContent>;

export function useCodeVisualizerContent(): CodeVisualizerToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
