"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { Download, FilePlus2, ImagePlus, X, Wand2, AlertCircle, CheckCircle2, Info } from "lucide-react";

import { AccessibleInput } from "@/components/ui/AccessibleControls";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useImageEditorContent } from "./image-editor.content";
import { EDITOR_TOOLS } from "./editor-constants";
import type { EditorToolId } from "./editor-types";
import { useImageEditor } from "./useImageEditor";
import EditorCanvasStage from "./components/EditorCanvasStage";
import EditorEmptyState from "./components/EditorEmptyState";
import EditorExportDialog, {
  type EditorExportBackground,
  type EditorExportFormat,
} from "./components/EditorExportDialog";
import EditorOptionsBar from "./components/EditorOptionsBar";
import EditorRightPanel, { type PanelId } from "./components/EditorRightPanel";
import EditorToolbar from "./components/EditorToolbar";

const TOOL_BY_SHORTCUT = new Map<string, EditorToolId>(
  EDITOR_TOOLS.map((tool) => [tool.shortcut.toLowerCase(), tool.id])
);

export default function ImageEditorTool() {
  const theme = useThemeColors();
  const content = useImageEditorContent();
  const editor = useImageEditor();
  const [panel, setPanel] = useState<PanelId>("layers");
  const [exportOpen, setExportOpen] = useState(false);
  const [format, setFormat] = useState<EditorExportFormat>("png");
  const [quality, setQuality] = useState(92);
  const [background, setBackground] = useState<EditorExportBackground>("transparent");

  const messages = content.ui.messages;

  const onLocalFile = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file) return;
      void editor.openFile(file, { open: messages.imageLoaded, psd: messages.psdLoaded });
    },
    [editor, messages.imageLoaded, messages.psdLoaded]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (modifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) editor.redo();
        else editor.undo();
        return;
      }
      if (modifier && key === "y") {
        event.preventDefault();
        editor.redo();
        return;
      }
      if (modifier && key === "a") {
        event.preventDefault();
        editor.selectAll();
        return;
      }
      if (modifier && key === "d") {
        event.preventDefault();
        editor.deselect();
        return;
      }
      if (modifier && key === "s") {
        event.preventDefault();
        if (editor.doc) setExportOpen(true);
        return;
      }
      if (event.key === "Escape") {
        if (exportOpen) setExportOpen(false);
        else editor.deselect();
        return;
      }
      if (!editor.doc) return;

      if ((event.key === "Delete" || event.key === "Backspace") && editor.doc.selection) {
        event.preventDefault();
        editor.deleteSelection(content.ui.properties.deleteSelection);
        return;
      }

      if (event.key.startsWith("Arrow")) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        editor.nudgeLayer(dx, dy);
        editor.recordHistory(content.ui.tools.move);
        return;
      }

      const tool = TOOL_BY_SHORTCUT.get(key);
      if (tool && !modifier) {
        event.preventDefault();
        editor.setTool(tool);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [content.ui.properties.deleteSelection, content.ui.tools.move, editor, exportOpen]);

  const noticeText = editor.notice ? messages[editor.notice.key as keyof typeof messages] ?? editor.notice.key : "";

  return (
    <div className={`flex flex-col gap-4 ${theme.bg}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${theme.border} ${theme.textMuted}`}>
            <Wand2 className="h-3 w-3" aria-hidden="true" />
            {content.ui.header.badge}
          </span>
          <span className={`hidden text-[10px] ${theme.textMuted} sm:inline`}>{content.ui.header.offline}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <AccessibleInput
            id="image-editor-open-file"
            type="file"
            accept="image/*,.psd,.psb"
            onChange={onLocalFile}
            className="hidden"
          />
          <label
            htmlFor="image-editor-open-file"
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${theme.card} ${theme.border} ${theme.text}`}
          >
            <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
            {content.ui.header.upload}
          </label>

          {editor.doc && (
            <>
              <button
                type="button"
                onClick={editor.closeDocument}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${theme.card} ${theme.border} ${theme.text}`}
              >
                <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
                {content.ui.header.newDocument}
              </button>
              <button
                type="button"
                onClick={() => setExportOpen(true)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${theme.primary}`}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                {content.ui.header.export}
              </button>
              <button
                type="button"
                onClick={editor.closeDocument}
                aria-label={content.ui.header.close}
                title={content.ui.header.close}
                className={`grid h-8 w-8 place-items-center rounded-lg border ${theme.card} ${theme.border} ${theme.textMuted}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>

      {!editor.doc ? (
        <EditorEmptyState editor={editor} content={content} theme={theme} />
      ) : (
        <div
          className={`flex min-h-[520px] flex-col overflow-hidden rounded-2xl border md:h-[calc(100vh-13rem)] md:flex-row ${theme.card} ${theme.border}`}
        >
          <EditorToolbar editor={editor} content={content} theme={theme} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col max-md:h-[60vh]">
            <EditorOptionsBar editor={editor} content={content} theme={theme} />
            <EditorCanvasStage editor={editor} content={content} theme={theme} />
          </div>
          <EditorRightPanel
            editor={editor}
            content={content}
            theme={theme}
            panel={panel}
            onPanelChange={setPanel}
          />
        </div>
      )}

      <EditorExportDialog
        editor={editor}
        content={content}
        theme={theme}
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        format={format}
        setFormat={setFormat}
        quality={quality}
        setQuality={setQuality}
        background={background}
        setBackground={setBackground}
      />

      {editor.busy && (
        <div className={`fixed bottom-4 end-4 z-40 rounded-xl border px-3 py-2 text-[11px] shadow-lg ${theme.card} ${theme.border} ${theme.text}`}>
          {content.ui.status.busy}
        </div>
      )}

      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
        {editor.notice && (
          <div
            className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px] shadow-lg ${
              editor.notice.tone === "error"
                ? `${theme.note.errorBg} ${theme.note.errorBorder} ${theme.note.errorText}`
                : editor.notice.tone === "success"
                  ? `${theme.note.infoBg} ${theme.note.infoBorder} ${theme.note.infoText}`
                  : `${theme.note.infoBg} ${theme.note.infoBorder} ${theme.note.infoText}`
            }`}
          >
            {editor.notice.tone === "error" ? (
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : editor.notice.tone === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>
              {noticeText}
              {editor.notice.values
                ? ` — ${Object.entries(editor.notice.values)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(", ")}`
                : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
