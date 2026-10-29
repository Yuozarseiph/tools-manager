"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  Blend,
  Copy,
  ChevronDown,
  ChevronUp,
  ArrowDown,
  Merge,
  Layers as LayersIcon,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  SlidersHorizontal,
  Trash2,
  Type,
  Shapes,
  ImagePlus,
  Sparkles,
} from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import type { EditorLayer } from "../editor-types";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import { MiniButton } from "./EditorControls";

function Thumbnail({ layer, theme }: { layer: EditorLayer; theme: ThemePalette }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (layer.kind !== "raster") return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const scale = Math.min(canvas.width / layer.canvas.width, canvas.height / layer.canvas.height);
    const width = layer.canvas.width * scale;
    const height = layer.canvas.height * scale;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(layer.canvas, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
  }, [layer]);

  if (layer.kind === "raster") {
    return (
      <canvas
        ref={ref}
        width={36}
        height={36}
        className={`h-9 w-9 shrink-0 rounded border ${theme.border}`}
        style={{
          backgroundImage: "repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%)",
          backgroundSize: "8px 8px",
        }}
      />
    );
  }

  const Icon =
    layer.kind === "text" ? Type : layer.kind === "shape" ? Shapes : SlidersHorizontal;
  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded border ${theme.border} ${theme.bg} ${theme.textMuted}`}>
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
  );
}

export default function EditorLayersPanel({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const doc = editor.doc;
  if (!doc) return null;
  const labels = content.ui.layers;
  const active = editor.activeLayer;

  const addActions = [
    {
      label: labels.addRaster,
      icon: ImagePlus,
      run: () => editor.addRasterLayer(labels.addRaster, `${labels.kindRaster} ${doc.layers.length + 1}`),
    },
    {
      label: labels.addText,
      icon: Type,
      run: () => editor.addTextLayer({ x: doc.width / 2, y: doc.height / 2 }, labels.addText, content.ui.tools.text),
    },
    {
      label: labels.addShape,
      icon: Shapes,
      run: () =>
        editor.addShapeLayer(
          { x: doc.width / 2 - 120, y: doc.height / 2 - 120 },
          { x: doc.width / 2 + 120, y: doc.height / 2 + 120 },
          labels.addShape,
          content.ui.tools.shape
        ),
    },
    {
      label: labels.addAdjustment,
      icon: Sparkles,
      run: () => editor.addAdjustmentLayer("brightness", labels.addAdjustment, labels.kindAdjustment),
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
      <div className="flex flex-wrap items-center gap-1">
        <div className="relative">
          <MiniButton theme={theme} onClick={() => setAddOpen((value) => !value)} title={labels.add}>
            <LayersIcon className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.add}
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          </MiniButton>
          {addOpen && (
            <div className={`absolute start-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border shadow-lg ${theme.card} ${theme.border}`}>
              {addActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => {
                      action.run();
                      setAddOpen(false);
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-start text-[11px] ${theme.text} hover:${theme.secondary}`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <input ref={imageInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif,image/bmp" className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void editor.placeImageFile(file, content.ui.header.placeImage);
          }} />
        <MiniButton theme={theme} onClick={() => imageInputRef.current?.click()} title={content.ui.header.placeImage}>
          <ImagePlus className="h-4 w-4" aria-hidden="true" />{content.ui.layers.kindRaster}
        </MiniButton>
        <MiniButton theme={theme} onClick={() => editor.duplicateLayer(labels.duplicate)} disabled={!active} title={labels.duplicate}>
          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
        </MiniButton>
        <MiniButton theme={theme} onClick={() => editor.deleteLayer(labels.delete)} disabled={!active} title={labels.delete} danger>
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </MiniButton>
        <MiniButton theme={theme} onClick={() => editor.moveLayer("up", labels.up)} disabled={!active} title={labels.up}>
          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
        </MiniButton>
        <MiniButton theme={theme} onClick={() => editor.moveLayer("down", labels.down)} disabled={!active} title={labels.down}>
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </MiniButton>
      </div>

      <div className={`min-h-0 flex-1 overflow-y-auto rounded-xl border ${theme.border}`}>
        {doc.layers.length === 0 && (
          <p className={`p-4 text-center text-[11px] ${theme.textMuted}`}>{labels.empty}</p>
        )}
        <ul className="divide-y divide-[var(--app-border)]">
          {[...doc.layers].reverse().map((layer) => {
            const isActive = layer.id === doc.activeLayerId;
            return (
              <li key={layer.id}
                draggable={renamingId !== layer.id}
                onDragStart={(event) => {
                  setDraggedId(layer.id);
                  event.dataTransfer.setData("text/x-image-editor-layer", layer.id);
                  event.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDraggedId(null)}
                onDragOver={(event: DragEvent<HTMLLIElement>) => {
                  if (draggedId) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }
                }}
                onDrop={(event) => {
                  if (!draggedId) return;
                  event.preventDefault(); event.stopPropagation();
                  editor.reorderLayer(draggedId, layer.id, content.ui.layers.moveOrder);
                  setDraggedId(null);
                }}>
                <div
                  className={`flex min-w-0 items-center gap-2 px-2 py-2 ${isActive ? theme.secondary : ""} ${draggedId === layer.id ? "opacity-50" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => editor.patchLayer(layer.id, { visible: !layer.visible }, labels.visibility)}
                    title={labels.visibility}
                    aria-label={`${labels.visibility}: ${layer.name}`}
                    aria-pressed={layer.visible}
                    className={`grid h-6 w-6 place-items-center rounded ${theme.textMuted}`}
                  >
                    {layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.patchLayer(layer.id, { locked: !layer.locked }, labels.lock)}
                    title={labels.lock}
                    aria-label={`${labels.lock}: ${layer.name}`}
                    aria-pressed={layer.locked}
                    className={`grid h-6 w-6 place-items-center rounded ${layer.locked ? theme.accent : theme.textMuted}`}
                  >
                    {layer.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                  </button>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => editor.setActiveLayer(layer.id)}
                    onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); editor.setActiveLayer(layer.id); } }}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-start"
                    aria-pressed={isActive}
                  >
                    <Thumbnail layer={layer} theme={theme} />
                    <span className="flex min-w-0 flex-col">
                      {renamingId === layer.id ? (
                        <input autoFocus value={renameValue} aria-label={content.ui.layers.rename}
                          className={`h-7 w-full min-w-0 rounded border px-1.5 text-[11px] ${theme.border} ${theme.bg} ${theme.text}`}
                          onChange={(event) => setRenameValue(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") { setRenamingId(null); event.stopPropagation(); }
                            if (event.key === "Enter") event.currentTarget.blur();
                          }}
                          onBlur={() => {
                            if (renameValue.trim() && renameValue !== layer.name) editor.patchLayer(layer.id, { name: renameValue.trim() }, content.ui.layers.rename);
                            setRenamingId(null);
                          }} />
                      ) : (
                      <span className={`truncate text-[11px] font-medium ${theme.text}`}
                        title={content.ui.layers.rename} onDoubleClick={(event) => {
                          event.preventDefault(); event.stopPropagation();
                          setRenamingId(layer.id); setRenameValue(layer.name);
                        }}>{layer.name}</span>
                      )}
                      <span className={`truncate text-[10px] ${theme.textMuted}`}>
                        {layer.kind === "raster"
                          ? labels.kindRaster
                          : layer.kind === "text"
                            ? labels.kindText
                            : layer.kind === "shape"
                              ? labels.kindShape
                              : labels.kindAdjustment}
                        {" · "}
                        {Math.round(layer.opacity * 100)}%
                        {layer.blend !== "normal" ? ` · ${content.ui.blend[layer.blend]}` : ""}
                      </span>
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-wrap gap-1">
        <MiniButton theme={theme} onClick={() => editor.mergeDown(labels.mergeDown)} disabled={!active} title={labels.mergeDown}>
          <Merge className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.mergeDown}
        </MiniButton>
        <MiniButton theme={theme} onClick={() => editor.flattenImage(labels.flatten)} disabled={doc.layers.length < 2} title={labels.flatten}>
          <Blend className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.flatten}
        </MiniButton>
        <MiniButton
          theme={theme}
          onClick={() => editor.rasterizeLayer(labels.rasterize)}
          disabled={!active || active.kind === "raster"}
          title={labels.rasterize}
        >
          <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.rasterize}
        </MiniButton>
      </div>
    </div>
  );
}
