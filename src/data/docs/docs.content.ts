"use client";

import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Code2,
  Table,
  Image,
  FileText,
  ShieldCheck,
  MonitorSmartphone,
  Wrench,
  Volume2,
  Presentation,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import rawDocs from "./docs.content.json";

type Lang = "fa" | "en";

type RawDocItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  features?: string[];
  howItWorks?: string[];
  privacyNote?: string;
  technicalNote?: {
    title: string;
    content: string;
  };
};

const DOCS_RAW = rawDocs as {
  fa: RawDocItem[];
  en: RawDocItem[];
};

export interface DocSectionItem extends RawDocItem {
  icon: LucideIcon;
}

const CATEGORY_ICON: Record<string, LucideIcon> = {
  developer: Code2,
  excel: Table,
  image: Image,
  pdf: FileText,
  security: ShieldCheck,
  system: MonitorSmartphone,
  utility: Wrench,
  audio: Volume2,
  presentation: Presentation,
};

export function useDocsContent(): DocSectionItem[] {
  const { locale } = useLanguage();
  const lang: Lang = locale === "en" ? "en" : "fa";

  return useMemo(
    () =>
      DOCS_RAW[lang].map((doc) => ({
        ...doc,
        icon: CATEGORY_ICON[doc.category] ?? BookOpen,
      })),
    [lang]
  );
}
