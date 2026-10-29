"use client";

import { Layers, SlidersHorizontal, Sparkles, History, FileImage, Sliders, X } from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import EditorAdjustmentsPanel from "./EditorAdjustmentsPanel";
import EditorDocumentPanel from "./EditorDocumentPanel";
import EditorFiltersPanel from "./EditorFiltersPanel";
import EditorHistoryPanel from "./EditorHistoryPanel";
import EditorLayersPanel from "./EditorLayersPanel";
import EditorPropertiesPanel from "./EditorPropertiesPanel";

type PanelId = "layers" | "properties" | "document" | "adjustments" | "filters" | "history";

type TabSpec = { id: PanelId; label: string; icon: typeof Layers };

export default function EditorRightPanel({ editor, content, theme, panel, onPanelChange, mobileOpen, onMobileClose }: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
  panel: PanelId;
  onPanelChange: (panel: PanelId) => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const inspector: TabSpec[] = [
    { id: "properties", label: content.ui.panels.properties, icon: SlidersHorizontal },
    { id: "document", label: content.ui.panels.document, icon: FileImage },
    { id: "adjustments", label: content.ui.panels.adjustments, icon: Sparkles },
    { id: "filters", label: content.ui.panels.filters, icon: Sliders },
    { id: "history", label: content.ui.panels.history, icon: History },
  ];
  const mobile: TabSpec[] = [
    { id: "layers", label: content.ui.panels.layers, icon: Layers },
    ...inspector,
  ];
  const contentFor = (tab: PanelId) => {
    switch (tab) {
      case "layers": return <EditorLayersPanel editor={editor} content={content} theme={theme} />;
      case "properties": return <EditorPropertiesPanel editor={editor} content={content} theme={theme} />;
      case "document": return <EditorDocumentPanel editor={editor} content={content} theme={theme} />;
      case "adjustments": return <EditorAdjustmentsPanel editor={editor} content={content} theme={theme} />;
      case "filters": return <EditorFiltersPanel editor={editor} content={content} theme={theme} />;
      case "history": return <EditorHistoryPanel editor={editor} content={content} theme={theme} />;
    }
  };
  const tabBar = (tabs: TabSpec[]) => (
    <div className={`flex w-full shrink-0 overflow-x-auto border-b ${theme.border}`} role="tablist" aria-label={content.ui.panels.properties}>
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={panel === id}
          onClick={() => onPanelChange(id)}
          title={label}
          className={`flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 border-b-2 px-1.5 py-1.5 text-[10px] font-medium transition-colors ${panel === id ? `border-[var(--app-accent)] ${theme.accent}` : `border-transparent ${theme.textMuted} hover:${theme.secondary}`}`}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">{label}</span>
        </button>
      ))}
    </div>
  );
  const activeInspector = panel === "layers" ? "properties" : panel;

  return (
    <>
      {/* Wide screens: the layer list and inspector stay visible simultaneously. */}
      <aside className={`hidden min-h-0 shrink-0 flex-col overflow-hidden border-s lg:flex lg:h-full lg:w-[350px] xl:w-[368px] ${theme.border} ${theme.card}`} aria-label={content.ui.panels.layers}>
        <div className="flex min-h-0 flex-[0_0_40%] flex-col overflow-hidden border-b">
          <div className={`flex h-10 shrink-0 items-center gap-2 border-b px-3 text-xs font-semibold ${theme.border} ${theme.text}`}>
            <Layers className="h-4 w-4" />{content.ui.panels.layers}
            <span className={`ms-auto font-normal tabular-nums ${theme.textMuted}`}>{editor.doc?.layers.length ?? 0}</span>
          </div>
          <EditorLayersPanel editor={editor} content={content} theme={theme} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          {tabBar(inspector)}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{contentFor(activeInspector)}</div>
        </div>
      </aside>
      {/* Small screens: inspector is a closable bottom sheet, never steals canvas height. */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end lg:hidden" role="presentation">
          <button type="button" className="absolute inset-0 bg-black/55" aria-label={content.ui.header.closeInspector} onClick={onMobileClose} />
          <aside role="dialog" aria-modal="true" aria-label={content.ui.header.mobileInspector}
            className={`relative flex max-h-[min(76dvh,720px)] min-h-0 w-full flex-col overflow-hidden rounded-t-2xl border-t shadow-2xl ${theme.card} ${theme.border}`}
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <div className={`flex h-11 shrink-0 items-center justify-between gap-2 border-b px-4 ${theme.border} ${theme.text}`}>
              <strong className="flex items-center gap-2 text-xs font-semibold"><Layers className="h-4 w-4" />{content.ui.header.mobileInspector}</strong>
              <button type="button" onClick={onMobileClose} aria-label={content.ui.header.closeInspector}
                className={`grid h-8 w-8 place-items-center rounded-lg ${theme.textMuted}`}><X className="h-4 w-4" /></button>
            </div>
            {tabBar(mobile)}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{contentFor(panel)}</div>
          </aside>
        </div>
      )}
    </>
  );
}

export type { PanelId };
