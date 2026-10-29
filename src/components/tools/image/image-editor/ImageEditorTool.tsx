"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle, CheckCircle2, Download, FilePlus2, ImagePlus, Info, Maximize2, Minimize2,
  MonitorUp, Scan, Undo2, Redo2, X, Keyboard, Layers3, ExternalLink, PanelRightOpen,
} from "lucide-react";

import { AccessibleInput } from "@/components/ui/AccessibleControls";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useImageEditorContent } from "./image-editor.content";
import { EDITOR_TOOLS } from "./editor-constants";
import type { EditorToolId } from "./editor-types";
import { useImageEditor } from "./useImageEditor";
import EditorCanvasStage from "./components/EditorCanvasStage";
import EditorEmptyState from "./components/EditorEmptyState";
import EditorExportDialog, { type EditorExportBackground, type EditorExportFormat } from "./components/EditorExportDialog";
import EditorOptionsBar from "./components/EditorOptionsBar";
import EditorRightPanel, { type PanelId } from "./components/EditorRightPanel";
import EditorToolbar from "./components/EditorToolbar";

const TOOL_BY_SHORTCUT = new Map<string, EditorToolId>(EDITOR_TOOLS.map((tool) => [tool.shortcut.toLowerCase(), tool.id]));

export default function ImageEditorTool() {
  const theme = useThemeColors();
  const content = useImageEditorContent();
  const editor = useImageEditor();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const placeRef = useRef<HTMLInputElement | null>(null);
  const [panel, setPanel] = useState<PanelId>("properties");
  const [wide, setWide] = useState(true);
  const [mobileInspectorOpen, setMobileInspectorOpen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [browserFullscreen, setBrowserFullscreen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [format, setFormat] = useState<EditorExportFormat>("png");
  const [quality, setQuality] = useState(92);
  const [background, setBackground] = useState<EditorExportBackground>("transparent");
  const [dragHover, setDragHover] = useState(false);
  const messages = content.ui.messages;
  const immersive = !!editor.doc && wide;

  // Portal eliminates transformed/stacking ancestors and puts the editor above site navigation.
  useEffect(() => { setPortalReady(true); }, []);
  useEffect(() => {
    if (!immersive || !portalReady) return;
    const oldBodyOverflow = document.body.style.overflow;
    const oldHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = oldBodyOverflow;
      document.documentElement.style.overflow = oldHtmlOverflow;
    };
  }, [immersive, portalReady]);

  // Adjust image to available canvas after the workbench is attached to the viewport.
  useEffect(() => {
    if (!immersive || !portalReady) return;
    const frame = window.requestAnimationFrame(() => editor.zoomFit());
    return () => window.cancelAnimationFrame(frame);
    // Keep zoom chosen by the user on ordinary state updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immersive, portalReady]);

  useEffect(() => {
    const changed = () => {
      const nowFullscreen = document.fullscreenElement === containerRef.current;
      setBrowserFullscreen(nowFullscreen);
      if (nowFullscreen) setFullscreenError(null);
      window.requestAnimationFrame(() => editor.zoomFit());
    };
    document.addEventListener("fullscreenchange", changed);
    return () => document.removeEventListener("fullscreenchange", changed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBrowserFullscreen = useCallback(() => {
    setFullscreenError(null);
    const element = containerRef.current;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => setFullscreenError(content.ui.header.fullscreenFailed));
      return;
    }
    if (!element || !element.requestFullscreen || !document.fullscreenEnabled) {
      setFullscreenError(content.ui.header.fullscreenUnsupported);
      return;
    }
    // Must be requested synchronously inside the click gesture, without awaiting React state changes.
    void element.requestFullscreen().catch((error: unknown) => {
      console.warn("Browser fullscreen rejected", error);
      setFullscreenError(content.ui.header.fullscreenFailed);
    });
  }, [content.ui.header.fullscreenFailed, content.ui.header.fullscreenUnsupported]);

  const onLocalFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (editor.doc && !window.confirm(content.ui.header.replaceWarning)) return;
    void editor.openFile(file, { open: messages.imageLoaded, psd: messages.psdLoaded });
  }, [editor, content.ui.header.replaceWarning, messages.imageLoaded, messages.psdLoaded]);

  const onPlaceFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    for (const file of files) void editor.placeImageFile(file, content.ui.header.placeImage);
  }, [content.ui.header.placeImage, editor]);

  const onDropImage = (event: DragEvent<HTMLDivElement>) => {
    if (!editor.doc || event.dataTransfer.types.includes("text/x-image-editor-layer")) return;
    event.preventDefault();
    setDragHover(false);
    const file = [...event.dataTransfer.files].find((item) => item.type.startsWith("image/"));
    if (file) void editor.placeImageFile(file, content.ui.header.placeImage);
  };

  useEffect(() => {
    const onPaste = (event: ClipboardEvent) => {
      if (!editor.doc) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      const file = Array.from(event.clipboardData?.items ?? []).map((item) => item.getAsFile()).find((f) => f?.type.startsWith("image/"));
      if (!file) return;
      event.preventDefault();
      void editor.placeImageFile(file, content.ui.header.placeImage);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [content.ui.header.placeImage, editor]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      if (!editor.doc || exportOpen) {
        if (event.key === "Escape" && exportOpen) setExportOpen(false);
        return;
      }
      const modifier = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();
      if (modifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) editor.redo(); else editor.undo();
        return;
      }
      if (modifier && key === "y") { event.preventDefault(); editor.redo(); return; }
      if (modifier && key === "a") { event.preventDefault(); editor.selectAll(); return; }
      if (modifier && key === "d") { event.preventDefault(); editor.deselect(); return; }
      if (modifier && key === "s") { event.preventDefault(); setExportOpen(true); return; }
      if (modifier && key === "j") { event.preventDefault(); editor.duplicateLayer(content.ui.layers.duplicate); return; }
      if (modifier && key === "0") { event.preventDefault(); editor.zoomFit(); return; }
      if (event.key === "Escape") {
        if (mobileInspectorOpen) { setMobileInspectorOpen(false); return; }
        if (fullscreenError) { setFullscreenError(null); return; }
        editor.deselect(); return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (editor.doc.selection) editor.deleteSelection(content.ui.properties.deleteSelection);
        else if (editor.activeLayer) editor.deleteLayer(content.ui.layers.delete);
        event.preventDefault();
        return;
      }
      if (event.key.startsWith("Arrow") && editor.activeLayer && !editor.activeLayer.locked) {
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        const dx = event.key === "ArrowLeft" ? -step : event.key === "ArrowRight" ? step : 0;
        const dy = event.key === "ArrowUp" ? -step : event.key === "ArrowDown" ? step : 0;
        editor.nudgeLayer(dx, dy);
        editor.recordHistory(content.ui.tools.move);
        return;
      }
      const selectedTool = TOOL_BY_SHORTCUT.get(key);
      if (selectedTool && !modifier && !event.altKey) { event.preventDefault(); editor.setTool(selectedTool); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [content.ui.layers.delete, content.ui.layers.duplicate, content.ui.properties.deleteSelection, content.ui.tools.move, editor, exportOpen, mobileInspectorOpen, fullscreenError]);

  const noticeText = editor.notice ? messages[editor.notice.key as keyof typeof messages] ?? editor.notice.key : "";

  const workbench = (
    <div ref={containerRef}
      data-image-editor-workspace={immersive ? "fullscreen-workspace" : "embedded"}
      style={immersive ? { zIndex: 2147483647, width: "100%", height: "100dvh", maxHeight: "100dvh" } : undefined}
      className={`flex min-h-0 min-w-0 flex-col ${immersive
        ? `fixed inset-0 overflow-hidden overscroll-none ${theme.bg}`
        : `relative w-full gap-4 ${theme.bg}`} ${theme.text}`}>
      <header className={`flex min-h-14 shrink-0 flex-col items-stretch justify-between gap-2 border-b px-2 py-2 sm:flex-row sm:items-center sm:px-4 ${theme.card} ${theme.border}`}>
        <div className="flex min-w-0 items-center gap-2">
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${theme.primary}`}><Layers3 className="h-4 w-4" aria-hidden="true" /></span>
          <div className="flex min-w-0 flex-col">
            <strong className={`max-w-32 truncate text-xs sm:max-w-48 ${theme.text}`} title={editor.doc?.name ?? content.ui.header.badge}>
              {editor.doc?.name ?? content.ui.header.badge}
            </strong>
            <span className={`whitespace-nowrap text-[10px] ${theme.textMuted}`}>
              {editor.doc ? `${editor.doc.width} × ${editor.doc.height} px · ${editor.doc.layers.length} ${content.ui.status.layers}` : content.ui.header.offline}
            </span>
          </div>
        </div>
        <div className="flex w-full min-w-0 items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-0.5 sm:w-auto sm:overflow-visible sm:pb-0">
          <AccessibleInput id="image-editor-open-file" type="file" accept="image/*,.psd,.psb" onChange={onLocalFile} className="hidden" />
          <label htmlFor="image-editor-open-file" title={content.ui.header.upload}
            className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium ${theme.card} ${theme.border} ${theme.text}`}>
            <ImagePlus className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="hidden sm:inline">{content.ui.header.upload}</span>
          </label>
          {editor.doc && <>
            <input ref={placeRef} type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp" className="hidden" onChange={onPlaceFile} />
            <button type="button" onClick={() => placeRef.current?.click()} title={content.ui.header.placeImage} aria-label={content.ui.header.placeImage}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-medium ${theme.card} ${theme.border} ${theme.text}`}>
              <ImagePlus className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="hidden sm:inline">{content.ui.header.placeImage}</span>
            </button>
            <button type="button" onClick={() => {
              if (!window.confirm(content.ui.header.replaceWarning)) return;
              if (document.fullscreenElement) void document.exitFullscreen();
              editor.closeDocument();
            }} title={content.ui.header.newDocument}
              className={`grid h-9 w-9 place-items-center rounded-lg border ${theme.card} ${theme.border} ${theme.text}`}>
              <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" disabled={!editor.canUndo} title={content.ui.history.undo} onClick={editor.undo}
              className={`grid h-9 w-9 place-items-center rounded-lg border disabled:opacity-40 ${theme.card} ${theme.border} ${theme.text}`}>
              <Undo2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" disabled={!editor.canRedo} title={content.ui.history.redo} onClick={editor.redo}
              className={`grid h-9 w-9 place-items-center rounded-lg border disabled:opacity-40 ${theme.card} ${theme.border} ${theme.text}`}>
              <Redo2 className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setExportOpen(true)}
              className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-[11px] font-semibold ${theme.primary}`}>
              <Download className="h-4 w-4" aria-hidden="true" />{content.ui.header.export}
            </button>
            <button type="button" onClick={() => setMobileInspectorOpen(true)}
              title={content.ui.header.mobileInspector} aria-label={content.ui.header.mobileInspector}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 lg:hidden ${theme.card} ${theme.border} ${theme.text}`}>
              <PanelRightOpen className="h-4 w-4" aria-hidden="true" /><span className="text-[11px]">{content.ui.panels.layers}</span>
            </button>
            <span className={`mx-0.5 hidden h-7 w-px border-s sm:block ${theme.border}`} />
            <button type="button" title={content.ui.header.fit} aria-label={content.ui.header.fit}
              onClick={editor.zoomFit} className={`grid h-9 w-9 place-items-center rounded-lg border ${theme.card} ${theme.border} ${theme.text}`}>
              <Scan className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => {
                if (wide && document.fullscreenElement) void document.exitFullscreen();
                setWide((value) => !value);
                setMobileInspectorOpen(false);
                window.requestAnimationFrame(() => editor.zoomFit());
              }}
              title={wide ? content.ui.header.compact : content.ui.header.workspace}
              aria-label={wide ? content.ui.header.compact : content.ui.header.workspace}
              className={`grid h-9 w-9 place-items-center rounded-lg border ${theme.card} ${theme.border} ${theme.text}`}>
              {wide ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
            </button>
            {wide && <button type="button" onClick={() => void toggleBrowserFullscreen()}
              title={browserFullscreen ? content.ui.header.exitFullscreen : content.ui.header.fullscreen}
              aria-label={browserFullscreen ? content.ui.header.exitFullscreen : content.ui.header.fullscreen}
              className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 ${theme.card} ${theme.border} ${theme.text}`}>
              {browserFullscreen ? <X className="h-4 w-4" aria-hidden="true" /> : <MonitorUp className="h-4 w-4" aria-hidden="true" />}
              <span className="hidden text-[11px] xl:inline">{browserFullscreen ? content.ui.header.exitFullscreen : content.ui.header.fullscreen}</span>
            </button>}
          </>}
        </div>
      </header>

      {!editor.doc ? (
        <EditorEmptyState editor={editor} content={content} theme={theme} />
      ) : (
        <>
          <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${immersive ? "" : `min-h-[540px] rounded-xl border lg:h-[calc(100dvh-14rem)] ${theme.border}`} lg:flex-row`}
            onDragOver={(event) => {
              if (!event.dataTransfer.types.includes("Files")) return;
              event.preventDefault(); setDragHover(true);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragHover(false);
            }}
            onDrop={onDropImage}>
            <EditorToolbar editor={editor} content={content} theme={theme} />
            <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <EditorOptionsBar editor={editor} content={content} theme={theme} />
              <EditorCanvasStage editor={editor} content={content} theme={theme} />
              {dragHover && <div className="pointer-events-none absolute inset-2 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--app-accent)] bg-black/20 p-5">
                <span className={`rounded-xl px-5 py-3 text-sm font-semibold shadow-lg ${theme.card} ${theme.text}`}>{content.ui.document.dropHint}</span>
              </div>}
            </main>
            <EditorRightPanel editor={editor} content={content} theme={theme} panel={panel} onPanelChange={setPanel}
              mobileOpen={mobileInspectorOpen} onMobileClose={() => setMobileInspectorOpen(false)} />
          </div>
          {immersive && <div className={`hidden shrink-0 items-center justify-between border-t px-4 py-1.5 text-[10px] lg:flex ${theme.card} ${theme.border} ${theme.textMuted}`}>
            <span className="inline-flex items-center gap-1.5"><Keyboard className="h-3.5 w-3.5" />{content.ui.header.shortcutHelp}</span>
            <span className="inline-flex items-center gap-1.5"><ExternalLink className="h-3.5 w-3.5" />{content.ui.header.offline}</span>
          </div>}
        </>
      )}

      <EditorExportDialog editor={editor} content={content} theme={theme} open={exportOpen}
        onClose={() => setExportOpen(false)} format={format} setFormat={setFormat} quality={quality}
        setQuality={setQuality} background={background} setBackground={setBackground} />

      {fullscreenError && <div role="alert" className={`absolute bottom-14 left-1/2 z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-xl border p-3 text-center text-xs shadow-xl ${theme.note.errorBg} ${theme.note.errorBorder} ${theme.note.errorText}`}>
        {fullscreenError}
        <button type="button" onClick={() => setFullscreenError(null)} aria-label={content.ui.export.close} className="ms-3 inline-flex align-middle"><X className="h-4 w-4" /></button>
      </div>}
      {editor.busy && <div className={`fixed bottom-4 end-4 z-[10020] rounded-xl border px-3 py-2 text-xs shadow-lg ${theme.card} ${theme.border} ${theme.text}`}>
        {content.ui.status.busy}
      </div>}
      <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-1/2 z-[10020] -translate-x-1/2">
        {editor.notice && <div className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-3 py-2 text-xs shadow-lg ${editor.notice.tone === "error"
          ? `${theme.note.errorBg} ${theme.note.errorBorder} ${theme.note.errorText}`
          : `${theme.note.infoBg} ${theme.note.infoBorder} ${theme.note.infoText}`}`}>
          {editor.notice.tone === "error" ? <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" /> :
            editor.notice.tone === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> : <Info className="h-4 w-4 shrink-0" aria-hidden="true" />}
          <span>{noticeText}{editor.notice.values ? ` — ${Object.entries(editor.notice.values).map(([key, value]) => `${key}: ${value}`).join(", ")}` : ""}</span>
        </div>}
      </div>
    </div>
  );

  // Mount directly below <body>, not inside the site's constrained content container.
  // React state and event handlers remain attached to the same editor component.
  return immersive && portalReady ? createPortal(workbench, document.body) : workbench;
}
