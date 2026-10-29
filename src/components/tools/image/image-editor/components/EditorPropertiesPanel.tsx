"use client";

import { useState } from "react";
import {
  ArrowDown,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  Trash2,
  Check,
} from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import {
  adjustmentDefinition,
  EDITOR_FONTS,
  EDITOR_FONT_WEIGHTS,
} from "../editor-constants";
import type {
  EditorAdjustmentKind,
  EditorFontWeight,
  EditorShapeKind,
  EditorTextAlign,
} from "../editor-types";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import {
  ColorRow,
  MiniButton,
  NumberRow,
  PanelSection,
  Segmented,
  SelectRow,
  SliderRow,
  TextRow,
} from "./EditorControls";

function DocumentResizeControls({
  width,
  height,
  labels,
  theme,
  onApply,
}: {
  width: number;
  height: number;
  labels: ImageEditorContent["ui"]["properties"];
  theme: ThemePalette;
  onApply: (width: number, height: number) => void;
}) {
  const [nextWidth, setNextWidth] = useState(width);
  const [nextHeight, setNextHeight] = useState(height);

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <NumberRow label={labels.docWidth} value={nextWidth} min={1} theme={theme} onChange={setNextWidth} />
        <NumberRow label={labels.docHeight} value={nextHeight} min={1} theme={theme} onChange={setNextHeight} />
      </div>
      <MiniButton theme={theme} onClick={() => onApply(nextWidth, nextHeight)} title={labels.applyResize}>
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        {labels.applyResize}
      </MiniButton>
    </>
  );
}

export default function EditorPropertiesPanel({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const doc = editor.doc;
  const active = editor.activeLayer;
  const labels = content.ui.properties;

  if (!doc) return null;

  const commit = (label: string) => editor.recordHistory(label);
  const patch = (values: Record<string, unknown>) => {
    if (!active) return;
    editor.patchLayer(active.id, values);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-3">
      {!active && <p className={`text-[11px] ${theme.textMuted}`}>{labels.empty}</p>}

      {active && (
        <>
          <PanelSection title={labels.layerSection} theme={theme}>
            <TextRow
              label={labels.name}
              value={active.name}
              theme={theme}
              onChange={(value) => patch({ name: value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <NumberRow label={labels.x} value={Math.round(active.x)} theme={theme} onChange={(value) => patch({ x: value })} onCommit={() => commit(labels.position)} />
              <NumberRow label={labels.y} value={Math.round(active.y)} theme={theme} onChange={(value) => patch({ y: value })} onCommit={() => commit(labels.position)} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberRow
                label={labels.rotation}
                value={Math.round((active.rotation * 180) / Math.PI)}
                theme={theme}
                onChange={(value) => patch({ rotation: (value * Math.PI) / 180 })}
                onCommit={() => commit(labels.rotation)}
              />
              <div />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <NumberRow label={labels.scaleX} value={Math.round(active.scaleX * 100) / 100} step={0.05} theme={theme} onChange={(value) => patch({ scaleX: value || 1 })} onCommit={() => commit(labels.scaleX)} />
              <NumberRow label={labels.scaleY} value={Math.round(active.scaleY * 100) / 100} step={0.05} theme={theme} onChange={(value) => patch({ scaleY: value || 1 })} onCommit={() => commit(labels.scaleY)} />
            </div>
            <SliderRow
              label={labels.opacity}
              value={Math.round(active.opacity * 100)}
              min={0}
              max={100}
              suffix="%"
              theme={theme}
              onChange={(value) => patch({ opacity: value / 100 })}
              onCommit={() => commit(labels.opacity)}
            />
          </PanelSection>

          {active.kind === "text" && (
            <PanelSection title={labels.textSection} theme={theme}>
              <TextRow
                label={labels.text}
                value={active.text}
                textarea
                theme={theme}
                onChange={(value) => patch({ text: value })}
              />
              <SelectRow
                label={labels.font}
                value={active.fontFamily}
                theme={theme}
                options={EDITOR_FONTS.map((font) => ({ value: font, label: font }))}
                onChange={(value) => patch({ fontFamily: value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <NumberRow
                  label={labels.fontSize}
                  value={Math.round(active.fontSize)}
                  min={1}
                  theme={theme}
                  onChange={(value) => patch({ fontSize: value })}
                  onCommit={() => commit(labels.fontSize)}
                />
                <SelectRow
                  label={labels.fontWeight}
                  value={active.fontWeight}
                  theme={theme}
                  options={EDITOR_FONT_WEIGHTS.map((weight) => ({ value: weight, label: weight }))}
                  onChange={(value) => patch({ fontWeight: value as EditorFontWeight })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Segmented
                  label={labels.fontStyle}
                  value={active.fontStyle}
                  theme={theme}
                  options={[
                    { value: "normal", label: labels.styleNormal },
                    { value: "italic", label: labels.styleItalic },
                  ]}
                  onChange={(value) => patch({ fontStyle: value })}
                />
                <Segmented
                  label={labels.align}
                  value={active.align}
                  theme={theme}
                  options={[
                    { value: "left" as EditorTextAlign, label: labels.alignLeft },
                    { value: "center" as EditorTextAlign, label: labels.alignCenter },
                    { value: "right" as EditorTextAlign, label: labels.alignRight },
                  ]}
                  onChange={(value) => patch({ align: value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <NumberRow
                  label={labels.lineHeight}
                  value={Math.round(active.lineHeight * 100) / 100}
                  step={0.05}
                  theme={theme}
                  onChange={(value) => patch({ lineHeight: value || 1 })}
                  onCommit={() => commit(labels.lineHeight)}
                />
                <NumberRow
                  label={labels.letterSpacing}
                  value={Math.round(active.letterSpacing)}
                  theme={theme}
                  onChange={(value) => patch({ letterSpacing: value })}
                  onCommit={() => commit(labels.letterSpacing)}
                />
              </div>
              <ColorRow label={labels.color} value={active.color} theme={theme} onChange={(value) => patch({ color: value })} />
              <ColorRow label={labels.strokeColor} value={active.strokeColor} theme={theme} onChange={(value) => patch({ strokeColor: value })} />
              <SliderRow
                label={labels.strokeWidth}
                value={active.strokeWidth}
                min={0}
                max={40}
                theme={theme}
                onChange={(value) => patch({ strokeWidth: value })}
                onCommit={() => commit(labels.strokeWidth)}
              />
              <p className={`text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>{labels.shadowSection}</p>
              <ColorRow label={labels.shadowColor} value={active.shadowColor} theme={theme} onChange={(value) => patch({ shadowColor: value })} />
              <SliderRow
                label={labels.shadowBlur}
                value={active.shadowBlur}
                min={0}
                max={80}
                theme={theme}
                onChange={(value) => patch({ shadowBlur: value })}
                onCommit={() => commit(labels.shadowBlur)}
              />
              <div className="grid grid-cols-2 gap-2">
                <NumberRow label={labels.shadowX} value={Math.round(active.shadowOffsetX)} theme={theme} onChange={(value) => patch({ shadowOffsetX: value })} onCommit={() => commit(labels.shadowX)} />
                <NumberRow label={labels.shadowY} value={Math.round(active.shadowOffsetY)} theme={theme} onChange={(value) => patch({ shadowOffsetY: value })} onCommit={() => commit(labels.shadowY)} />
              </div>
            </PanelSection>
          )}

          {active.kind === "shape" && (
            <PanelSection title={labels.shapeSection} theme={theme}>
              <SelectRow
                label={labels.shape}
                value={active.shape}
                theme={theme}
                options={[
                  { value: "rect" as EditorShapeKind, label: content.ui.options.rect },
                  { value: "ellipse" as EditorShapeKind, label: content.ui.options.ellipse },
                  { value: "line" as EditorShapeKind, label: content.ui.options.line },
                ]}
                onChange={(value) => patch({ shape: value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <NumberRow label={labels.width} value={Math.round(active.width)} theme={theme} onChange={(value) => patch({ width: value })} onCommit={() => commit(labels.width)} />
                <NumberRow label={labels.height} value={Math.round(active.height)} theme={theme} onChange={(value) => patch({ height: value })} onCommit={() => commit(labels.height)} />
              </div>
              <ColorRow label={labels.fill} value={active.fill} theme={theme} onChange={(value) => patch({ fill: value })} />
              <ColorRow label={labels.stroke} value={active.stroke} theme={theme} onChange={(value) => patch({ stroke: value })} />
              <SliderRow
                label={labels.strokeWidth}
                value={active.strokeWidth}
                min={0}
                max={40}
                theme={theme}
                onChange={(value) => patch({ strokeWidth: value })}
                onCommit={() => commit(labels.strokeWidth)}
              />
              <SliderRow
                label={labels.radius}
                value={active.radius}
                min={0}
                max={200}
                theme={theme}
                onChange={(value) => patch({ radius: value })}
                onCommit={() => commit(labels.radius)}
              />
            </PanelSection>
          )}

          {active.kind === "adjustment" && (
            <PanelSection title={labels.adjustmentSection} theme={theme}>
              <SelectRow
                label={labels.adjustmentKind}
                value={active.adjustment}
                theme={theme}
                options={(Object.keys(content.ui.adjustments.kinds) as EditorAdjustmentKind[]).map((kind) => ({
                  value: kind,
                  label: content.ui.adjustments.kinds[kind],
                }))}
                onChange={(value) =>
                  editor.updateAdjustmentLayer(active.id, value, adjustmentDefinition(value).params.reduce<Record<string, number>>((acc, param) => {
                    acc[param.key] = param.def;
                    return acc;
                  }, {}))
                }
              />
              {adjustmentDefinition(active.adjustment).params.map((param) => (
                <SliderRow
                  key={param.key}
                  label={content.ui.adjustments.params[param.key as keyof typeof content.ui.adjustments.params] ?? param.label}
                  value={active.params[param.key] ?? param.def}
                  min={param.min}
                  max={param.max}
                  step={param.step}
                  theme={theme}
                  onChange={(value) =>
                    editor.updateAdjustmentLayer(
                      active.id,
                      active.adjustment,
                      { ...active.params, [param.key]: value },
                      undefined
                    )
                  }
                />
              ))}
            </PanelSection>
          )}
        </>
      )}

      <PanelSection title={labels.documentSection} theme={theme}>
        <DocumentResizeControls
          key={`${doc.width}x${doc.height}`}
          width={doc.width}
          height={doc.height}
          labels={labels}
          theme={theme}
          onApply={(width, height) => editor.resizeImage(width, height, labels.applyResize)}
        />
        <div className="grid grid-cols-2 gap-1">
          <MiniButton theme={theme} onClick={() => editor.rotateImage("ccw", labels.rotateLeft)} title={labels.rotateLeft}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.rotateLeft}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.rotateImage("cw", labels.rotateRight)} title={labels.rotateRight}>
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.rotateRight}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.rotateImage("180", labels.rotate180)} title={labels.rotate180}>
            {labels.rotate180}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.flipImage("horizontal", labels.flipH)} title={labels.flipH}>
            <FlipHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.flipH}
          </MiniButton>
          <MiniButton theme={theme} onClick={() => editor.flipImage("vertical", labels.flipV)} title={labels.flipV}>
            <FlipVertical className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.flipV}
          </MiniButton>
        </div>
      </PanelSection>

      <PanelSection title={labels.selectionSection} theme={theme}>
        <div className="grid grid-cols-2 gap-1">
          <MiniButton theme={theme} onClick={editor.selectAll} title={labels.selectAll}>
            {labels.selectAll}
          </MiniButton>
          <MiniButton theme={theme} onClick={editor.deselect} disabled={!doc.selection} title={labels.deselect}>
            {labels.deselect}
          </MiniButton>
          <MiniButton
            theme={theme}
            onClick={() => editor.deleteSelection(labels.deleteSelection)}
            disabled={!doc.selection}
            title={labels.deleteSelection}
            danger
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.deleteSelection}
          </MiniButton>
          <MiniButton
            theme={theme}
            onClick={() => editor.fillSelection(editor.foregroundColor, labels.fillSelection)}
            disabled={!doc.selection}
            title={labels.fillSelection}
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.fillSelection}
          </MiniButton>
        </div>
        <p className={`text-[10px] tabular-nums ${theme.textMuted}`}>
          {labels.selectionInfo}:{" "}
          {doc.selection
            ? `${Math.round(doc.selection.bounds.x)}, ${Math.round(doc.selection.bounds.y)} · ${Math.round(doc.selection.bounds.width)} × ${Math.round(doc.selection.bounds.height)}`
            : labels.none}
        </p>
      </PanelSection>
    </div>
  );
}
