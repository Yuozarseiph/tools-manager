"use client";

import { Layers, SlidersHorizontal, Sparkles, History } from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import EditorAdjustmentsPanel from "./EditorAdjustmentsPanel";
import EditorFiltersPanel from "./EditorFiltersPanel";
import EditorHistoryPanel from "./EditorHistoryPanel";
import EditorLayersPanel from "./EditorLayersPanel";
import EditorPropertiesPanel from "./EditorPropertiesPanel";

type PanelId = "layers" | "properties" | "adjustments" | "filters" | "history";

export default function EditorRightPanel({
  editor,
  content,
  theme,
  panel,
  onPanelChange,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
  panel: PanelId;
  onPanelChange: (panel: PanelId) => void;
}) {
  const tabs: { id: PanelId; label: string; icon: typeof Layers }[] = [
    { id: "layers", label: content.ui.panels.layers, icon: Layers },
    { id: "properties", label: content.ui.panels.properties, icon: SlidersHorizontal },
    { id: "adjustments", label: content.ui.panels.adjustments, icon: Sparkles },
    { id: "filters", label: content.ui.panels.filters, icon: SlidersHorizontal },
    { id: "history", label: content.ui.panels.history, icon: History },
  ];

  return (
    <aside className={`flex max-h-[480px] w-full shrink-0 flex-col border-t md:max-h-none md:w-80 md:border-s md:border-t-0 ${theme.border} ${theme.card}`}>
      <div className={`flex overflow-x-auto border-b ${theme.border}`} role="tablist" aria-label={content.ui.panels.layers}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = panel === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onPanelChange(tab.id)}
              title={tab.label}
              className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium transition-colors ${
                active ? `border-b-2 border-[var(--app-accent)] ${theme.accent}` : `${theme.textMuted}`
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:max-h-[calc(100vh-9rem)]">
        {panel === "layers" && <EditorLayersPanel editor={editor} content={content} theme={theme} />}
        {panel === "properties" && <EditorPropertiesPanel editor={editor} content={content} theme={theme} />}
        {panel === "adjustments" && <EditorAdjustmentsPanel editor={editor} content={content} theme={theme} />}
        {panel === "filters" && <EditorFiltersPanel editor={editor} content={content} theme={theme} />}
        {panel === "history" && <EditorHistoryPanel editor={editor} content={content} theme={theme} />}
      </div>
    </aside>
  );
}

export type { PanelId };
