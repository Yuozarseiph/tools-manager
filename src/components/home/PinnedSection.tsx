"use client";
import { memo, useState } from "react";
import Link from "next/link";
import {
  Pin,
  PinOff,
  Download,
  Upload,
  X,
  Trash2,
  HelpCircle,
} from "lucide-react";
import { PinnedLayoutMode, ToolWithText } from "./types";
import HelpModal from "./HelpModal";

interface PinnedSectionProps {
  pinnedTools: ToolWithText[];
  onRemove: (id: string, e: React.MouseEvent) => void;
  onExport: () => void;
  onImport: () => void;
  layout: PinnedLayoutMode;
  theme: any;
  uiText: any;
  locale: string;
}

const getContainerClass = (layout: PinnedLayoutMode): string => {
  switch (layout) {
    case "horizontal-scroll":
      return "flex overflow-x-auto scrollbar-hide gap-2 pb-2";
    case "grid-small":
      return "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5";
    case "grid-medium":
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 sm:gap-2";
    case "grid-large":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3";
    case "minimal":
      return "flex flex-wrap gap-1";
    default:
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2";
  }
};

const PinnedCard = memo(
  ({
    tool,
    onRemove,
    theme,
    layout,
    locale,
    deleteMode,
  }: {
    tool: ToolWithText;
    onRemove: (id: string, e: React.MouseEvent) => void;
    theme: any;
    layout: PinnedLayoutMode;
    locale: string;
    deleteMode: boolean;
  }) => {
    const isHorizontal = layout === "horizontal-scroll";
    const isMinimal = layout === "minimal";
    return (
      <Link
        href={tool.href}
        className={`group relative flex items-center p-2 rounded-lg border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${isHorizontal ? "w-24 shrink-0" : isMinimal ? "" : "flex-col text-center"} ${theme.card} ${theme.border} ${tool.status === "coming-soon" ? "opacity-60 grayscale pointer-events-none" : ""} ${isMinimal ? "gap-2" : "gap-1"}`}
      >
        {deleteMode && (
          <button
            onClick={(e) => onRemove(tool.id, e)}
            className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors"
            title={locale === "fa" ? "حذف از پین‌ها" : "Remove from pins"}
          >
            <X size={10} />
          </button>
        )}
        <div
          className={`shrink-0 rounded-lg flex items-center justify-center ${theme.secondary} ${isMinimal ? "w-6 h-6" : "w-8 h-8"}`}
        >
          <tool.Icon
            className={`${isMinimal ? "w-3.5 h-3.5" : "w-4 h-4"} ${theme.accent}`}
          />
        </div>
        <span
          className={`font-medium ${theme.text} truncate ${isMinimal ? "text-xs" : "text-[9px] sm:text-[10px] line-clamp-2"}`}
        >
          {tool.title}
        </span>
      </Link>
    );
  },
);
PinnedCard.displayName = "PinnedCard";

export const PinnedSection = memo(
  ({
    pinnedTools,
    onRemove,
    onExport,
    onImport,
    layout,
    theme,
    uiText,
    locale,
  }: PinnedSectionProps) => {
    const containerClass = getContainerClass(layout);
    const isRTL = locale === "fa";
    const [deleteMode, setDeleteMode] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    return (
      <>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-0">
          <div
            className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 shadow-sm ${theme.card} ${theme.border}`}
          >
            <div
              className={`flex items-center justify-between mb-3 ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <Pin size={16} className={theme.accent} />
                <h3 className={`text-xs sm:text-sm font-bold ${theme.text}`}>
                  {uiText.pinnedTitle}
                </h3>
                {pinnedTools.length > 0 && (
                  <span
                    className={`text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full ${theme.textMuted} ${theme.secondary}`}
                  >
                    {pinnedTools.length}
                  </span>
                )}
              </div>
              <div
                className={`flex items-center gap-0.5 ${isRTL ? "flex-row-reverse" : ""}`}
              >
                <button
                  onClick={() => setShowHelp(true)}
                  className={`p-1.5 rounded-lg transition-colors ${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/10`}
                  title={locale === "fa" ? "راهنما" : "Help"}
                >
                  <HelpCircle size={14} />
                </button>
                {pinnedTools.length > 0 && (
                  <button
                    onClick={() => setDeleteMode(!deleteMode)}
                    className={`p-1.5 rounded-lg transition-all ${deleteMode ? "bg-red-500 text-white hover:bg-red-600" : `${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/10`}`}
                    title={locale === "fa" ? "حالت حذف" : "Delete Mode"}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button
                  onClick={onExport}
                  className={`p-1.5 rounded-lg transition-colors ${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/10`}
                  title={uiText.exportTitle}
                >
                  <Upload size={14} />
                </button>
                <button
                  onClick={onImport}
                  className={`p-1.5 rounded-lg transition-colors ${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/10`}
                  title={uiText.importTitle}
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
            {pinnedTools.length > 0 ? (
              <div className={containerClass}>
                {pinnedTools.map((tool, index) => (
                  <PinnedCard
                    key={`pinned-${tool.id}-${index}`}
                    tool={tool}
                    onRemove={onRemove}
                    theme={theme}
                    layout={layout}
                    locale={locale}
                    deleteMode={deleteMode}
                  />
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-6 sm:py-8 ${theme.textMuted} text-xs sm:text-sm`}
              >
                <PinOff size={22} className="mx-auto mb-2 opacity-30" />
                {uiText.noPinned}
              </div>
            )}
            {deleteMode && pinnedTools.length > 0 && (
              <div className={`mt-3 pt-3 border-t ${theme.border} text-center`}>
                <p className="text-[10px] text-red-500 dark:text-red-400 flex items-center justify-center gap-1">
                  <X size={10} />
                  <span>
                    {locale === "fa"
                      ? "برای حذف پین روی دکمه قرمز کلیک کنید"
                      : "Click the red button to unpin"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
        <HelpModal
          isOpen={showHelp}
          onClose={() => setShowHelp(false)}
          theme={theme}
          locale={locale}
          type="pinned"
        />
      </>
    );
  },
);
PinnedSection.displayName = "PinnedSection";
