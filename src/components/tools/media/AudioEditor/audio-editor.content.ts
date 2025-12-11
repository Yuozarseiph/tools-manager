"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./audio-editor.i18n.json";

type DocCategoryKey = "audio";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
}

export interface AudioEditorToolContent extends BaseDocsFields {
  id: "audio-editor";
  ui: {
    tabs: {
      trim: string;
      volume: string;
    };
    header: {
      smallTitle: string;
      subtitle: string;
    };
    trim: {
      upload: {
        title: string;
        description: string;
        button: string;
      };
      fileInfo: {
        totalDurationLabel: string;
        currentPositionLabel: string;
        selectionLabel: string;
        noFileTitle: string;
        noFileDescription: string;
      };
      transport: {
        playAll: string;
        stop: string;
        playHelper: string;
      };
      selection: {
        title: string;
        resetLabel: string;
        startLabel: string;
        endLabel: string;
        playSelectionPrefix: string;
        downloadIdle: string;
        downloadWorking: string;
      };
      fade: {
        title: string;
        description: string;
        fadeInLabel: string;
        fadeOutLabel: string;
        fadeInDurationLabel: string;
        fadeOutDurationLabel: string;
      };
      errors: {
        decode: string;
        export: string;
      };
      empty: {
        title: string;
        description: string;
      };
    };
    volume: {
      upload: {
        title: string;
        description: string;
        button: string;
      };
      fileInfo: {
        durationLabel: string;
        currentPositionLabel: string;
        noFileTitle: string;
        noFileDescription: string;
      };
      transport: {
        play: string;
        stop: string;
        helper: string;
      };
      controls: {
        title: string;
        description: string;
        gainLabel: string;
        normalizeLabel: string;
      };
      actions: {
        downloadIdle: string;
        downloadWorking: string;
      };
      errors: {
        decode: string;
        export: string;
      };
      empty: {
        title: string;
        description: string;
      };
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// شکل فایل i18n: { fa: AudioEditorToolContent; en: AudioEditorToolContent }
const CONTENT_BY_LOCALE = rawContent as Record<Locale, AudioEditorToolContent>;

export function useAudioEditorContent(): AudioEditorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
