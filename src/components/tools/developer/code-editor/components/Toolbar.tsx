// components/tools/developer/code-editor/components/Toolbar.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Save,
  Maximize2,
  Minimize2,
  FolderOutput,
  FileOutput,
  RotateCcw,
  Check,
  X,
  FolderOpen,
  FolderDown,
  HardDrive,
  Sparkles,
  Zap,
  MoreHorizontal,
} from "lucide-react";
import { VirtualFile } from "../types";

interface ToolbarProps {
  activeFile: VirtualFile | null;
  totalFiles: number;
  totalFolders: number;
  hasUnsavedChanges: boolean;
  isFullscreen: boolean;
  proMode: boolean;
  isMobile: boolean;
  onSave: () => void;
  onExportFile: (fileId: string) => void;
  onExportAll: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onToggleProMode: () => void;
  onOpenFolder: () => void;
  onSaveToDisk: () => void;
  onSaveAllToDisk: () => void;
  isFileSystemSupported: boolean;
  theme: any;
  locale: string;
}

export default function Toolbar({
  activeFile,
  totalFiles,
  totalFolders,
  hasUnsavedChanges,
  isFullscreen,
  proMode,
  isMobile,
  onSave,
  onExportFile,
  onExportAll,
  onReset,
  onToggleFullscreen,
  onToggleProMode,
  onOpenFolder,
  onSaveToDisk,
  onSaveAllToDisk,
  isFileSystemSupported,
  theme,
  locale,
}: ToolbarProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null,
  );
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const isFa = locale === "fa";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Anchor the mobile "More" menu using fixed coordinates so no ancestor with
  // overflow:hidden (fullscreen container, toolbar) can clip it.
  const openMoreMenu = () => {
    const rect = moreBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setMenuPos({
        top: rect.bottom + 6,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    setShowMore((v) => !v);
  };

  const primaryActions = (
    <>
      <Btn
        icon={Save}
        tooltip={isFa ? "ذخیره (Ctrl+S)" : "Save (Ctrl+S)"}
        onClick={onSave}
      />
      <Btn
        icon={proMode ? Zap : Sparkles}
        tooltip={
          proMode
            ? isFa
              ? "حالت ساده"
              : "Simple Mode"
            : isFa
              ? "حالت حرفه‌ای"
              : "Pro Mode"
        }
        onClick={onToggleProMode}
        active={proMode}
      >
        <span className="text-xs font-medium">
          {proMode ? "Pro" : isFa ? "پیشرفته" : "Pro"}
        </span>
      </Btn>

      {isMobile && (
        <div className="relative">
          <button
            ref={moreBtnRef}
            onClick={openMoreMenu}
            className="p-1.5 rounded transition-colors flex items-center gap-1 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            style={{ color: "var(--app-text-muted)" }}
            title={isFa ? "بیشتر" : "More"}
          >
            <MoreHorizontal size={14} />
          </button>
          {mounted &&
            showMore &&
            menuPos &&
            createPortal(
              <>
                <div
                  className="fixed inset-0 z-[90]"
                  onClick={() => setShowMore(false)}
                />
                <div
                  className="fixed z-[95] w-56 max-h-[70vh] overflow-y-auto p-1.5 rounded-xl border shadow-2xl"
                  style={{
                    top: menuPos.top,
                    right: menuPos.right,
                    backgroundColor: "var(--app-card)",
                    borderColor: "var(--app-border)",
                  }}
                >
                {mounted && isFileSystemSupported && (
                  <>
                    <MoreBtn
                      icon={FolderOpen}
                      label={isFa ? "باز کردن پوشه" : "Open folder"}
                      onClick={() => {
                        onOpenFolder();
                        setShowMore(false);
                      }}
                    />
                    {activeFile && (
                      <MoreBtn
                        icon={HardDrive}
                        label={isFa ? "ذخیره در دیسک" : "Save to disk"}
                        onClick={() => {
                          onSaveToDisk();
                          setShowMore(false);
                        }}
                      />
                    )}
                    <MoreBtn
                      icon={FolderDown}
                      label={isFa ? "ذخیره همه" : "Save all"}
                      onClick={() => {
                        onSaveAllToDisk();
                        setShowMore(false);
                      }}
                    />
                    <div
                      className="my-1 border-t"
                      style={{ borderColor: "var(--app-border)" }}
                    />
                  </>
                )}
                {activeFile && (
                  <MoreBtn
                    icon={FileOutput}
                    label={isFa ? "دانلود فایل" : "Download file"}
                    onClick={() => {
                      onExportFile(activeFile.id);
                      setShowMore(false);
                    }}
                  />
                )}
                <MoreBtn
                  icon={FolderOutput}
                  label={isFa ? "دانلود پروژه" : "Download project"}
                  onClick={() => {
                    onExportAll();
                    setShowMore(false);
                  }}
                />
                <div
                  className="my-1 border-t"
                  style={{ borderColor: "var(--app-border)" }}
                />
                <MoreBtn
                  icon={RotateCcw}
                  label={isFa ? "ریست" : "Reset"}
                  onClick={() => {
                    onReset();
                    setShowMore(false);
                  }}
                  danger
                />
                <MoreBtn
                  icon={isFullscreen ? Minimize2 : Maximize2}
                  label={
                    isFullscreen
                      ? isFa
                        ? "خروج تمام صفحه"
                        : "Exit fullscreen"
                      : isFa
                        ? "تمام صفحه"
                        : "Fullscreen"
                  }
                  onClick={() => {
                    onToggleFullscreen();
                    setShowMore(false);
                  }}
                />
                </div>
              </>,
              document.body,
            )}
        </div>
      )}
    </>
  );

  const secondaryActions = !isMobile && (
    <>
      {mounted && isFileSystemSupported && (
        <Btn
          icon={FolderOpen}
          tooltip={isFa ? "باز کردن پوشه" : "Open folder"}
          onClick={onOpenFolder}
        />
      )}
      {mounted && isFileSystemSupported && activeFile && (
        <Btn
          icon={HardDrive}
          tooltip={isFa ? "ذخیره در دیسک" : "Save to disk"}
          onClick={onSaveToDisk}
        />
      )}
      {mounted && isFileSystemSupported && (
        <Btn
          icon={FolderDown}
          tooltip={isFa ? "ذخیره همه در دیسک" : "Save all to disk"}
          onClick={onSaveAllToDisk}
          className="text-[var(--app-success-text)]"
        />
      )}
      {mounted && isFileSystemSupported && (
        <div
          className="w-px h-5 mx-0.5"
          style={{ backgroundColor: "var(--app-border)" }}
        />
      )}
      {activeFile && (
        <Btn
          icon={FileOutput}
          tooltip={isFa ? "دانلود فایل" : "Download file"}
          onClick={() => onExportFile(activeFile.id)}
        />
      )}
      <Btn
        icon={FolderOutput}
        tooltip={isFa ? "دانلود پروژه (JSON)" : "Download project (JSON)"}
        onClick={onExportAll}
      />
      <div
        className="w-px h-5 mx-0.5"
        style={{ backgroundColor: "var(--app-border)" }}
      />
      {showResetConfirm ? (
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-[var(--app-error-text)] whitespace-nowrap">
            {isFa ? "مطمئنی؟" : "Sure?"}
          </span>
          <button
            onClick={() => {
              onReset();
              setShowResetConfirm(false);
            }}
            className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
          >
            <Check size={12} />
          </button>
          <button
            onClick={() => setShowResetConfirm(false)}
            className="p-1 rounded border"
            style={{ borderColor: "var(--app-border)" }}
          >
            <X size={12} style={{ color: "var(--app-text)" }} />
          </button>
        </div>
      ) : (
        <Btn
          icon={RotateCcw}
          tooltip={isFa ? "ریست همه" : "Reset all"}
          onClick={() => setShowResetConfirm(true)}
          danger
        />
      )}
      <div
        className="w-px h-5 mx-0.5"
        style={{ backgroundColor: "var(--app-border)" }}
      />
      <Btn
        icon={isFullscreen ? Minimize2 : Maximize2}
        tooltip={
          isFullscreen
            ? isFa
              ? "خروج از تمام صفحه"
              : "Exit fullscreen"
            : isFa
              ? "تمام صفحه"
              : "Fullscreen"
        }
        onClick={onToggleFullscreen}
      />
    </>
  );

  return (
    <div
      className="flex items-center justify-between px-2 md:px-3 py-1.5 border-b"
      style={{
        backgroundColor: "var(--app-card)",
        borderColor: "var(--app-border)",
      }}
    >
      <div
        className="flex items-center gap-2 text-xs min-w-0"
        style={{ color: "var(--app-text-muted)" }}
      >
        <div className="flex items-center gap-1 shrink-0">
          <span>📁 {totalFolders}</span>
          <span>📄 {totalFiles}</span>
        </div>
        {activeFile && (
          <>
            <span
              className="w-px h-3 shrink-0"
              style={{ backgroundColor: "var(--app-border)" }}
            />
            <span className="truncate max-w-[80px] md:max-w-[150px]">
              {activeFile.name}
            </span>
            <span
              className="w-px h-3 shrink-0 hidden sm:block"
              style={{ backgroundColor: "var(--app-border)" }}
            />
            <span className="hidden sm:inline shrink-0">
              {activeFile.content.split("\n").length} {isFa ? "خط" : "lines"}
            </span>
          </>
        )}
        {hasUnsavedChanges && (
          <span className="text-[var(--app-warning-text)] text-[11px] shrink-0">
            ● {isFa ? "ذخیره نشده" : "Unsaved"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
        {primaryActions}
        {secondaryActions}
      </div>
    </div>
  );
}

function Btn({
  icon: Icon,
  tooltip,
  onClick,
  danger,
  className,
  active,
  children,
}: {
  icon?: any;
  tooltip: string;
  onClick: () => void;
  danger?: boolean;
  className?: string;
  active?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded transition-colors flex items-center gap-1 text-xs ${
        active
          ? "bg-purple-600 text-white hover:bg-purple-700"
          : danger
            ? "text-[var(--app-error-text)] hover:bg-[var(--app-error-bg)]"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
      } ${className || ""}`}
      style={{
        color: active
          ? "#fff"
          : danger
            ? "var(--app-error-text)"
            : "var(--app-text-muted)",
      }}
      title={tooltip}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function MoreBtn({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
        danger
          ? "text-[var(--app-error-text)] hover:bg-[var(--app-error-bg)]"
          : "hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
      style={{ color: danger ? "var(--app-error-text)" : "var(--app-text)" }}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );
}
