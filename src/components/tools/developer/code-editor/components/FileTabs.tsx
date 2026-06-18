// components/tools/developer/code-editor/components/FileTabs.tsx
"use client";
import { X, Circle } from "lucide-react";
import { VirtualFile, EditorTab, SUPPORTED_LANGUAGES } from "../types";

interface FileTabsProps {
  files: VirtualFile[];
  tabs: EditorTab[];
  activeFileId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  theme: any;
}

export default function FileTabs({
  files,
  tabs,
  activeFileId,
  onTabClick,
  onTabClose,
}: FileTabsProps) {
  if (tabs.length === 0) return null;

  return (
    <div
      className="flex items-center overflow-x-auto border-b scrollbar-hide"
      style={{
        borderColor: "var(--app-border)",
        backgroundColor: "var(--app-bg)",
      }}
    >
      {tabs.map((tab) => {
        const file = files.find((f) => f.id === tab.fileId);
        if (!file) return null;

        const isActive = tab.fileId === activeFileId;
        const lang =
          SUPPORTED_LANGUAGES[
            file.language as keyof typeof SUPPORTED_LANGUAGES
          ];

        return (
          <div
            key={tab.fileId}
            onClick={() => onTabClick(tab.fileId)}
            className="group flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer border-r shrink-0 transition-colors select-none"
            style={{
              backgroundColor: isActive ? "var(--app-card)" : "transparent",
              borderRightColor: "var(--app-border)",
              color: isActive ? "var(--app-accent)" : "var(--app-text-muted)",
              borderTop: isActive
                ? "2px solid var(--app-accent)"
                : "2px solid transparent",
              marginBottom: isActive ? "-1px" : "0",
            }}
          >
            <span className="text-sm">{lang?.icon || "📄"}</span>
            <span className="max-w-[120px] truncate font-medium">
              {file.name}
            </span>
            {tab.isDirty && (
              <Circle size={8} className="fill-current opacity-40 shrink-0" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.fileId);
              }}
              className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shrink-0"
              title="Close"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
