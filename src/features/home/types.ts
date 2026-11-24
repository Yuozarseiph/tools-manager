// components/home/types.ts

export type ToolsLayoutMode =
  | "list-compact"
  | "list-detail"
  | "grid-1"
  | "grid-2"
  | "grid-3"
  | "grid-4";
export type MobileToolsLayoutMode = Exclude<ToolsLayoutMode, "grid-3" | "grid-4">;

export function isMobileToolsLayout(layout: ToolsLayoutMode): layout is MobileToolsLayoutMode {
  return layout === "list-compact" || layout === "list-detail" || layout === "grid-1" || layout === "grid-2";
}
export type PinnedLayoutMode =
  | "horizontal-scroll"
  | "grid-small"
  | "grid-medium"
  | "grid-large"
  | "minimal";

export interface LayoutSettings {
  toolsLayout: ToolsLayoutMode;
  mobileToolsLayout?: MobileToolsLayoutMode;
  pinnedLayout: PinnedLayoutMode;
}

export const DEFAULT_LAYOUT: LayoutSettings = {
  toolsLayout: "grid-2",
  pinnedLayout: "grid-medium",
};

export const LAYOUT_STORAGE_KEY = "tm_layout_settings";

export type ToolWithText = import("@/config/tools").Tool & {
  title: string;
  description: string;
  badge?: string;
};
