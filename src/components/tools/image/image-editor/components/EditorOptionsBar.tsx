"use client";

import { Minus, Plus } from "lucide-react";
import { AccessibleSelect } from "@/components/ui/AccessibleControls";
import type { ThemePalette } from "@/constants/themes";
import { EDITOR_FONTS } from "../editor-constants";
import type { EditorShapeKind } from "../editor-types";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import { ColorRow, MiniButton, Segmented, SliderRow } from "./EditorControls";

function Divider({ theme }: { theme: ThemePalette }) {
  return <span className={`hidden h-8 w-px shrink-0 sm:block ${theme.border.replace("border-", "bg-")}`} />;
}

export default function EditorOptionsBar({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const options = content.ui.options;
  const tool = editor.tool;

  return (
    <div className={`flex max-h-40 shrink-0 flex-wrap items-center gap-x-3 gap-y-2 overflow-y-auto border-b px-3 py-2 ${theme.border} ${theme.card}`}>
      <span className={`text-xs font-semibold ${theme.text}`}>{content.ui.tools[tool]}</span>
      <Divider theme={theme} />

      {(tool === "brush" || tool === "eraser") && (
        <>
          <div className="w-36">
            <SliderRow
              label={tool === "brush" ? options.brushSize : options.eraserSize}
              value={tool === "brush" ? editor.brush.size : editor.eraser.size}
              min={1}
              max={400}
              theme={theme}
              onChange={(value) =>
                tool === "brush"
                  ? editor.setBrush({ ...editor.brush, size: value })
                  : editor.setEraser({ ...editor.eraser, size: value })
              }
            />
          </div>
          <div className="w-32">
            <SliderRow
              label={options.hardness}
              value={tool === "brush" ? editor.brush.hardness : editor.eraser.hardness}
              min={0}
              max={1}
              step={0.01}
              theme={theme}
              onChange={(value) =>
                tool === "brush"
                  ? editor.setBrush({ ...editor.brush, hardness: value })
                  : editor.setEraser({ ...editor.eraser, hardness: value })
              }
            />
          </div>
          <div className="w-32">
            <SliderRow
              label={options.opacity}
              value={tool === "brush" ? editor.brush.opacity : editor.eraser.opacity}
              min={0}
              max={1}
              step={0.01}
              theme={theme}
              onChange={(value) =>
                tool === "brush"
                  ? editor.setBrush({ ...editor.brush, opacity: value })
                  : editor.setEraser({ ...editor.eraser, opacity: value })
              }
            />
          </div>
          <div className="w-32">
            <SliderRow
              label={options.flow}
              value={tool === "brush" ? editor.brush.flow : editor.eraser.flow}
              min={0.01}
              max={1}
              step={0.01}
              theme={theme}
              onChange={(value) =>
                tool === "brush"
                  ? editor.setBrush({ ...editor.brush, flow: value })
                  : editor.setEraser({ ...editor.eraser, flow: value })
              }
            />
          </div>
          {tool === "brush" && (
            <div className="w-44">
              <ColorRow
                label={options.fill}
                value={editor.foregroundColor}
                theme={theme}
                onChange={editor.setForegroundColor}
              />
            </div>
          )}
        </>
      )}

      {tool === "fill" && (
        <>
          <div className="w-40">
            <SliderRow
              label={options.tolerance}
              value={editor.fillTolerance}
              min={0}
              max={100}
              theme={theme}
              onChange={editor.setFillTolerance}
            />
          </div>
          <div className="w-44">
            <ColorRow label={options.fill} value={editor.foregroundColor} theme={theme} onChange={editor.setForegroundColor} />
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>{options.fillHint}</p>
        </>
      )}

      {tool === "gradient" && (
        <>
          <div className="w-44">
            <Segmented
              label={options.gradientType}
              value={editor.gradient.type}
              theme={theme}
              options={[
                { value: "linear", label: options.linear },
                { value: "radial", label: options.radial },
              ]}
              onChange={(value) => editor.setGradient({ ...editor.gradient, type: value })}
            />
          </div>
          <div className="w-40">
            <ColorRow
              label={options.from}
              value={editor.gradient.from}
              theme={theme}
              onChange={(value) => editor.setGradient({ ...editor.gradient, from: value })}
            />
          </div>
          <div className="w-40">
            <ColorRow
              label={options.to}
              value={editor.gradient.to}
              theme={theme}
              onChange={(value) => editor.setGradient({ ...editor.gradient, to: value })}
            />
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>{options.gradientHint}</p>
        </>
      )}

      {tool === "shape" && (
        <>
          <div className="w-56">
            <Segmented
              label={options.shapeKind}
              value={editor.shapeDefaults.shape}
              theme={theme}
              options={[
                { value: "rect" as EditorShapeKind, label: options.rect },
                { value: "ellipse" as EditorShapeKind, label: options.ellipse },
                { value: "line" as EditorShapeKind, label: options.line },
              ]}
              onChange={(value) => editor.setShapeDefaults({ ...editor.shapeDefaults, shape: value })}
            />
          </div>
          <div className="w-40">
            <ColorRow
              label={options.fill}
              value={editor.shapeDefaults.fill}
              theme={theme}
              onChange={(value) => editor.setShapeDefaults({ ...editor.shapeDefaults, fill: value })}
            />
          </div>
          <div className="w-40">
            <ColorRow
              label={options.stroke}
              value={editor.shapeDefaults.stroke}
              theme={theme}
              onChange={(value) => editor.setShapeDefaults({ ...editor.shapeDefaults, stroke: value })}
            />
          </div>
          <div className="w-36">
            <SliderRow
              label={options.strokeWidth}
              value={editor.shapeDefaults.strokeWidth}
              min={0}
              max={40}
              theme={theme}
              onChange={(value) => editor.setShapeDefaults({ ...editor.shapeDefaults, strokeWidth: value })}
            />
          </div>
          <div className="w-32">
            <SliderRow
              label={options.radius}
              value={editor.shapeDefaults.radius}
              min={0}
              max={200}
              theme={theme}
              onChange={(value) => editor.setShapeDefaults({ ...editor.shapeDefaults, radius: value })}
            />
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>{options.shapeHint}</p>
        </>
      )}

      {tool === "text" && (
        <>
          <label className="flex items-center gap-2 text-[11px]">
            <span className={theme.textMuted}>{options.fontFamily}</span>
            <AccessibleSelect
              fieldLabel={options.fontFamily}
              value={editor.textDefaults.fontFamily}
              onChange={(event) => editor.setTextDefaults({ ...editor.textDefaults, fontFamily: event.target.value })}
              className={`rounded-lg border px-2 py-1 text-[11px] ${theme.border} ${theme.bg} ${theme.text}`}
            >
              {EDITOR_FONTS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </AccessibleSelect>
          </label>
          <div className="w-32">
            <SliderRow
              label={options.fontSize}
              value={editor.textDefaults.fontSize}
              min={6}
              max={400}
              theme={theme}
              onChange={(value) => editor.setTextDefaults({ ...editor.textDefaults, fontSize: value })}
            />
          </div>
          <div className="w-40">
            <ColorRow
              label={options.textColor}
              value={editor.textDefaults.color}
              theme={theme}
              onChange={(value) => editor.setTextDefaults({ ...editor.textDefaults, color: value })}
            />
          </div>
          <p className={`text-[11px] ${theme.textMuted}`}>{options.textHint}</p>
        </>
      )}

      {tool === "move" && <p className={`text-[11px] ${theme.textMuted}`}>{options.moveHint}</p>}
      {tool === "zoom" && <p className={`text-[11px] ${theme.textMuted}`}>{options.zoomHint}</p>}
      {tool === "hand" && <p className={`text-[11px] ${theme.textMuted}`}>{options.handHint}</p>}
      {tool === "eyedropper" && <p className={`text-[11px] ${theme.textMuted}`}>{options.eyedropperHint}</p>}
      {(tool === "marquee" || tool === "lasso") && (
        <>
          <p className={`text-[11px] ${theme.textMuted}`}>{options.selectHint}</p>
          <MiniButton theme={theme} onClick={editor.selectAll}>
            {content.ui.properties.selectAll}
          </MiniButton>
          <MiniButton theme={theme} onClick={editor.deselect} disabled={!editor.doc?.selection}>
            {content.ui.properties.deselect}
          </MiniButton>
        </>
      )}
      {tool === "crop" && <p className={`text-[11px] ${theme.textMuted}`}>{options.cropHint}</p>}

      <div className="ms-auto flex items-center gap-1">
        <MiniButton theme={theme} onClick={editor.zoomOut} title={content.ui.status.zoom}>
          <Minus className="h-3.5 w-3.5" aria-hidden="true" />
        </MiniButton>
        <span className={`w-12 text-center text-[11px] tabular-nums ${theme.text}`}>{Math.round(editor.zoom * 100)}%</span>
        <MiniButton theme={theme} onClick={editor.zoomIn} title={content.ui.status.zoom}>
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        </MiniButton>
      </div>
    </div>
  );
}
