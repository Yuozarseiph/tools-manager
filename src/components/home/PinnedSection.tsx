"use client";

import { memo, useState } from "react";
import type { ReactNode } from "react";
import Link from "@/components/LocalizedLink";
import {
  Download,
  HelpCircle,
  Pin,
  PinOff,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import HelpModal from "./HelpModal";
import { PinnedLayoutMode, ToolWithText } from "./types";

interface PinnedSectionProps {
  pinnedTools: ToolWithText[];
  onRemove: (id: string, e: React.MouseEvent) => void;
  onExport: () => void;
  onImport: () => void;
  layout: PinnedLayoutMode;
  theme: any;
  uiText: any;
  locale: string;
  layoutControls?: ReactNode;
}

const getContainerClass = (layout: PinnedLayoutMode): string => {
  switch (layout) {
    case "horizontal-scroll":
      return "flex overflow-x-auto scrollbar-hide gap-2 pb-1";
    case "grid-small":
      return "grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2";
    case "grid-medium":
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2";
    case "grid-large":
      return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5";
    case "minimal":
      return "flex flex-wrap gap-2";
    default:
      return "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2";
  }
};

const PinnedCard = memo(function PinnedCard({
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
}) {
  const horizontal = layout === "horizontal-scroll";
  const minimal = layout === "minimal";

  return (
    <div
      className={`group relative rounded-[16px] border ${theme.card} ${theme.border} ${
        horizontal ? "w-28 shrink-0" : ""
      }`}
    >
      <Link
        href={tool.href}
        className={`flex min-h-14 items-center rounded-[16px] p-2.5 transition-shadow hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${
          minimal ? "gap-2" : "flex-col justify-center gap-1.5 text-center"
        } ${
          tool.status === "coming-soon"
            ? "pointer-events-none opacity-50 grayscale"
            : ""
        }`}
      >
        <div
          className={`flex shrink-0 items-center justify-center rounded-[12px] ${theme.secondary} ${
            minimal ? "h-8 w-8" : "h-9 w-9"
          }`}
        >
          <tool.Icon
            className={`${minimal ? "h-4 w-4" : "h-[18px] w-[18px]"} ${theme.accent}`}
            aria-hidden="true"
          />
        </div>

        <span
          className={`max-w-full truncate font-bold ${theme.text} ${
            minimal ? "text-xs" : "text-xs"
          }`}
        >
          {tool.title}
        </span>
      </Link>

      {deleteMode && (
        <button
          type="button"
          onClick={(event) => onRemove(tool.id, event)}
          className="absolute -end-1.5 -top-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
          aria-label={
            locale === "fa"
              ? `حذف ${tool.title} از پین‌ها`
              : `Remove ${tool.title} from pins`
          }
        >
          <X size={13} aria-hidden="true" />
        </button>
      )}
    </div>
  );
});

PinnedCard.displayName = "PinnedCard";

export const PinnedSection = memo(function PinnedSection({
  pinnedTools,
  onRemove,
  onExport,
  onImport,
  layout,
  theme,
  uiText,
  locale,
  layoutControls,
}: PinnedSectionProps) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const isFa = locale === "fa";

  if (pinnedTools.length === 0) {
    return (
      <>
        <div
          className={`flex flex-col gap-3 rounded-[20px] border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${theme.card} ${theme.border}`}
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
            >
              <PinOff size={17} className={theme.accent} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className={`text-sm font-black ${theme.text}`}>
                {uiText.noPinned}
              </div>
              <div className={`mt-1 text-sm leading-6 ${theme.textMuted}`}>
                {isFa
                  ? "ابزارهای پرکاربرد را پین کن تا سریع‌تر به آن‌ها برسی."
                  : "Pin frequently used tools for quicker access."}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {layoutControls}
            <IconButton
              label={isFa ? "راهنمای پین‌ها" : "Pinned tools help"}
              onClick={() => setShowHelp(true)}
              icon={HelpCircle}
              theme={theme}
            />
            <IconButton
              label={uiText.importTitle}
              onClick={onImport}
              icon={Download}
              theme={theme}
            />
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
  }

  return (
    <>
      <section
        aria-labelledby="pinned-tools-title"
        className={`rounded-[22px] border p-4 sm:p-5 ${theme.card} ${theme.border}`}
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-[14px] ${theme.secondary}`}
            >
              <Pin size={17} className={theme.accent} aria-hidden="true" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="pinned-tools-title"
                  className={`text-sm font-black ${theme.text}`}
                >
                  {uiText.pinnedTitle}
                </h2>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-black ${theme.secondary} ${theme.accent}`}
                >
                  {pinnedTools.length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {layoutControls}
            <IconButton
              label={isFa ? "راهنما" : "Help"}
              onClick={() => setShowHelp(true)}
              icon={HelpCircle}
              theme={theme}
            />
            <IconButton
              label={isFa ? "حالت حذف" : "Delete mode"}
              onClick={() => setDeleteMode((value) => !value)}
              icon={Trash2}
              theme={theme}
              active={deleteMode}
              danger
            />
            <IconButton
              label={uiText.exportTitle}
              onClick={onExport}
              icon={Upload}
              theme={theme}
            />
            <IconButton
              label={uiText.importTitle}
              onClick={onImport}
              icon={Download}
              theme={theme}
            />
          </div>
        </div>

        <div className={getContainerClass(layout)}>
          {pinnedTools.map((tool) => (
            <PinnedCard
              key={tool.id}
              tool={tool}
              onRemove={onRemove}
              theme={theme}
              layout={layout}
              locale={locale}
              deleteMode={deleteMode}
            />
          ))}
        </div>
      </section>

      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        theme={theme}
        locale={locale}
        type="pinned"
      />
    </>
  );
});

PinnedSection.displayName = "PinnedSection";

function IconButton({
  label,
  onClick,
  icon: Icon,
  theme,
  active = false,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  icon: any;
  theme: any;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active || undefined}
      className={`ui-control flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
        active && danger
          ? "border-red-500 bg-red-500 text-white"
          : `${theme.card} ${theme.textMuted}`
      }`}
    >
      <Icon size={16} aria-hidden="true" />
    </button>
  );
}
