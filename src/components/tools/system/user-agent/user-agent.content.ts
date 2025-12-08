"use client";

import type { Locale } from "@/context/LanguageContext";
import { useLanguage } from "@/context/LanguageContext";

import rawContent from "./user-agent.i18n.json";

type DocCategoryKey = "system";

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

export interface UserAgentToolContent extends BaseDocsFields {
  id: "user-agent";
  ui: {
    raw: {
      title: string;
      copy: string;
      copied: string;
    };
    cards: {
      browser: {
        title: string;
        enginePrefix: string;
      };
      os: {
        title: string;
        archPrefix: string;
      };
      device: {
        title: string;
        fallback: string;
        desktopLabel: string;
      };
      cpu: {
        title: string;
        fallback: string;
        coresSuffix: string;
      };
    };
    details: {
      title: string;
      language: string;
      online: string;
      onlineYes: string;
      onlineNo: string;
      cookies: string;
      cookiesYes: string;
      cookiesNo: string;
      screenSize: string;
      colorDepth: string;
      colorDepthSuffix: string;
      platform: string;
    };
    page: {
      title: string;
      description: string;
    };
  };
}

// ساختار فایل i18n: { fa: UserAgentToolContent; en: UserAgentToolContent }
const CONTENT_BY_LOCALE =
  rawContent as Record<Locale, UserAgentToolContent>;

export function useUserAgentContent(): UserAgentToolContent {
  const { locale } = useLanguage();
  return CONTENT_BY_LOCALE[locale];
}
