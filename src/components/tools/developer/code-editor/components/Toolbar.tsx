"use client";

import { useState } from "react";
import {
  Check, Download, Files, FolderOpen, HardDriveDownload, Maximize2, Minimize2,
  MoreHorizontal, RotateCcw, Save, Search, X,
} from "lucide-react";
import type { VirtualFile } from "../types";

type Props = {
  activeFile: VirtualFile | null;
  totalFiles: number;
  totalFolders: number;
  hasUnsavedChanges: boolean;
  isFullscreen: boolean;
  isMobile: boolean;
  onSave: () => void;
  onExportFile: (fileId: string) => void;
  onExportAll: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
  onOpenFolder: () => void;
  onSaveToDisk: () => void;
  onSaveAllToDisk: () => void;
  onQuickOpen: () => void;
  onSearch: () => void;
  isFileSystemSupported: boolean;
  locale: string;
};

export default function Toolbar({
  activeFile, totalFiles, totalFolders, hasUnsavedChanges, isFullscreen,
  onSave, onExportFile, onExportAll, onReset, onToggleFullscreen,
  onOpenFolder, onSaveToDisk, onSaveAllToDisk, onQuickOpen, onSearch,
  isFileSystemSupported, locale,
}: Props) {
  const isFa = locale === "fa";
  const [more, setMore] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const buttonClass = "qf-editor-toolbar-button";
  return (
    <header className="qf-editor-toolbar" dir="ltr">
      <div className="qf-editor-brand">
        <span className="qf-editor-brand-symbol"><Files size={16}/></span>
        <span className="qf-editor-brand-label">QodeForge <strong>Code</strong></span>
        <span className="qf-editor-version">27.0.0</span>
      </div>
      <button className="qf-editor-command" onClick={onQuickOpen} type="button" title="Ctrl+P">
        <Search size={14}/>
        <span>{isFa ? "رفتن به فایل..." : "Go to file..."}</span>
        <kbd>Ctrl P</kbd>
      </button>
      <nav className="qf-editor-toolbar-actions" aria-label={isFa ? "عملیات ویرایشگر" : "Editor actions"}>
        <button type="button" className={buttonClass} title={isFa ? "جستجو در پروژه (Ctrl+Shift+F)" : "Search project (Ctrl+Shift+F)"} aria-label={isFa ? "جستجو" : "Search"} onClick={onSearch}><Search size={16}/></button>
        <button type="button" className={buttonClass} title={isFa ? "ذخیره (Ctrl+S)" : "Save (Ctrl+S)"} aria-label={isFa ? "ذخیره" : "Save"} onClick={onSave}><Save size={16}/></button>
        <button type="button" className={`${buttonClass} qf-editor-expand`} onClick={onToggleFullscreen} aria-label={isFullscreen ? (isFa ? "خروج تمام‌صفحه" : "Exit fullscreen") : (isFa ? "تمام‌صفحه" : "Fullscreen")}>{isFullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}</button>
        <div className="qf-editor-menu-anchor">
          <button type="button" className={buttonClass} aria-expanded={more} aria-label={isFa ? "عملیات بیشتر" : "More actions"} onClick={() => setMore((previous) => !previous)}><MoreHorizontal size={18}/></button>
          {more && <>
            <button className="qf-editor-menu-backdrop" type="button" onClick={() => {setMore(false); setConfirmReset(false)}} aria-label={isFa ? "بستن منو" : "Close menu"}/>
            <div className="qf-editor-menu" role="menu" dir={isFa ? "rtl" : "ltr"}>
              {isFileSystemSupported && <button type="button" role="menuitem" onClick={() => {onOpenFolder();setMore(false)}}><FolderOpen size={15}/>{isFa ? "باز کردن پوشه محلی" : "Open local folder"}</button>}
              {activeFile && <button type="button" role="menuitem" onClick={() => {onSaveToDisk();setMore(false)}}><HardDriveDownload size={15}/>{isFa ? "ذخیره فایل روی دیسک / دانلود" : "Save file to disk / download"}</button>}
              {isFileSystemSupported && <button type="button" role="menuitem" onClick={() => {onSaveAllToDisk();setMore(false)}}><Save size={15}/>{isFa ? "ذخیره فایل‌های دیسکی" : "Save disk files"}</button>}
              {activeFile && <button type="button" role="menuitem" onClick={() => {onExportFile(activeFile.id);setMore(false)}}><Download size={15}/>{isFa ? "دانلود فایل فعلی" : "Download current file"}</button>}
              <button type="button" role="menuitem" onClick={() => {onExportAll();setMore(false)}}><Download size={15}/>{isFa ? "خروجی JSON پروژه" : "Export project JSON"}</button>
              <div className="qf-editor-menu-divider"/>
              {confirmReset ? <div className="qf-editor-reset-confirm"><span>{isFa ? "همه فایل‌های محیط پاک شوند؟" : "Clear the workspace?"}</span><button type="button" onClick={() => {onReset();setMore(false);setConfirmReset(false)}} title={isFa ? "تأیید" : "Confirm"}><Check size={16}/></button><button type="button" onClick={() => setConfirmReset(false)} title={isFa ? "انصراف" : "Cancel"}><X size={16}/></button></div>
                : <button type="button" role="menuitem" className="qf-editor-destructive" onClick={() => setConfirmReset(true)}><RotateCcw size={15}/>{isFa ? "پاک کردن محیط" : "Clear workspace"}</button>}
              <div className="qf-editor-menu-meta">{totalFiles} {isFa ? "فایل" : "files"} · {totalFolders} {isFa ? "پوشه" : "folders"} {hasUnsavedChanges ? "· ●" : ""}</div>
            </div>
          </>}
        </div>
      </nav>
    </header>
  );
}
