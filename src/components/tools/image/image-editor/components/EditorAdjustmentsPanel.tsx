"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import { adjustmentDefinition, EDITOR_ADJUSTMENTS } from "../editor-constants";
import type { EditorAdjustmentKind } from "../editor-types";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";
import { MiniButton, SelectRow, SliderRow } from "./EditorControls";

export default function EditorAdjustmentsPanel({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const labels = content.ui.adjustments;
  const [kind, setKind] = useState<EditorAdjustmentKind>("brightness");
  const definition = adjustmentDefinition(kind);
  const [params, setParams] = useState<Record<string, number>>(() =>
    Object.fromEntries(definition.params.map((param) => [param.key, param.def]))
  );

  const kindOptions = useMemo(
    () => EDITOR_ADJUSTMENTS.map((item) => ({ value: item.kind, label: labels.kinds[item.kind] })),
    [labels.kinds]
  );

  const changeKind = (next: EditorAdjustmentKind) => {
    setKind(next);
    const nextDefinition = adjustmentDefinition(next);
    setParams(Object.fromEntries(nextDefinition.params.map((param) => [param.key, param.def])));
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
      <p className={`rounded-lg px-2.5 py-2 text-[11px] ${theme.note.infoBg} ${theme.note.infoText}`}>{labels.hint}</p>

      <SelectRow label={labels.kinds[kind]} value={kind} theme={theme} options={kindOptions} onChange={changeKind} />

      <div className="flex flex-col gap-3">
        {definition.params.map((param) => (
          <SliderRow
            key={param.key}
            label={content.ui.adjustments.params[param.key as keyof typeof content.ui.adjustments.params] ?? param.label}
            value={params[param.key] ?? param.def}
            min={param.min}
            max={param.max}
            step={param.step}
            theme={theme}
            onChange={(value) => setParams((previous) => ({ ...previous, [param.key]: value }))}
          />
        ))}
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <MiniButton
          theme={theme}
          onClick={() => editor.applyAdjustmentToActive(kind, params, labels.destructive)}
          title={labels.destructive}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.destructive}
        </MiniButton>
        <MiniButton
          theme={theme}
          onClick={() => editor.addAdjustmentLayer(kind, labels.nonDestructive, labels.kinds[kind])}
          title={labels.nonDestructive}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.nonDestructive}
        </MiniButton>
        <p className={`text-[10px] ${theme.textMuted}`}>{labels.previewNote}</p>
      </div>
    </div>
  );
}
