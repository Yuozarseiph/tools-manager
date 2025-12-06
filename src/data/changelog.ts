// data/changelog.ts
export type ChangelogCategory = "added" | "improved" | "fixed";
export type ChangelogType = "release" | "update" | "fix";

export type ChangelogEntry = {
  version: string;
  date: string;
  type: ChangelogType;
  changes: {
    category: ChangelogCategory;
    items: string[];
  }[];
};

import faLog from "./changelog/falog.json";
import enLog from "./changelog/enlog.json";
import type { Locale } from "@/context/LanguageContext";

export const CHANGELOG_BY_LOCALE: Record<Locale, ChangelogEntry[]> = {
  fa: faLog as ChangelogEntry[],
  en: enLog as ChangelogEntry[],
};
