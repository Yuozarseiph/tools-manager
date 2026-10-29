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
  Wrench,
  Volume2,
  Presentation,
  Calculator,
  Landmark,
  Gamepad2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getDocumentationEntries } from "./entries";

type Lang = "fa" | "en";

export type RawDocItem = {
  id: string;
  href?: string;
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

export interface DocSectionItem extends RawDocItem {
  icon: LucideIcon;
}

const CATEGORY_ICON: Record<string, LucideIcon> = {
  ai: BookOpen,
  developer: Code2,
  excel: Table,
  image: Image,
  pdf: FileText,
  security: ShieldCheck,
  utility: Wrench,
  audio: Volume2,
  presentation: Presentation,
  calculator: Calculator,
  banking: Landmark,
  game: Gamepad2,
};

export function useDocsContent(): DocSectionItem[] {
  const { locale } = useLanguage();
  const lang: Lang = locale === "en" ? "en" : "fa";

  return useMemo(
    () =>
      getDocumentationEntries(lang).map((doc) => ({
        ...doc,
        icon: CATEGORY_ICON[doc.category] ?? BookOpen,
      })),
    [lang]
  );
}
