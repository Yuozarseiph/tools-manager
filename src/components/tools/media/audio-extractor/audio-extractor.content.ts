"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";
import rawContent from "./audio-extractor.i18n.json";

type DocCategoryKey = "media";

interface BaseDocsFields {
  id: string;
  category: DocCategoryKey;
  title: string;
  description: string;
  features: string[];
}

export interface AudioExtractorToolContent extends BaseDocsFields {
  id: "audio-extractor";
  ui: {
    upload: {
      dropTitle: string;
      dropSubtitle: string;
      supportedFormats: string;
    };
    fileInfo: {
      fileName: string;
      fileSize: string;
      duration: string;
    };
    formats: {
      title: string;
      mp3: string;
      mp3Desc: string;
      wav: string;
      wavDesc: string;
      ogg: string;
      oggDesc: string;
      m4a: string;
      m4aDesc: string;
    };
    quality: {
      title: string;
      low: string;
      medium: string;
      high: string;
      bitrate: string;
    };
    buttons: {
      extract: string;
      extracting: string;
      download: string;
      clear: string;
      cancel: string;
    };
    status: {
      loading: string;
      ready: string;
      processing: string;
      completed: string;
      error: string;
    };
    warning: {
      title: string;
      description: string;
    };
    processing: {
      patience: string;
    };
  };
  page: {
    title: string;
    description: string;
  };
}

const CONTENT_BY_LOCALE = rawContent as Record<Locale, AudioExtractorToolContent>;

export function useAudioExtractorContent(): AudioExtractorToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
