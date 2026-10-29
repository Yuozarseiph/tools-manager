"use client";

import { useRef, useState } from "react";
import { FilePlus2, ImagePlus, Link2, Sparkles, Upload } from "lucide-react";
import { AccessibleDropzone, AccessibleInput } from "@/components/ui/AccessibleControls";
import type { ThemePalette } from "@/constants/themes";
import { EDITOR_DOCUMENT_PRESETS } from "../editor-constants";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import { MiniButton, NumberRow, Segmented } from "./EditorControls";

const PRESET_LABEL: Record<string, keyof ImageEditorContent["ui"]["empty"]> = {
  hd: "preset_hd",
  fullhd: "preset_fullhd",
  square: "preset_square",
  story: "preset_story",
  a4: "preset_a4",
  web: "preset_web",
};

export default function EditorEmptyState({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const labels = content.ui.empty;
  const [url, setUrl] = useState("");
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [background, setBackground] = useState<"white" | "black" | "transparent">("white");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openFile = (file: File | null | undefined) => {
    if (!file) return;
    void editor.openFile(file, { open: content.ui.messages.imageLoaded, psd: content.ui.messages.psdLoaded });
  };

  const loadUrl = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    void editor.openImageFromUrl(trimmed, content.ui.messages.imageLoaded);
    setUrl("");
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className={`relative overflow-hidden rounded-2xl border ${theme.card} ${theme.border}`}>
        <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-br ${theme.gradient} opacity-20`} aria-hidden="true" />
        <div className="relative flex flex-col gap-6 p-6 sm:p-8">
          <div className="max-w-2xl">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${theme.border} ${theme.textMuted}`}>
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              {content.ui.header.badge}
            </span>
            <h2 className={`mt-3 text-2xl font-bold ${theme.text}`}>{labels.title}</h2>
            <p className={`mt-2 text-sm leading-relaxed ${theme.textMuted}`}>{labels.description}</p>
          </div>

          <AccessibleDropzone
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              openFile(event.dataTransfer.files?.[0]);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${theme.border} ${theme.bg}`}
          >
            <span className={`grid h-12 w-12 place-items-center rounded-full ${theme.primary}`}>
              <Upload className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className={`text-sm font-semibold ${theme.text}`}>{labels.upload}</span>
            <span className={`text-[11px] ${theme.textMuted}`}>PNG · JPG · WebP · PSD</span>
          </AccessibleDropzone>

          <input
            ref={inputRef}
            type="file"
            accept="image/*,.psd,.psb"
            className="hidden"
            onChange={(event) => {
              openFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className={`flex flex-col gap-2 rounded-xl border p-4 ${theme.border} ${theme.bg}`}>
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${theme.text}`}>
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                {labels.psd}
              </span>
              <p className={`text-[11px] ${theme.textMuted}`}>{content.ui.messages.psdLoaded}</p>
              <MiniButton theme={theme} onClick={() => inputRef.current?.click()} title={labels.upload}>
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                {labels.psd}
              </MiniButton>
            </div>

            <div className={`flex flex-col gap-2 rounded-xl border p-4 ${theme.border} ${theme.bg}`}>
              <span className={`flex items-center gap-1.5 text-xs font-semibold ${theme.text}`}>
                <Link2 className="h-4 w-4" aria-hidden="true" />
                {labels.urlLabel}
              </span>
              <div className="flex gap-1.5">
                <AccessibleInput
                  fieldLabel={labels.urlLabel}
                  type="url"
                  value={url}
                  placeholder={labels.urlPlaceholder}
                  onChange={(event) => setUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") loadUrl();
                  }}
                  className={`min-w-0 flex-1 rounded-lg border px-2.5 py-1.5 text-[11px] ${theme.border} ${theme.bg} ${theme.text}`}
                />
                <MiniButton theme={theme} onClick={loadUrl} disabled={!url.trim()}>
                  {labels.loadUrl}
                </MiniButton>
              </div>
              <p className={`text-[10px] ${theme.textMuted}`}>{labels.hint}</p>
            </div>
          </div>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 sm:p-6 ${theme.card} ${theme.border}`}>
        <h3 className={`flex items-center gap-2 text-sm font-semibold ${theme.text}`}>
          <FilePlus2 className="h-4 w-4" aria-hidden="true" />
          {labels.createTitle}
        </h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className={`me-1 self-center text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>{labels.presets}</span>
          {EDITOR_DOCUMENT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setWidth(preset.width);
                setHeight(preset.height);
              }}
              className={`rounded-lg border px-2.5 py-1 text-[11px] ${theme.border} ${theme.bg} ${theme.text} hover:${theme.secondary}`}
            >
              {labels[PRESET_LABEL[preset.id] ?? "preset_hd"]}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <NumberRow label={labels.width} value={width} min={1} max={4096} theme={theme} onChange={setWidth} />
          <NumberRow label={labels.height} value={height} min={1} max={4096} theme={theme} onChange={setHeight} />
        </div>

        <div className="mt-3">
          <Segmented
            label={labels.background}
            value={background}
            theme={theme}
            options={[
              { value: "white", label: labels.bgWhite },
              { value: "black", label: labels.bgBlack },
              { value: "transparent", label: labels.bgTransparent },
            ]}
            onChange={setBackground}
          />
        </div>

        <div className="mt-4">
          <MiniButton
            theme={theme}
            onClick={() => editor.newDocument(width, height, background, content.ui.messages.newDocument)}
            title={labels.create}
          >
            <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
            {labels.create}
          </MiniButton>
        </div>
      </div>
    </div>
  );
}
