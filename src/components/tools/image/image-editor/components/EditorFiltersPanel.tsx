"use client";

import { useEffect, useState } from "react";
import { Check, Eye, X } from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import { EDITOR_FILTERS, filterDefinition } from "../editor-constants";
import type { EditorFilterKind } from "../editor-types";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import { MiniButton, SliderRow } from "./EditorControls";

export default function EditorFiltersPanel({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const labels = content.ui.filters;
  const [kind, setKind] = useState<EditorFilterKind>("blur");
  const definition = filterDefinition(kind);
  const [amount, setAmount] = useState(definition.def);
  const previewing = editor.preview !== null;

  useEffect(() => {
    if (!previewing) return;
    if (editor.preview?.kind === kind && editor.preview.amount === amount) return;
    editor.previewFilter(kind, amount);
    // Re-run only when the requested filter values change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, amount, previewing]);

  const select = (next: EditorFilterKind) => {
    setKind(next);
    setAmount(filterDefinition(next).def);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
      <p className={`rounded-lg px-2.5 py-2 text-[11px] ${theme.note.infoBg} ${theme.note.infoText}`}>{labels.hint}</p>

      <div className="grid grid-cols-3 gap-1">
        {EDITOR_FILTERS.map((filter) => (
          <button
            key={filter.kind}
            type="button"
            onClick={() => select(filter.kind)}
            aria-pressed={kind === filter.kind}
            className={`rounded-lg border px-1.5 py-2 text-[10px] font-medium transition-colors ${
              kind === filter.kind ? `${theme.primary} border-transparent` : `${theme.bg} ${theme.border} ${theme.text} hover:${theme.secondary}`
            }`}
          >
            {labels.kinds[filter.kind]}
          </button>
        ))}
      </div>

      <SliderRow
        label={labels.amount}
        value={amount}
        min={definition.min}
        max={definition.max}
        theme={theme}
        suffix={definition.unit === "none" ? undefined : definition.unit}
        onChange={setAmount}
      />

      {previewing && (
        <p className={`rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${theme.note.warningBg} ${theme.note.warningText}`}>
          {labels.previewActive}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-1.5">
        <MiniButton theme={theme} onClick={() => editor.previewFilter(kind, amount)} title={labels.preview}>
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.preview}
        </MiniButton>
        <MiniButton
          theme={theme}
          onClick={() => editor.commitPreviewFilter(labels.apply)}
          disabled={!previewing}
          title={labels.apply}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.apply}
        </MiniButton>
        <MiniButton theme={theme} onClick={editor.cancelPreviewFilter} disabled={!previewing} title={labels.cancel}>
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.cancel}
        </MiniButton>
      </div>
    </div>
  );
}
