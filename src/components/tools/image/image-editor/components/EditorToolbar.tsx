"use client";

import {
  Brush,
  Crop,
  Eraser,
  Hand,
  Lasso,
  MousePointer2,
  PaintBucket,
  Pipette,
  Shapes,
  Square,
  Type,
  ZoomIn,
  Blend,
} from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import type { EditorToolId } from "../editor-types";
import { EDITOR_TOOLS } from "../editor-constants";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";

const ICONS: Record<EditorToolId, typeof MousePointer2> = {
  move: MousePointer2,
  marquee: Square,
  lasso: Lasso,
  crop: Crop,
  brush: Brush,
  eraser: Eraser,
  fill: PaintBucket,
  gradient: Blend,
  text: Type,
  shape: Shapes,
  eyedropper: Pipette,
  hand: Hand,
  zoom: ZoomIn,
};

const GROUP_OF: Record<EditorToolId, keyof ImageEditorContent["ui"]["groups"]> = {
  move: "select",
  marquee: "select",
  lasso: "select",
  crop: "select",
  brush: "paint",
  eraser: "paint",
  fill: "paint",
  gradient: "paint",
  text: "draw",
  shape: "draw",
  eyedropper: "draw",
  hand: "view",
  zoom: "view",
};

export default function EditorToolbar({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const groups: { key: keyof ImageEditorContent["ui"]["groups"]; tools: typeof EDITOR_TOOLS }[] = [];
  EDITOR_TOOLS.forEach((tool) => {
    const groupKey = GROUP_OF[tool.id];
    const existing = groups.find((group) => group.key === groupKey);
    if (existing) existing.tools = [...existing.tools, tool];
    else groups.push({ key: groupKey, tools: [tool] });
  });

  return (
    <div
      className={`flex shrink-0 items-center gap-1 overflow-x-auto border-b px-2 py-1.5 lg:w-[94px] lg:flex-col lg:justify-start lg:overflow-y-auto lg:overflow-x-hidden lg:border-b-0 lg:border-e lg:py-2 ${theme.border} ${theme.card}`}
      role="toolbar"
      aria-label={content.ui.header.badge}
    >
      {groups.map((group, index) => (
        <div
          key={group.key}
          className={`flex items-center gap-1 lg:w-full lg:flex-col ${
            index > 0 ? `border-s ps-1 lg:border-s-0 lg:border-t lg:pt-1 ${theme.border}` : ""
          }`}
          role="group"
          aria-label={content.ui.groups[group.key]}
        >
          {group.tools.map((tool) => {
            const Icon = ICONS[tool.id];
            const active = editor.tool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                title={`${content.ui.tools[tool.id]} (${tool.shortcut})`}
                aria-label={`${content.ui.tools[tool.id]} (${tool.shortcut})`}
                aria-pressed={active}
                onClick={() => editor.setTool(tool.id)}
                className={`relative flex h-12 w-[72px] shrink-0 flex-col items-center justify-center gap-1 rounded-lg px-1 transition-colors lg:h-12 lg:w-full ${
                  active
                    ? `${theme.primary} shadow-sm`
                    : `${theme.text} hover:${theme.secondary}`
                }`}
              >
                <Icon className="h-[17px] w-[17px] shrink-0" aria-hidden="true" />
                <span className="max-w-full truncate text-[9px] leading-none">{content.ui.tools[tool.id]}</span>
              </button>
            );
          })}
        </div>
      ))}

      <div className={`mt-auto hidden flex-col items-center gap-2 border-t pt-3 lg:flex ${theme.border}`}>
        <div className="relative h-11 w-11">
          <label className="absolute end-0 top-0 h-7 w-7 cursor-pointer overflow-hidden rounded-md border border-white/60 shadow" title={content.ui.options.from}>
            <span className="sr-only">{content.ui.options.from}</span>
            <input
              type="color"
              value={editor.foregroundColor}
              onChange={(event) => editor.setForegroundColor(event.target.value)}
              className="h-full w-full cursor-pointer border-0 bg-transparent p-0"
            />
            <span
              className="pointer-events-none absolute inset-0 rounded-[5px] ring-1 ring-black/20"
              style={{ backgroundColor: editor.foregroundColor }}
            />
          </label>
          <label className="absolute bottom-0 start-0 h-7 w-7 cursor-pointer overflow-hidden rounded-md border border-white/60 shadow" title={content.ui.options.to}>
            <span className="sr-only">{content.ui.options.to}</span>
            <input
              type="color"
              value={editor.backgroundColor}
              onChange={(event) => editor.setBackgroundColor(event.target.value)}
              className="h-full w-full cursor-pointer border-0 bg-transparent p-0"
            />
            <span
              className="pointer-events-none absolute inset-0 rounded-[5px] ring-1 ring-black/20"
              style={{ backgroundColor: editor.backgroundColor }}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={editor.swapColors}
          className={`rounded-md border px-1.5 py-0.5 text-[10px] ${theme.border} ${theme.textMuted}`}
        >
          ⇄
        </button>
      </div>
    </div>
  );
}
