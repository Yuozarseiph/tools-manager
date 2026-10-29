"use client";

import { useEffect, useState } from "react";
import { ArrowDown, Check, FlipHorizontal, FlipVertical, Link2, RotateCcw, RotateCw, Trash2, Unlink2 } from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import { MiniButton, NumberRow, PanelSection, TextRow } from "./EditorControls";

export default function EditorDocumentPanel({ editor, content, theme }: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const doc = editor.doc;
  const [width, setWidth] = useState(doc?.width ?? 1920);
  const [height, setHeight] = useState(doc?.height ?? 1080);
  const [locked, setLocked] = useState(true);
  const [name, setName] = useState(doc?.name ?? "");
  useEffect(() => {
    if (doc) { setWidth(doc.width); setHeight(doc.height); setName(doc.name); }
  }, [doc?.name, doc?.width, doc?.height]);
  if (!doc) return null;
  const labels = content.ui.properties;
  const ratio = doc.width / Math.max(1, doc.height);
  const onWidth = (next: number) => {
    setWidth(next);
    if (locked) setHeight(Math.max(1, Math.round(next / ratio)));
  };
  const onHeight = (next: number) => {
    setHeight(next);
    if (locked) setWidth(Math.max(1, Math.round(next * ratio)));
  };
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-3">
      <PanelSection title={labels.documentSection} theme={theme}>
        <TextRow label={content.ui.document.name} value={name} theme={theme} onChange={setName}
          onCommit={() => { if (name.trim() && name !== doc.name) editor.renameDocument(name); }} />
        <div className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
          <NumberRow label={labels.docWidth} value={width} min={1} max={4096} theme={theme} onChange={onWidth} />
          <NumberRow label={labels.docHeight} value={height} min={1} max={4096} theme={theme} onChange={onHeight} />
          <button type="button" aria-pressed={locked} aria-label={content.ui.document.lockRatio}
            title={content.ui.document.lockRatio} onClick={() => setLocked((v) => !v)}
            className={`grid h-9 w-9 place-items-center rounded-lg border ${theme.border} ${theme.bg} ${theme.text}`}>
            {locked ? <Link2 className="h-4 w-4" /> : <Unlink2 className="h-4 w-4" />}
          </button>
        </div>
        <span className={`text-[10px] ${theme.textMuted}`}>{content.ui.document.resizeHint}</span>
        <MiniButton theme={theme} onClick={() => editor.resizeImage(width, height, labels.applyResize)}
          disabled={width === doc.width && height === doc.height} title={labels.applyResize}>
          <Check className="h-3.5 w-3.5" />{labels.applyResize}
        </MiniButton>
      </PanelSection>
      <PanelSection title={content.ui.document.transform} theme={theme}>
        <div className="grid grid-cols-2 gap-2">
          <MiniButton theme={theme} onClick={() => editor.rotateImage("ccw", labels.rotateLeft)} title={labels.rotateLeft}>
            <RotateCcw className="h-3.5 w-3.5" />{labels.rotateLeft}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.rotateImage("cw", labels.rotateRight)} title={labels.rotateRight}>
            <RotateCw className="h-3.5 w-3.5" />{labels.rotateRight}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.flipImage("horizontal", labels.flipH)} title={labels.flipH}>
            <FlipHorizontal className="h-3.5 w-3.5" />{labels.flipH}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.flipImage("vertical", labels.flipV)} title={labels.flipV}>
            <FlipVertical className="h-3.5 w-3.5" />{labels.flipV}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.rotateImage("180", labels.rotate180)} title={labels.rotate180}>
            {labels.rotate180}
          </MiniButton>
        </div>
      </PanelSection>
      <PanelSection title={labels.selectionSection} theme={theme}>
        <div className="grid grid-cols-2 gap-2">
          <MiniButton theme={theme} onClick={editor.selectAll} title={labels.selectAll}>{labels.selectAll}</MiniButton>
          <MiniButton theme={theme} onClick={editor.deselect} disabled={!doc.selection} title={labels.deselect}>{labels.deselect}</MiniButton>
          <MiniButton theme={theme} onClick={() => editor.deleteSelection(labels.deleteSelection)} disabled={!doc.selection} title={labels.deleteSelection} danger>
            <Trash2 className="h-3.5 w-3.5" />{labels.deleteSelection}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.fillSelection(editor.foregroundColor, labels.fillSelection)} disabled={!doc.selection} title={labels.fillSelection}>
            <ArrowDown className="h-3.5 w-3.5" />{labels.fillSelection}
          </MiniButton>
        </div>
        <p className={`text-[11px] ${theme.textMuted}`}>{labels.selectionInfo}: {doc.selection
          ? `${Math.round(doc.selection.bounds.width)} × ${Math.round(doc.selection.bounds.height)} px`
          : labels.none}</p>
      </PanelSection>
    </div>
  );
}
