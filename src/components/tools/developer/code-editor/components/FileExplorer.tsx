// components/tools/developer/code-editor/components/FileExplorer.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import {
  FolderOpen,
  FolderClosed,
  File,
  Plus,
  Trash2,
  Pencil,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Upload,
  Search,
  FolderPlus,
  GripVertical,
} from "lucide-react";
import { VirtualFile, SUPPORTED_LANGUAGES, SupportedLanguage } from "../types";
import CustomDropdown from "@/components/ui/CustomDropdown";

interface FileExplorerProps {
  files: VirtualFile[];
  activeFileId: string | null;
  expandedFolders: Set<string>;
  isCreating: { type: "file" | "folder"; parentId: string | null } | null;
  isRenaming: string | null;
  isLoading: boolean;
  onToggleFolder: (folderId: string) => void;
  onCreateItem: (
    name: string,
    language: string,
    parentId: string | null,
    isFolder: boolean,
  ) => void;
  onDeleteItem: (fileId: string) => void;
  onRenameItem: (fileId: string, newName: string) => void;
  onMoveItem: (fileId: string, newParentId: string | null) => void;
  onFileClick: (fileId: string) => void;
  onImportFile: (file: File, parentId: string | null) => void;
  onCancelCreate: () => void;
  onCancelRename: () => void;
  onStartCreate: (type: "file" | "folder", parentId: string | null) => void;
  onStartRename: (fileId: string) => void;
  theme: any;
  locale: string;
}

export default function FileExplorer({
  files,
  activeFileId,
  expandedFolders,
  isCreating,
  isRenaming,
  isLoading,
  onToggleFolder,
  onCreateItem,
  onDeleteItem,
  onRenameItem,
  onMoveItem,
  onFileClick,
  onImportFile,
  onCancelCreate,
  onCancelRename,
  onStartCreate,
  onStartRename,
  theme,
  locale,
}: FileExplorerProps) {
  const [newName, setNewName] = useState("");
  const [newLanguage, setNewLanguage] =
    useState<SupportedLanguage>("javascript");
  const [renameValue, setRenameValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFa = locale === "fa";

  const handleCreate = () => {
    if (!newName.trim() || !isCreating) return;
    onCreateItem(
      newName.trim(),
      newLanguage,
      isCreating.parentId,
      isCreating.type === "folder",
    );
    setNewName("");
  };

  const handleRename = (fileId: string) => {
    if (!renameValue.trim()) return;
    onRenameItem(fileId, renameValue.trim());
    setRenameValue("");
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportFile(file, null);
      e.target.value = "";
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, fileId: string) => {
    e.dataTransfer.setData("text/plain", fileId);
    e.dataTransfer.effectAllowed = "move";
    setDraggedItem(fileId);
  };

  const handleDragOver = (e: React.DragEvent, folderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (folderId) {
      setDragOverFolder(folderId);
      if (!expandedFolders.has(folderId)) {
        setTimeout(() => onToggleFolder(folderId), 600);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
    const fileId = e.dataTransfer.getData("text/plain");
    if (fileId && fileId !== targetFolderId) {
      const item = files.find((f) => f.id === fileId);
      if (item && item.parentId !== targetFolderId) {
        onMoveItem(fileId, targetFolderId);
      }
    }
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDragOverFolder(null);
    setDraggedItem(null);
  };

  const getChildren = (parentId: string | null) => {
    let children = files.filter((f) => f.parentId === parentId);
    if (searchQuery) {
      children = children.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return children.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
  };

  const languageOptions = Object.entries(SUPPORTED_LANGUAGES).map(
    ([key, val]) => ({
      value: key,
      label: `${val.icon} ${val.name} (${val.ext})`,
    }),
  );

  const renderTree = (parentId: string | null, depth: number = 0) => {
    const children = getChildren(parentId);
    return children.map((item) => (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        onDragEnd={handleDragEnd}
      >
        <div
          className={`group flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors ${
            activeFileId === item.id
              ? "bg-blue-50 dark:bg-blue-900/20"
              : dragOverFolder === item.id
                ? "bg-green-50 dark:bg-green-900/20 ring-2 ring-green-500"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (item.isFolder) onToggleFolder(item.id);
            else onFileClick(item.id);
          }}
          onDoubleClick={() => {
            if (!item.isFolder) {
              setRenameValue(item.name);
              onStartRename(item.id);
            }
          }}
          onDragOver={(e) =>
            item.isFolder ? handleDragOver(e, item.id) : undefined
          }
          onDragLeave={handleDragLeave}
          onDrop={(e) => (item.isFolder ? handleDrop(e, item.id) : undefined)}
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <GripVertical size={12} className="text-[var(--app-text-muted)]" />
          </span>

          {item.isFolder && (
            <span className="shrink-0">
              {expandedFolders.has(item.id) ? (
                <ChevronDown
                  size={14}
                  className="text-[var(--app-text-muted)]"
                />
              ) : (
                <ChevronRight
                  size={14}
                  className="text-[var(--app-text-muted)]"
                />
              )}
            </span>
          )}

          {item.isFolder ? (
            expandedFolders.has(item.id) ? (
              <FolderOpen size={14} className="text-amber-500 shrink-0" />
            ) : (
              <FolderClosed size={14} className="text-amber-500 shrink-0" />
            )
          ) : (
            <File
              size={14}
              className="shrink-0"
              style={{
                color:
                  activeFileId === item.id
                    ? "var(--app-accent)"
                    : "var(--app-text-muted)",
              }}
            />
          )}

          {isRenaming === item.id ? (
            <div
              className="flex-1 flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(item.id);
                  if (e.key === "Escape") onCancelRename();
                }}
                className="flex-1 px-1 py-0 text-xs rounded border bg-transparent"
                style={{
                  borderColor: "var(--app-accent)",
                  color: "var(--app-text)",
                }}
              />
              <button
                onClick={() => handleRename(item.id)}
                className="p-0.5 rounded hover:bg-green-100"
              >
                <Check size={12} className="text-green-600" />
              </button>
              <button
                onClick={onCancelRename}
                className="p-0.5 rounded hover:bg-red-100"
              >
                <X size={12} className="text-red-500" />
              </button>
            </div>
          ) : (
            <span
              className="flex-1 text-xs truncate"
              style={{ color: "var(--app-text)" }}
            >
              {item.name}
            </span>
          )}

          {isRenaming !== item.id && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {item.isFolder && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCreate("file", item.id);
                  }}
                  className="p-0.5 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30"
                  title={isFa ? "فایل جدید" : "New file"}
                >
                  <Plus size={12} className="text-blue-500" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRenameValue(item.name);
                  onStartRename(item.id);
                }}
                className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                title={isFa ? "تغییر نام" : "Rename"}
              >
                <Pencil size={12} className="text-[var(--app-text-muted)]" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(isFa ? "حذف شود؟" : "Delete?"))
                    onDeleteItem(item.id);
                }}
                className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                title={isFa ? "حذف" : "Delete"}
              >
                <Trash2 size={12} className="text-red-500" />
              </button>
            </div>
          )}
        </div>
        {item.isFolder &&
          expandedFolders.has(item.id) &&
          renderTree(item.id, depth + 1)}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: "var(--app-card)" }}
    >
      <div
        className="flex items-center justify-between p-3 border-b"
        style={{ borderColor: "var(--app-border)" }}
      >
        <span
          className="text-xs font-bold uppercase tracking-wider"
          style={{ color: "var(--app-text-muted)" }}
        >
          {isFa ? "فایل‌ها" : "Explorer"}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => document.getElementById("file-import")?.click()}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isFa ? "وارد کردن فایل" : "Import file"}
          >
            <Upload size={14} style={{ color: "var(--app-text-muted)" }} />
          </button>
          <button
            onClick={() => onStartCreate("folder", null)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isFa ? "پوشه جدید" : "New folder"}
          >
            <FolderPlus size={14} style={{ color: "var(--app-text-muted)" }} />
          </button>
          <button
            onClick={() => onStartCreate("file", null)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isFa ? "فایل جدید" : "New file"}
          >
            <Plus size={14} style={{ color: "var(--app-text-muted)" }} />
          </button>
        </div>
        <input
          id="file-import"
          ref={fileInputRef}
          type="file"
          onChange={handleFileImport}
          className="hidden"
          accept=".js,.ts,.jsx,.tsx,.html,.css,.json,.md,.py,.txt"
        />
      </div>

      <div
        className="p-2 border-b"
        style={{ borderColor: "var(--app-border)" }}
      >
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)]"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isFa ? "جستجو..." : "Search..."}
            className="w-full pl-7 pr-2 py-1 text-xs rounded border bg-transparent"
            style={{
              borderColor: "var(--app-border)",
              color: "var(--app-text)",
            }}
          />
        </div>
      </div>

      {isCreating && (
        <div
          className="p-3 border-b"
          style={{ borderColor: "var(--app-border)" }}
        >
          <div className="flex flex-col gap-2">
            <input
              autoFocus
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") {
                  setNewName("");
                  onCancelCreate();
                }
              }}
              placeholder={
                isCreating.type === "file" ? "filename.ext" : "folder name"
              }
              className="w-full px-2 py-1 text-xs rounded border bg-transparent"
              style={{
                borderColor: "var(--app-border)",
                color: "var(--app-text)",
              }}
            />
            {isCreating.type === "file" && (
              <CustomDropdown
                options={languageOptions}
                value={newLanguage}
                onChange={(val) => setNewLanguage(val as SupportedLanguage)}
                placeholder={isFa ? "انتخاب زبان" : "Select language"}
                className="text-xs"
              />
            )}
            <div className="flex gap-1">
              <button
                onClick={handleCreate}
                className="flex-1 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                {isFa ? "ایجاد" : "Create"}
              </button>
              <button
                onClick={() => {
                  setNewName("");
                  onCancelCreate();
                }}
                className="px-2 py-1 text-xs rounded border"
                style={{
                  borderColor: "var(--app-border)",
                  color: "var(--app-text-muted)",
                }}
              >
                {isFa ? "لغو" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className="flex-1 overflow-y-auto p-1"
        onDragOver={(e) => handleDragOver(e, null)}
        onDrop={(e) => handleDrop(e, null)}
      >
        {renderTree(null)}
        {getChildren(null).length === 0 && !searchQuery && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📂</div>
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              {isFa ? "فایلی وجود ندارد" : "No files yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
