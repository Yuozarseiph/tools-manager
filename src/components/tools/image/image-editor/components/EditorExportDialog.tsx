"use client";

import { useEffect, useState } from "react";
import { Download, FileImage, X } from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import { MiniButton, Segmented, SliderRow } from "./EditorControls";

export type EditorExportFormat = "png" | "jpeg" | "webp";
export type EditorExportBackground = "transparent" | "white" | "black";

export default function EditorExportDialog({
  editor,
  content,
  theme,
  open,
  onClose,
  format,
  setFormat,
  quality,
  setQuality,
  background,
  setBackground,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
  open: boolean;
  onClose: () => void;
  format: EditorExportFormat;
  setFormat: (format: EditorExportFormat) => void;
  quality: number;
  setQuality: (quality: number) => void;
  background: EditorExportBackground;
  setBackground: (background: EditorExportBackground) => void;
}) {
  const labels = content.ui.export;
  const [flattenPsd, setFlattenPsd] = useState(true);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        onMouseDown={(event) => event.stopPropagation()}
        className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border p-4 shadow-2xl ${theme.card} ${theme.border}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className={`flex items-center gap-2 text-sm font-semibold ${theme.text}`}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {labels.title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className={`grid h-7 w-7 place-items-center rounded-lg ${theme.textMuted}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Segmented
            label={labels.format}
            value={format}
            theme={theme}
            options={[
              { value: "png", label: labels.png },
              { value: "jpeg", label: labels.jpeg },
              { value: "webp", label: labels.webp },
            ]}
            onChange={setFormat}
          />

          {format !== "png" && (
            <SliderRow label={labels.quality} value={quality} min={10} max={100} suffix="%" theme={theme} onChange={setQuality} />
          )}

          {format !== "png" && (
            <Segmented
              label={labels.background}
              value={background}
              theme={theme}
              options={[
                { value: "transparent", label: labels.bgTransparent },
                { value: "white", label: labels.bgWhite },
                { value: "black", label: labels.bgBlack },
              ]}
              onChange={setBackground}
            />
          )}

          <MiniButton
            theme={theme}
            onClick={() => {
              void editor.exportImage(format, quality / 100, background);
              onClose();
            }}
            title={labels.download}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.download}
          </MiniButton>
        </div>

        <div className={`mt-5 flex flex-col gap-2 rounded-xl border p-3 ${theme.border} ${theme.bg}`}>
          <h4 className={`flex items-center gap-1.5 text-xs font-semibold ${theme.text}`}>
            <FileImage className="h-4 w-4" aria-hidden="true" />
            {labels.psd}
          </h4>
          <p className={`text-[11px] ${theme.textMuted}`}>{labels.psdHint}</p>
          <label className="flex items-center gap-2 text-[11px]">
            <input
              type="checkbox"
              checked={flattenPsd}
              onChange={(event) => setFlattenPsd(event.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--app-accent)]"
            />
            {labels.psdFlatten}
          </label>
          <MiniButton
            theme={theme}
            onClick={() => {
              void editor.exportPsd(flattenPsd);
              onClose();
            }}
            title={labels.exportPsd}
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.exportPsd}
          </MiniButton>
        </div>
      </div>
    </div>
  );
}
