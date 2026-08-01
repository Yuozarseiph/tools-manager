// components/tools/developer/code-editor/CodeEditorTool.tsx
"use client";
import { useCallback, useState, useEffect } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useFileSystem } from "./hooks/useFileSystem";
import Editor from "./components/Editor";
import SimpleEditor from "./components/SimpleEditor";
import FileExplorer from "./components/FileExplorer";
import FileTabs from "./components/FileTabs";
import Toolbar from "./components/Toolbar";
import { SidebarClose, SidebarOpen, Menu } from "lucide-react";

interface CodeEditorToolProps {
  locale: string;
}

export default function CodeEditorTool({ locale }: CodeEditorToolProps) {
  const theme = useThemeColors();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [proMode, setProMode] = useState(false);

  const {
    files,
    tabs,
    activeFileId,
    activeFile,
    expandedFolders,
    isCreating,
    isRenaming,
    isLoading,
    hasUnsavedChanges,
    createItem,
    createFolder,
    deleteItem,
    renameItem,
    moveItem,
    updateContent,
    openTab,
    closeTab,
    importFile,
    exportAll,
    exportFile,
    openFolder,
    saveToDisk,
    saveAllToDisk,
    toggleFolder,
    resetAll,
    forceSave,
    setIsCreating,
    setIsRenaming,
    isFileSystemSupported,
  } = useFileSystem();

  const isFa = locale === "fa";

  // ✅ جایگزینی resize با matchMedia برای جلوگیری از تداخل کیبورد موبایل
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const handleMatch = (e: MediaQueryListEvent | MediaQueryList) => {
      const mobile = e.matches;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };
    handleMatch(mql);
    mql.addEventListener("change", handleMatch);
    setIsReady(true);
    return () => mql.removeEventListener("change", handleMatch);
  }, []);

  useEffect(() => {
    const handleEditorSave = () => forceSave();
    window.addEventListener("editor-save", handleEditorSave);
    return () => window.removeEventListener("editor-save", handleEditorSave);
  }, [forceSave]);

  const handleSave = useCallback(() => forceSave(), [forceSave]);
  const toggleProMode = () => setProMode((prev) => !prev);

  const containerClass = isFullscreen
    ? "fixed inset-0 z-50"
    : "h-[80vh] md:h-[85vh] rounded-xl border overflow-hidden shadow-xl";

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[var(--app-accent)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm" style={{ color: "var(--app-text-muted)" }}>
            {isFa ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col ${containerClass}`}
      style={{
        backgroundColor: "var(--app-bg)",
        borderColor: isFullscreen ? "transparent" : "var(--app-border)",
      }}
    >
      <Toolbar
        activeFile={activeFile}
        totalFiles={files.filter((f) => !f.isFolder).length}
        totalFolders={files.filter((f) => f.isFolder).length}
        hasUnsavedChanges={hasUnsavedChanges}
        isFullscreen={isFullscreen}
        proMode={proMode}
        isMobile={isMobile}
        onSave={handleSave}
        onExportFile={exportFile}
        onExportAll={exportAll}
        onReset={resetAll}
        onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
        onToggleProMode={toggleProMode}
        onOpenFolder={openFolder}
        onSaveToDisk={() => activeFile && saveToDisk(activeFile.id)}
        onSaveAllToDisk={saveAllToDisk}
        isFileSystemSupported={isFileSystemSupported}
        theme={theme}
        locale={locale}
      />

      {proMode && tabs.length > 0 && (
        <FileTabs
          files={files}
          tabs={tabs}
          activeFileId={activeFileId}
          onTabClick={openTab}
          onTabClose={closeTab}
          theme={theme}
        />
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop sidebar toggle */}
        {!isMobile && (
          <button
            onClick={() => setIsSidebarOpen((prev) => !prev)}
            className="absolute top-2 left-2 z-20 p-1.5 rounded-lg bg-[var(--app-card)] border shadow-md hover:shadow-lg transition-all"
            style={{ borderColor: "var(--app-border)" }}
            title={
              isFa
                ? isSidebarOpen
                  ? "بستن منو"
                  : "باز کردن منو"
                : isSidebarOpen
                  ? "Close sidebar"
                  : "Open sidebar"
            }
          >
            {isSidebarOpen ? (
              <SidebarClose
                size={16}
                style={{ color: "var(--app-text-muted)" }}
              />
            ) : (
              <SidebarOpen
                size={16}
                style={{ color: "var(--app-text-muted)" }}
              />
            )}
          </button>
        )}

        {/* Mobile open sidebar button */}
        {isMobile && !isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-2 left-2 z-20 p-2 rounded-xl bg-[var(--app-card)] border shadow-lg active:scale-95 transition-transform"
            style={{ borderColor: "var(--app-border)" }}
          >
            <Menu size={18} style={{ color: "var(--app-text-muted)" }} />
          </button>
        )}

        {/* Sidebar */}
        <div
          className={`${
            isMobile
              ? `absolute inset-y-0 left-0 z-10 w-72 transition-transform duration-300 shadow-2xl ${
                  isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : isSidebarOpen
                ? "w-64"
                : "w-0"
          } shrink-0 overflow-hidden border-r flex flex-col`}
          style={{
            borderColor: "var(--app-border)",
            backgroundColor: "var(--app-card)",
          }}
        >
          {/* Mobile close button */}
          {isMobile && (
            <div
              className="flex items-center justify-between p-2 border-b shrink-0"
              style={{ borderColor: "var(--app-border)" }}
            >
              <span
                className="text-xs font-bold px-2"
                style={{ color: "var(--app-text-muted)" }}
              >
                {isFa ? "فایل‌ها" : "Explorer"}
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <SidebarClose
                  size={18}
                  style={{ color: "var(--app-text-muted)" }}
                />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <FileExplorer
              files={files}
              activeFileId={activeFileId}
              expandedFolders={expandedFolders}
              isCreating={isCreating}
              isRenaming={isRenaming}
              isLoading={isLoading}
              onToggleFolder={toggleFolder}
              onCreateItem={(name, lang, parentId, isFolder) => {
                if (isFolder) createFolder(name, "folder", parentId, true);
                else createItem(name, lang, parentId, false);
                if (isMobile) setTimeout(() => setIsSidebarOpen(false), 500);
              }}
              onDeleteItem={deleteItem}
              onRenameItem={renameItem}
              onMoveItem={moveItem}
              onFileClick={(fileId) => {
                openTab(fileId);
                if (isMobile) setTimeout(() => setIsSidebarOpen(false), 300);
              }}
              onImportFile={importFile}
              onCancelCreate={() => setIsCreating(null)}
              onCancelRename={() => setIsRenaming(null)}
              onStartCreate={(type, parentId) => {
                setIsCreating({ type, parentId });
                if (isMobile) setIsSidebarOpen(true);
              }}
              onStartRename={(id) => {
                setIsRenaming(id);
                if (isMobile) setIsSidebarOpen(true);
              }}
              theme={theme}
              locale={locale}
            />
          </div>
        </div>

        {/* Mobile overlay - prevents closing when input is focused or creating/renaming */}
        {isMobile && isSidebarOpen && !isCreating && !isRenaming && (
          <div
            className="absolute inset-0 z-[5] bg-black/30 backdrop-blur-sm"
            onClick={(e) => {
              // جلوگیری از بسته شدن هنگام فوکوس روی اینپوت‌ها
              const target = e.target as HTMLElement;
              if (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
                return;
              setIsSidebarOpen(false);
            }}
          />
        )}

        {/* Editor */}
        {proMode ? (
          <Editor
            file={activeFile}
            onContentChange={updateContent}
            theme={theme}
          />
        ) : (
          <SimpleEditor
            file={activeFile}
            onContentChange={updateContent}
            theme={theme}
            locale={locale}
          />
        )}
      </div>
    </div>
  );
}
