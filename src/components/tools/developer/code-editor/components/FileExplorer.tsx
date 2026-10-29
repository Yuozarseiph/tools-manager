// components/tools/developer/code-editor/components/FileExplorer.tsx
"use client";
import { AccessibleButton } from "@/components/ui/AccessibleControls";
import { AccessibleInput } from "@/components/ui/AccessibleControls";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
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
  const [isTouchDragging, setIsTouchDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragExpandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchDragRef = useRef({
    itemId: null as string | null,
    isDragging: false,
    startX: 0,
    startY: 0,
  });

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
    const imported = Array.from(e.target.files || []);
    for (const file of imported) onImportFile(file, null);
    e.target.value = "";
  };

  //  Desktop Drag & Drop
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
        if (dragExpandTimerRef.current) clearTimeout(dragExpandTimerRef.current);
        dragExpandTimerRef.current = setTimeout(() => {
          onToggleFolder(folderId);
          dragExpandTimerRef.current = null;
        }, 600);
      }
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    if (dragExpandTimerRef.current) {
      clearTimeout(dragExpandTimerRef.current);
      dragExpandTimerRef.current = null;
    }
    setDragOverFolder(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragExpandTimerRef.current) {
      clearTimeout(dragExpandTimerRef.current);
      dragExpandTimerRef.current = null;
    }
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
    if (dragExpandTimerRef.current) {
      clearTimeout(dragExpandTimerRef.current);
      dragExpandTimerRef.current = null;
    }
    setDragOverFolder(null);
    setDraggedItem(null);
  };

  //  Touch Drag & Drop (Mobile)
  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    const touch = e.touches[0];
    touchDragRef.current = {
      itemId,
      isDragging: false,
      startX: touch.clientX,
      startY: touch.clientY,
    };
    setDraggedItem(itemId);
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const state = touchDragRef.current;
    if (!state.itemId) return;
    const touch = e.touches[0];
    const dx = touch.clientX - state.startX;
    const dy = touch.clientY - state.startY;

    if (!state.isDragging && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      touchDragRef.current.isDragging = true;
      setIsTouchDragging(true);
    }

    if (touchDragRef.current.isDragging) {
      e.preventDefault();
      const elem = document.elementFromPoint(touch.clientX, touch.clientY);
      const folderElem = elem?.closest("[data-drop-target]");
      //  FIX: Convert undefined to null to match useState<string | null>
      const targetId = folderElem?.getAttribute("data-drop-target") ?? null;
      setDragOverFolder(targetId);
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const state = touchDragRef.current;
      if (state.isDragging && state.itemId) {
        const touch = e.changedTouches[0];
        const elem = document.elementFromPoint(touch.clientX, touch.clientY);
        const folderElem = elem?.closest("[data-drop-target]");
        //  FIX: Convert undefined to null
        const targetId = folderElem?.getAttribute("data-drop-target") ?? null;

        if (targetId !== null && targetId !== state.itemId) {
          const item = files.find((f) => f.id === state.itemId);
          if (item && item.parentId !== targetId) {
            onMoveItem(state.itemId, targetId === "root" ? null : targetId);
          }
        }
      }
      touchDragRef.current = {
        itemId: null,
        isDragging: false,
        startX: 0,
        startY: 0,
      };
      setIsTouchDragging(false);
      setDraggedItem(null);
      setDragOverFolder(null);
    },
    [files, onMoveItem],
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);
    return () => {
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  const visibleIds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;
    const ids = new Set<string>();
    for (const file of files) {
      if (!file.name.toLowerCase().includes(query)) continue;
      ids.add(file.id);
      const parents = new Set<string>();
      let parent = file.parentId;
      while (parent && !parents.has(parent)) {
        parents.add(parent);
        ids.add(parent);
        parent = files.find((item) => item.id === parent)?.parentId ?? null;
      }
    }
    return ids;
  }, [files, searchQuery]);

  // Build the tree once per data/search change, not once for every nested folder.
  const childrenByParent = useMemo(() => {
    const groups = new Map<string | null, VirtualFile[]>();
    for (const item of files) {
      if (visibleIds && !visibleIds.has(item.id)) continue;
      const group = groups.get(item.parentId) ?? [];
      group.push(item);
      groups.set(item.parentId, group);
    }
    for (const group of groups.values()) group.sort((a, b) =>
      a.isFolder !== b.isFolder ? (a.isFolder ? -1 : 1) : a.name.localeCompare(b.name)
    );
    return groups;
  }, [files, visibleIds]);
  const getChildren = (parentId: string | null) => childrenByParent.get(parentId) ?? [];

  const languageOptions = Object.entries(SUPPORTED_LANGUAGES).map(
    ([key, val]) => ({
      value: key,
      label: `${val.name} (${val.ext})`,
    }),
  );

  const renderTree = (parentId: string | null, depth: number = 0, ancestors = new Set<string>()) => {
    // Imported workspace metadata may be malformed; never recurse forever.
    if (depth > 64) return null;
    const children = getChildren(parentId).filter((item) => !ancestors.has(item.id));
    return children.map((item) => (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => handleDragStart(e, item.id)}
        onDragEnd={handleDragEnd}
        onTouchStart={(e) => handleTouchStart(e, item.id)}
        data-drop-target={item.isFolder ? item.id : undefined}
      >
        <div
          className={`qf-editor-tree-row group flex items-center gap-1 rounded cursor-pointer transition-colors ${
            activeFileId === item.id
              ? "bg-[var(--app-secondary-bg)]"
              : dragOverFolder === item.id
                ? "bg-[var(--app-success-bg)] ring-2 ring-[var(--app-success-border)]"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          style={{ paddingLeft: `${depth * 15 + 9}px` }}
          title={item.name}
          onClick={() => {
            if (item.isFolder) onToggleFolder(item.id);
            else onFileClick(item.id);
          }}
          onDoubleClick={() => {
            if (!item.isFolder) onFileClick(item.id);
          }}
          role="treeitem"
          tabIndex={0}
          aria-expanded={item.isFolder ? (expandedFolders.has(item.id) || !!searchQuery.trim()) : undefined}
          aria-label={item.name}
          onKeyDown={(e) => {
            if (e.target !== e.currentTarget) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (item.isFolder) onToggleFolder(item.id);
              else onFileClick(item.id);
            }
          }}
          onDragOver={(e) =>
            item.isFolder ? handleDragOver(e, item.id) : undefined
          }
          onDragLeave={handleDragLeave}
          onDrop={(e) => (item.isFolder ? handleDrop(e, item.id) : undefined)}
        >

          {item.isFolder && (
            <span className="shrink-0">
              {expandedFolders.has(item.id) || !!searchQuery.trim() ? (
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
            expandedFolders.has(item.id) || !!searchQuery.trim() ? (
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
              <AccessibleInput
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
              <AccessibleButton purpose="action"
                onClick={() => handleRename(item.id)}
                className="p-0.5 rounded hover:bg-[var(--app-success-bg)]"
              >
                <Check size={12} className="text-[var(--app-success-text)]" />
              </AccessibleButton>
              <AccessibleButton purpose="close"
                onClick={onCancelRename}
                className="qf-editor-icon-button rounded hover:bg-[var(--app-error-bg)]"
              >
                <X size={12} className="text-[var(--app-error-text)]" />
              </AccessibleButton>
            </div>
          ) : (
            <span
              className="qf-editor-tree-name flex-1 text-xs truncate"
              style={{ color: "var(--app-text)" }}
            >
              {item.name}
            </span>
          )}

          {/*  Mobile: Always visible | Desktop: Hover only */}
          {isRenaming !== item.id && (
            <div className="qf-editor-tree-actions flex items-center gap-0.5 shrink-0">
              {item.isFolder && (
                <button aria-label={isFa ? "فایل جدید" : "New file"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartCreate("file", item.id);
                  }}
                  className="qf-editor-icon-button rounded hover:bg-[var(--app-secondary-bg)]"
                  title={isFa ? "فایل جدید" : "New file"}
                >
                  <Plus size={12} className="text-[var(--app-accent)]" />
                </button>
              )}
              <button aria-label={isFa ? "تغییر نام" : "Rename"}
                onClick={(e) => {
                  e.stopPropagation();
                  setRenameValue(item.name);
                  onStartRename(item.id);
                }}
                className="qf-editor-icon-button rounded hover:bg-slate-200 dark:hover:bg-slate-700"
                title={isFa ? "تغییر نام" : "Rename"}
              >
                <Pencil size={12} className="text-[var(--app-text-muted)]" />
              </button>
              <button aria-label={isFa ? "حذف" : "Delete"}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(isFa ? "حذف شود؟" : "Delete?"))
                    onDeleteItem(item.id);
                }}
                className="qf-editor-icon-button rounded hover:bg-[var(--app-error-bg)]"
                title={isFa ? "حذف" : "Delete"}
              >
                <Trash2 size={12} className="text-[var(--app-error-text)]" />
              </button>
            </div>
          )}
        </div>
        {item.isFolder &&
          (expandedFolders.has(item.id) || !!searchQuery.trim()) &&
          renderTree(item.id, depth + 1, new Set([...ancestors, item.id]))}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-5 h-5 border-2 border-[var(--app-accent)] border-t-transparent rounded-full" />
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
          <button aria-label={isFa ? "وارد کردن فایل" : "Import file"}
            onClick={() => document.getElementById("file-import")?.click()}
            className="qf-editor-icon-button rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isFa ? "وارد کردن فایل" : "Import file"}
          >
            <Upload size={14} style={{ color: "var(--app-text-muted)" }} />
          </button>
          <button aria-label={isFa ? "پوشه جدید" : "New folder"}
            onClick={() => onStartCreate("folder", null)}
            className="qf-editor-icon-button rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isFa ? "پوشه جدید" : "New folder"}
          >
            <FolderPlus size={14} style={{ color: "var(--app-text-muted)" }} />
          </button>
          <button aria-label={isFa ? "فایل جدید" : "New file"}
            onClick={() => onStartCreate("file", null)}
            className="qf-editor-icon-button rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            title={isFa ? "فایل جدید" : "New file"}
          >
            <Plus size={14} style={{ color: "var(--app-text-muted)" }} />
          </button>
        </div>
        <AccessibleInput
          id="file-import"
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileImport}
          className="hidden"
          accept=".js,.ts,.jsx,.tsx,.html,.css,.scss,.json,.md,.py,.txt,.php,.java,.cpp,.c,.cs,.go,.rs,.sql,.xml,.yaml,.yml,.sh"
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
          <AccessibleInput
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
            <AccessibleInput
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
                className="flex-1 px-2 py-1 text-xs rounded bg-[var(--app-primary-bg)] text-white hover:bg-[var(--app-primary-hover)]"
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
        ref={containerRef}
        className="qf-editor-tree-scroll flex-1 overflow-auto p-1"
        role="tree"
        aria-label={isFa ? "فایل‌ها و پوشه‌های پروژه" : "Project files and folders"}
        data-drop-target="root"
        style={{ touchAction: isTouchDragging ? "none" : "auto" }}
        onDragOver={(e) => handleDragOver(e, null)}
        onDrop={(e) => handleDrop(e, null)}
      >
        {renderTree(null)}
        {getChildren(null).length === 0 && !searchQuery && (
          <div className="text-center py-8">
            <FolderOpen className="mx-auto mb-2 h-8 w-8" aria-hidden="true" />
            <p className="text-xs" style={{ color: "var(--app-text-muted)" }}>
              {isFa ? "فایلی وجود ندارد" : "No files yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
