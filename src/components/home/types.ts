// components/home/types.ts

export type ToolsLayoutMode =
  | "list-compact"
  | "list-detail"
  | "grid-1"
  | "grid-2"
  | "grid-3"
  | "grid-4";
export type PinnedLayoutMode =
  | "horizontal-scroll"
  | "grid-small"
  | "grid-medium"
  | "grid-large"
  | "minimal";

export interface LayoutSettings {
  toolsLayout: ToolsLayoutMode;
  pinnedLayout: PinnedLayoutMode;
}

export const DEFAULT_LAYOUT: LayoutSettings = {
  toolsLayout: "grid-2",
  pinnedLayout: "grid-medium",
};

export const LAYOUT_STORAGE_KEY = "tm_layout_settings";

export type ToolWithText = import("@/data/tools").Tool & {
  title: string;
  description: string;
  badge?: string;
};

// گزینه‌های چیدمان برای موبایل (فقط ۴ گزینه کاربردی)
export const mobileToolsLayoutOptions = [
  { value: "list-compact", label: { fa: "لیست فشرده", en: "Compact List" } },
  { value: "list-detail", label: { fa: "لیست کامل", en: "Detailed List" } },
  { value: "grid-1", label: { fa: "تک ستونه", en: "Single Column" } },
  { value: "grid-2", label: { fa: "دو ستونه", en: "Two Columns" } },
] as const;
