// components/tools/developer/code-editor/components/SimpleEditor.tsx
"use client";

import { useRef, useEffect } from "react";
import { Save } from "lucide-react";
import { VirtualFile, SUPPORTED_LANGUAGES } from "../types";

interface SimpleEditorProps {
  file: VirtualFile | null;
  onContentChange: (fileId: string, content: string) => void;
  theme: any;
  locale: string;
}

export default function SimpleEditor({
  file,
  onContentChange,
  theme,
  locale,
}: SimpleEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFa = locale === "fa";
  const isDark = theme.mode === "dark";

  useEffect(() => {
    if (textareaRef.current && file) {
      textareaRef.current.focus();
    }
  }, [file?.id]);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3 px-6 max-w-md">
          <div className="text-5xl">📝</div>
          <h3
            className="text-lg font-bold"
            style={{ color: "var(--app-text)" }}
          >
            {isFa ? "فایلی باز نیست" : "No file open"}
          </h3>
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            {isFa
              ? "از منوی کناری یک فایل انتخاب کنید"
              : "Select a file from the sidebar"}
          </p>
        </div>
      </div>
    );
  }

  const lang =
    SUPPORTED_LANGUAGES[file.language as keyof typeof SUPPORTED_LANGUAGES];

  return (
    <div className="flex-1 flex flex-col" style={{ direction: "ltr" }}>
      {/* File info bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 border-b text-xs"
        style={{
          borderColor: "var(--app-border)",
          color: "var(--app-text-muted)",
        }}
      >
        <div className="flex items-center gap-2">
          <span>{lang?.icon || "📄"}</span>
          <span className="font-medium" style={{ color: "var(--app-text)" }}>
            {file.name}
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{
              backgroundColor: "var(--app-secondary-bg)",
              color: "var(--app-secondary-text)",
            }}
          >
            {lang?.name || file.language}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span>{file.content.split("\n").length} lines</span>
          <span>{file.content.length} chars</span>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={file.content}
        onChange={(e) => onContentChange(file.id, e.target.value)}
        onKeyDown={(e) => {
          // Tab support
          if (e.key === "Tab") {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            const newValue =
              value.substring(0, start) + "  " + value.substring(end);
            onContentChange(file.id, newValue);
            requestAnimationFrame(() => {
              textarea.selectionStart = textarea.selectionEnd = start + 2;
            });
          }
          // Ctrl+S
          if ((e.ctrlKey || e.metaKey) && e.key === "s") {
            e.preventDefault();
            window.dispatchEvent(new CustomEvent("editor-save"));
          }
        }}
        className="flex-1 p-4 bg-transparent outline-none resize-none font-mono text-sm leading-relaxed"
        style={{
          color: "var(--app-text)",
          fontFamily:
            "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          lineHeight: "1.6",
          fontSize: "14px",
          tabSize: 2,
        }}
        placeholder="// Start coding..."
        spellCheck={false}
        dir="ltr"
      />
    </div>
  );
}
