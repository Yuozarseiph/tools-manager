"use client";

import { Check } from "lucide-react";
import type { ThemePalette } from "@/constants/themes";
import type { ImageEditorContent } from "../image-editor.content";
import type { ImageEditorController } from "../useImageEditor";

export default function EditorHistoryPanel({
  editor,
  content,
  theme,
}: {
  editor: ImageEditorController;
  content: ImageEditorContent;
  theme: ThemePalette;
}) {
  const labels = content.ui.history;
  const { entries, index } = editor.history;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
      {entries.length === 0 ? (
        <p className={`text-[11px] ${theme.textMuted}`}>{labels.empty}</p>
      ) : (
        <ol className={`min-h-0 flex-1 overflow-y-auto rounded-xl border ${theme.border}`}>
          {entries.map((entry, entryIndex) => {
            const current = entryIndex === index;
            const future = entryIndex > index;
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => editor.jumpTo(entryIndex)}
                  aria-current={current ? "step" : undefined}
                  className={`flex w-full items-center gap-2 border-b px-2.5 py-1.5 text-start text-[11px] last:border-b-0 ${theme.border} ${
                    current ? theme.secondary : future ? `${theme.textMuted}` : `${theme.text}`
                  }`}
                >
                  <span className={`w-5 shrink-0 text-[10px] tabular-nums ${theme.textMuted}`}>{entryIndex + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{entry.label}</span>
                  {current && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ol>
      )}
      <p className={`text-[10px] tabular-nums ${theme.textMuted}`}>
        {entries.length} {labels.steps}
      </p>
    </div>
  );
}
