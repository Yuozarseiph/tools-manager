"use client";

import { FileText, X } from "lucide-react";
import { EditorTab, SUPPORTED_LANGUAGES, VirtualFile } from "../types";

interface FileTabsProps {
  files: VirtualFile[];
  tabs: EditorTab[];
  activeFileId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  locale?: string;
  theme?: unknown;
}

export default function FileTabs({ files, tabs, activeFileId, onTabClick, onTabClose, locale }: FileTabsProps) {
  const isFa = locale === "fa";
  return (
    <div className="qf-editor-tabs" role="tablist" aria-label={isFa ? "فایل‌های باز" : "Open files"}>
      {tabs.map((tab) => {
        const file = files.find((item) => item.id === tab.fileId && !item.isFolder);
        if (!file) return null;
        const Icon = SUPPORTED_LANGUAGES[file.language as keyof typeof SUPPORTED_LANGUAGES]?.icon ?? FileText;
        const active = tab.fileId === activeFileId;
        return (
          <div key={tab.fileId} className={`qf-editor-tab ${active ? "is-active" : ""}`}>
            <button type="button" role="tab" aria-selected={active} aria-label={file.name}
              onClick={() => onTabClick(tab.fileId)} className="qf-editor-tab-select" title={file.name}>
              <Icon size={15} aria-hidden="true" />
              <span className="truncate">{file.name}</span>
              {tab.isDirty && <span className="qf-editor-dirty" aria-label={isFa ? "ذخیره نشده" : "Unsaved"} />}
            </button>
            <button type="button" className="qf-editor-tab-close" aria-label={`${isFa ? "بستن" : "Close"} ${file.name}`}
              onClick={() => onTabClose(tab.fileId)} title={isFa ? "بستن تب" : "Close tab"}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
