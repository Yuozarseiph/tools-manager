"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Braces, ChevronRight, Files, FolderOpen, Menu, PanelLeftClose, PanelLeftOpen, Search, X } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useTheme } from "@/context/ThemeContext";
import { useFileSystem } from "./hooks/useFileSystem";
import Editor from "./components/Editor";
import FileExplorer from "./components/FileExplorer";
import FileTabs from "./components/FileTabs";
import Toolbar from "./components/Toolbar";
import type { VirtualFile } from "./types";

interface Props { locale: string; }
type Pane = "files" | "search";

function displayPath(file: VirtualFile, all: VirtualFile[]) {
  const segments = [file.name];
  let parent = file.parentId;
  const visited = new Set<string>();
  while (parent && !visited.has(parent)) {
    visited.add(parent);
    const folder = all.find((item) => item.id === parent);
    if (!folder) break;
    segments.unshift(folder.name);
    parent = folder.parentId;
  }
  return segments.join("/");
}

export default function CodeEditorTool({ locale }: Props) {
  const theme = useThemeColors();
  const {mode} = useTheme();
  const isFa = locale === "fa";
  const rootRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(304);
  const quickInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [pane, setPane] = useState<Pane>("files");
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState("");
  const [quickIndex, setQuickIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [cursor, setCursor] = useState({line: 1, column: 1});
  const [jump, setJump] = useState<{fileId: string;line: number;token: number} | null>(null);
  const {
    files, tabs, activeFileId, activeFile, expandedFolders, isCreating,
    isRenaming, isLoading, hasUnsavedChanges, createItem, createFolder,
    deleteItem, renameItem, moveItem, updateContent, openTab, closeTab, importFile,
    exportAll, exportFile, openFolder, saveToDisk, saveAllToDisk,
    toggleFolder, resetAll, forceSave, setIsCreating, setIsRenaming,
    isFileSystemSupported,
  } = useFileSystem();

  // Native Fullscreen API: the browser puts the workspace in its top layer and
  // hides browser chrome where supported. Escape is intentionally browser-owned.
  // Never emulate fullscreen with a fixed-position overlay.
  useEffect(() => {
    const editorElement = rootRef.current;
    const sync = () => setIsFullscreen(document.fullscreenElement === editorElement);
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("fullscreenerror", sync);
    sync();
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("fullscreenerror", sync);
      if (document.fullscreenElement === editorElement) {
        void document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const element = rootRef.current;
    if (!element) return;
    setFullscreenError("");
    try {
      if (document.fullscreenElement === element) {
        await document.exitFullscreen();
      } else if (!document.fullscreenEnabled || !element.requestFullscreen) {
        throw new Error("unsupported");
      } else {
        // A fullscreen request must be initiated inside the button's user gesture.
        await element.requestFullscreen({ navigationUI: "hide" });
      }
    } catch (error) {
      console.error("Unable to change fullscreen mode", error);
      setFullscreenError(isFa
        ? "تمام‌صفحه واقعی در این مرورگر یا شرایط فعلی مجاز نیست."
        : "Native fullscreen isn't supported or allowed here.");
    }
  }, [isFa]);

  const startSidebarResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;
    const pointer = event.pointerId;
    const move = (next: PointerEvent) => {
      if (next.pointerId !== pointer) return;
      setSidebarWidth(Math.max(220, Math.min(540, startWidth + next.clientX - startX)));
    };
    const stop = (next: PointerEvent) => {
      if (next.pointerId !== pointer) return;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
  }, [sidebarWidth]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => {setIsMobile(media.matches);setIsSidebarOpen(!media.matches)};
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const save = useCallback(() => { void forceSave(); }, [forceSave]);
  const selectFile = useCallback((id: string) => {
    openTab(id);
    setQuickOpen(false);
    if (isMobile) setIsSidebarOpen(false);
  }, [openTab, isMobile]);
  const handleClose = useCallback((id: string) => {
    const tab = tabs.find((item) => item.fileId === id);
    if (tab?.isDirty && !window.confirm(isFa
      ? "تغییرات این فایل ذخیره نشده است. تب بسته شود؟"
      : "This file has unsaved changes. Close the tab?")) return;
    closeTab(id);
  }, [tabs, closeTab, isFa]);

  const projectFiles = useMemo(() => files.filter((file) => !file.isFolder), [files]);
  const quickResults = useMemo(() => {
    const query = quickQuery.trim().toLowerCase();
    return projectFiles.filter((file) => !query || displayPath(file, files).toLowerCase().includes(query)).slice(0, 40);
  }, [projectFiles, files, quickQuery]);
  const matches = useMemo(() => {
    const needle = searchQuery.trim().toLocaleLowerCase();
    if (!needle) return [];
    const result: {file: VirtualFile; line: number; excerpt: string}[] = [];
    for (const file of projectFiles) {
      for (const [line, text] of file.content.split("\n").entries()) {
        if (text.toLocaleLowerCase().includes(needle)) {
          result.push({file, line: line + 1, excerpt: text.trim().slice(0, 160)});
          if (result.length >= 120) return result;
        }
      }
    }
    return result;
  }, [projectFiles, searchQuery]);

  useEffect(() => {if (quickOpen) quickInputRef.current?.focus()}, [quickOpen]);
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const beforeUnload = (event: BeforeUnloadEvent) => {event.preventDefault();event.returnValue = "";};
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [hasUnsavedChanges]);
  useEffect(() => {if (pane === "search" && isSidebarOpen) searchInputRef.current?.focus()}, [pane, isSidebarOpen]);
  useEffect(() => {setQuickIndex(0)}, [quickQuery]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!rootRef.current?.contains(document.activeElement) && !quickOpen) return;
      const mod = event.ctrlKey || event.metaKey;
      if (!mod || event.altKey || event.defaultPrevented) return;
      const key = event.key.toLowerCase();
      if (key === "s") {event.preventDefault();save()}
      else if (key === "p" && !event.shiftKey) {event.preventDefault();setQuickQuery("");setQuickOpen(true)}
      else if (key === "b" && !event.shiftKey) {event.preventDefault();setIsSidebarOpen((v) => !v)}
      else if (key === "f" && event.shiftKey) {event.preventDefault();setPane("search");setIsSidebarOpen(true)}
      else if (key === "w" && !event.shiftKey && activeFileId) {event.preventDefault();handleClose(activeFileId)}
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [save, quickOpen, activeFileId, handleClose]);

  const workspace = (
    <div ref={rootRef} style={{ "--qf-editor-sidebar-width": `${sidebarWidth}px` } as CSSProperties}
      className={`qf-editor-workspace ${isFullscreen ? "qf-editor-fullscreen" : ""}`} dir="ltr">
      <Toolbar activeFile={activeFile} totalFiles={projectFiles.length}
        totalFolders={files.length - projectFiles.length} hasUnsavedChanges={hasUnsavedChanges}
        isFullscreen={isFullscreen} isMobile={isMobile} onSave={save}
        onExportFile={exportFile} onExportAll={exportAll} onReset={() => {
          if (!hasUnsavedChanges || window.confirm(isFa ? "تغییرات ذخیره‌نشده از دست می‌روند. ادامه می‌دهید؟" : "Unsaved changes will be lost. Continue?")) resetAll();
        }} onToggleFullscreen={() => { void toggleFullscreen(); }}
        onOpenFolder={() => void openFolder()}
        onSaveToDisk={() => {if (activeFile) void saveToDisk(activeFile.id)}}
        onSaveAllToDisk={() => void saveAllToDisk()}
        onQuickOpen={() => {setQuickQuery("");setQuickOpen(true)}}
        onSearch={() => {setPane("search");setIsSidebarOpen(true)}}
        isFileSystemSupported={isFileSystemSupported} locale={locale} />

      <div className="qf-editor-body">
        <nav className="qf-editor-activity" aria-label={isFa ? "پنل‌ها" : "Views"}>
          <button type="button" title={isFa ? "کاوشگر (Ctrl+B)" : "Explorer (Ctrl+B)"}
            aria-label={isFa ? "کاوشگر فایل‌ها" : "File explorer"} aria-pressed={pane === "files" && isSidebarOpen}
            className={pane === "files" && isSidebarOpen ? "is-active" : ""}
            onClick={() => {if (pane === "files") setIsSidebarOpen((v) => !v);else {setPane("files");setIsSidebarOpen(true)}}}>
            <Files size={21}/>
          </button>
          <button type="button" title={isFa ? "جستجو در فایل‌ها" : "Search in files"}
            aria-label={isFa ? "جستجو در فایل‌ها" : "Search in files"} aria-pressed={pane === "search" && isSidebarOpen}
            className={pane === "search" && isSidebarOpen ? "is-active" : ""}
            onClick={() => {setPane("search");setIsSidebarOpen(true)}}><Search size={21}/></button>
          <button type="button" className="qf-editor-activity-bottom" title={isFa ? "بستن یا باز کردن پنل" : "Toggle sidebar"} aria-label={isFa ? "نمایش پنل" : "Toggle sidebar"} onClick={() => setIsSidebarOpen((v) => !v)}>
            {isSidebarOpen ? <PanelLeftClose size={19}/> : <PanelLeftOpen size={19}/>}
          </button>
        </nav>

        <aside className={`qf-editor-sidebar ${isSidebarOpen ? "is-open" : ""} ${isMobile ? "is-mobile" : ""}`} aria-label={pane === "files" ? (isFa ? "کاوشگر فایل‌ها" : "Explorer") : (isFa ? "جستجوی پروژه" : "Search")}>
          <div className="qf-editor-sidebar-heading">
            <span>{pane === "files" ? (isFa ? "کاوشگر فایل‌ها" : "EXPLORER") : (isFa ? "جستجو در پروژه" : "SEARCH")}</span>
            {isMobile && <button type="button" aria-label={isFa ? "بستن" : "Close"} onClick={() => setIsSidebarOpen(false)}><X size={16}/></button>}
          </div>
          <div className="qf-editor-sidebar-content">
            {pane === "files" ? <FileExplorer files={files} activeFileId={activeFileId} expandedFolders={expandedFolders}
              isCreating={isCreating} isRenaming={isRenaming} isLoading={isLoading}
              onToggleFolder={toggleFolder} onCreateItem={(name, lang, parentId, isFolder) => {
                if (isFolder) createFolder(name, "folder", parentId, true);
                else createItem(name, lang, parentId, false);
              }} onDeleteItem={deleteItem} onRenameItem={renameItem} onMoveItem={moveItem}
              onFileClick={selectFile} onImportFile={importFile} onCancelCreate={() => setIsCreating(null)}
              onCancelRename={() => setIsRenaming(null)} onStartCreate={(type, parentId) => setIsCreating({type, parentId})}
              onStartRename={setIsRenaming} theme={theme} locale={locale} /> :
              <div className="qf-editor-search-pane" dir={isFa ? "rtl" : "ltr"}>
                <label htmlFor="qf-code-search">{isFa ? "جستجو در محتوای فایل‌ها" : "Search across files"}</label>
                <input id="qf-code-search" ref={searchInputRef} type="search" placeholder={isFa ? "عبارت موردنظر..." : "Search term..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
                <div className="qf-editor-search-count">{searchQuery.trim() ? `${matches.length}${matches.length === 120 ? "+" : ""} ${isFa ? "نتیجه" : "results"}` : (isFa ? "جستجو روی فایل‌های باز و پروژه انجام می‌شود." : "Search your workspace files.")}</div>
                <div className="qf-editor-search-results">
                  {matches.map((match) => <button key={`${match.file.id}-${match.line}`} type="button" onClick={() => {setJump({fileId: match.file.id,line:match.line,token:Date.now()});selectFile(match.file.id)}} title={`${displayPath(match.file,files)}:${match.line}`}>
                    <strong dir="ltr">{displayPath(match.file,files)} <small>:{match.line}</small></strong>
                    <span dir="ltr">{match.excerpt || " "}</span>
                  </button>)}
                </div>
              </div>}
          </div>
        </aside>
        {!isMobile && isSidebarOpen && <div className="qf-editor-splitter" role="separator"
          aria-label={isFa ? "تغییر عرض کاوشگر فایل" : "Resize Explorer"}
          aria-orientation="vertical" aria-valuemin={220} aria-valuemax={540} aria-valuenow={sidebarWidth}
          tabIndex={0} onPointerDown={startSidebarResize} onDoubleClick={() => setSidebarWidth(304)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              setSidebarWidth((v) => Math.max(220, Math.min(540, v + (event.key === "ArrowRight" ? 16 : -16))));
            }
          }} />}
        {isMobile && isSidebarOpen && <button type="button" className="qf-editor-sidebar-scrim" onClick={() => setIsSidebarOpen(false)} aria-label={isFa ? "بستن پنل" : "Close sidebar"}/>}

        <main className="qf-editor-main">
          <div className="qf-editor-title-strip">
            <button className="qf-editor-mobile-toggle" type="button" aria-label={isFa ? "باز کردن کاوشگر" : "Open explorer"} onClick={() => {setPane("files");setIsSidebarOpen(true)}}><Menu size={17}/></button>
            <FileTabs files={files} tabs={tabs} activeFileId={activeFileId} onTabClick={selectFile} onTabClose={handleClose} locale={locale}/>
          </div>
          <div className="qf-editor-breadcrumbs" dir="ltr">
            <FolderOpen size={13}/>
            <span>{activeFile ? displayPath(activeFile,files) : (isFa ? "فایلی انتخاب نشده" : "No file selected")}</span>
            {activeFile && <ChevronRight size={13}/>} {activeFile && <Braces size={13}/>} 
          </div>
          <Editor file={activeFile} onContentChange={updateContent} onCursorChange={(line,column) => setCursor({line,column})} theme={{mode}} locale={locale} jump={jump}/>
        </main>
      </div>
      {fullscreenError && <div className="qf-editor-notice" role="alert" dir={isFa ? "rtl" : "ltr"}>
        <span>{fullscreenError}</span>
        <button type="button" aria-label={isFa ? "بستن هشدار" : "Dismiss notice"} onClick={() => setFullscreenError("")}><X size={15}/></button>
      </div>}
      <footer className="qf-editor-status" aria-live="polite" dir="ltr">
        <span><span className="qf-editor-status-dot"/>{isFa ? "محلی" : "Local"}</span>
        <span className="qf-editor-status-spacer"/>
        {hasUnsavedChanges && <span>{isFa ? "تغییرات ذخیره‌نشده" : "Unsaved changes"}</span>}
        <span>Ln {cursor.line}, Col {cursor.column}</span>
        <span>{activeFile ? activeFile.language : "Plain text"}</span>
        <span>UTF-8</span>
      </footer>

      {quickOpen && <div className="qf-editor-quick-overlay" onMouseDown={(event) => {if (event.target === event.currentTarget) setQuickOpen(false)}}>
        <div className="qf-editor-quick-dialog" role="dialog" aria-modal="true" aria-label={isFa ? "باز کردن سریع فایل" : "Quick open"}>
          <div className="qf-editor-quick-input"><Search size={19}/><input ref={quickInputRef} value={quickQuery} placeholder={isFa ? "نام فایل را وارد کنید..." : "Search files by name..."} aria-label={isFa ? "جستجوی فایل" : "Search files"}
            onChange={(e) => setQuickQuery(e.target.value)} onKeyDown={(event) => {
              if (event.key === "Escape") setQuickOpen(false);
              if (event.key === "ArrowDown") {event.preventDefault();setQuickIndex((v) => Math.min(v+1,quickResults.length-1))}
              if (event.key === "ArrowUp") {event.preventDefault();setQuickIndex((v) => Math.max(0,v-1))}
              if (event.key === "Enter" && quickResults[quickIndex]) selectFile(quickResults[quickIndex].id);
            }}/><button type="button" onClick={() => setQuickOpen(false)} aria-label={isFa ? "بستن" : "Close"}><X size={17}/></button></div>
          <div className="qf-editor-quick-results">
            {quickResults.map((item, index) => <button type="button" key={item.id} className={quickIndex===index ? "is-selected" : ""} onMouseEnter={() => setQuickIndex(index)} onClick={() => selectFile(item.id)}>
              <Braces size={15}/><span dir="ltr">{displayPath(item,files)}</span><span>{item.language}</span></button>)}
            {quickResults.length === 0 && <div className="qf-editor-quick-empty">{isFa ? "فایلی پیدا نشد" : "No matching files"}</div>}
          </div>
          <div className="qf-editor-quick-footer">↑ ↓ {isFa ? "انتخاب" : "navigate"} · Enter {isFa ? "باز کردن" : "open"} · Esc {isFa ? "بستن" : "close"}</div>
        </div>
      </div>}
    </div>
  );

  return workspace;
}
