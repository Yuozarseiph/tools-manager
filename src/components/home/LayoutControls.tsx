"use client";

import { memo, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useViewportMenu } from "@/hooks/useViewportMenu";
import {
  AlignJustify,
  Check,
  ChevronDown,
  Columns2,
  Columns3,
  Columns4,
  GripHorizontal,
  LayoutList,
  Minimize2,
  X,
} from "lucide-react";

import { PinnedLayoutMode, ToolsLayoutMode } from "./types";

interface LayoutControlsProps {
  toolsLayout: ToolsLayoutMode;
  pinnedLayout: PinnedLayoutMode;
  onToolsLayoutChange: (layout: ToolsLayoutMode) => void;
  onPinnedLayoutChange: (layout: PinnedLayoutMode) => void;
  theme: any;
  locale: string;
  mode?: "all" | "tools" | "pinned";
}

type LocaleType = "fa" | "en";

const toolOptions = [
  { value: "list-compact" as ToolsLayoutMode, icon: AlignJustify, label: { fa: "لیست فشرده", en: "Compact list" } },
  { value: "list-detail" as ToolsLayoutMode, icon: LayoutList, label: { fa: "لیست کامل", en: "Detailed list" } },
  { value: "grid-1" as ToolsLayoutMode, icon: AlignJustify, label: { fa: "یک ستون", en: "1 column" } },
  { value: "grid-2" as ToolsLayoutMode, icon: Columns2, label: { fa: "دو ستون", en: "2 columns" } },
  { value: "grid-3" as ToolsLayoutMode, icon: Columns3, label: { fa: "سه ستون", en: "3 columns" } },
  { value: "grid-4" as ToolsLayoutMode, icon: Columns4, label: { fa: "چهار ستون", en: "4 columns" } },
];

const pinnedOptions = [
  { value: "horizontal-scroll" as PinnedLayoutMode, icon: GripHorizontal, label: { fa: "اسکرول افقی", en: "Horizontal scroll" } },
  { value: "grid-small" as PinnedLayoutMode, icon: Minimize2, label: { fa: "نمایش ریز", en: "Small grid" } },
  { value: "grid-medium" as PinnedLayoutMode, icon: Columns3, label: { fa: "نمایش متوسط", en: "Medium grid" } },
  { value: "grid-large" as PinnedLayoutMode, icon: Columns4, label: { fa: "نمایش درشت", en: "Large grid" } },
  { value: "minimal" as PinnedLayoutMode, icon: AlignJustify, label: { fa: "فوق فشرده", en: "Ultra compact" } },
];

function MobileSheet({
  open,
  onClose,
  title,
  options,
  value,
  onChange,
  theme,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  options: any[];
  value: string;
  onChange: (value: any) => void;
  theme: any;
  locale: LocaleType;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label={locale === "fa" ? "بستن" : "Close"}
        onClick={onClose}
      />

      <div
        className={`relative w-full rounded-t-[28px] border-t p-3 shadow-2xl bg-[var(--app-menu)] ${theme.border}`}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-current opacity-15" />

        <div className="mb-2 flex items-center justify-between px-2">
          <h3 className={`text-base font-black ${theme.text}`}>{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${theme.secondary} ${theme.text}`}
            aria-label={locale === "fa" ? "بستن" : "Close"}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div
          className="grid gap-1"
          style={{
            paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {options.map((option) => {
            const Icon = option.icon;
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  onClose();
                }}
                className={`flex min-h-13 items-center gap-3 rounded-[16px] px-3.5 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${
                  active
                    ? `${theme.secondary} ${theme.accent}`
                    : `${theme.text} hover:bg-black/5 dark:hover:bg-white/5`
                }`}
              >
                <Icon size={17} aria-hidden="true" />
                <span className="flex-1 text-start">{option.label[locale]}</span>
                {active && <Check size={15} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}

export const LayoutControls = memo(function LayoutControls({
  toolsLayout,
  pinnedLayout,
  onToolsLayoutChange,
  onPinnedLayoutChange,
  theme,
  locale,
  mode = "all",
}: LayoutControlsProps) {
  const localeKey = locale as LocaleType;
  const [toolsOpen, setToolsOpen] = useState(false);
  const [pinnedOpen, setPinnedOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => setMobile(window.innerWidth < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (mobile) return;

    const outside = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setToolsOpen(false);
        setPinnedOpen(false);
      }
    };

    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [mobile]);

  const selectedTool = toolOptions.find((item) => item.value === toolsLayout) ?? toolOptions[3];
  const selectedPinned = pinnedOptions.find((item) => item.value === pinnedLayout) ?? pinnedOptions[2];

  return (
    <div ref={rootRef}>
      <div className="hidden items-center gap-2 sm:flex">
        {mode !== "pinned" && <Dropdown
          label={localeKey === "fa" ? "نمایش ابزارها" : "Tools view"}
          selected={selectedTool}
          options={toolOptions}
          value={toolsLayout}
          open={toolsOpen}
          onToggle={() => {
            setToolsOpen((value) => !value);
            setPinnedOpen(false);
          }}
          onChange={(value: ToolsLayoutMode) => {
            onToolsLayoutChange(value);
            setToolsOpen(false);
          }}
          theme={theme}
          locale={localeKey}
        />}

        {mode !== "tools" && <Dropdown
          label={localeKey === "fa" ? "نمایش پین‌ها" : "Pinned view"}
          selected={selectedPinned}
          options={pinnedOptions}
          value={pinnedLayout}
          open={pinnedOpen}
          onToggle={() => {
            setPinnedOpen((value) => !value);
            setToolsOpen(false);
          }}
          onChange={(value: PinnedLayoutMode) => {
            onPinnedLayoutChange(value);
            setPinnedOpen(false);
          }}
          theme={theme}
          locale={localeKey}
        />}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {mode !== "pinned" && <MobileTrigger
          label={localeKey === "fa" ? "ابزارها" : "Tools"}
          value={selectedTool.label[localeKey]}
          icon={selectedTool.icon}
          onClick={() => setToolsOpen(true)}
          theme={theme}
        />}
        {mode !== "tools" && <MobileTrigger
          label={localeKey === "fa" ? "پین‌ها" : "Pinned"}
          value={selectedPinned.label[localeKey]}
          icon={selectedPinned.icon}
          onClick={() => setPinnedOpen(true)}
          theme={theme}
        />}
      </div>

      {mobile && (
        <>
          {mode !== "pinned" && <MobileSheet
            open={toolsOpen}
            onClose={() => setToolsOpen(false)}
            title={localeKey === "fa" ? "چیدمان ابزارها" : "Tools layout"}
            options={toolOptions.filter((item) =>
              ["list-compact", "list-detail", "grid-2", "grid-4"].includes(item.value),
            )}
            value={toolsLayout}
            onChange={onToolsLayoutChange}
            theme={theme}
            locale={localeKey}
          />}

          {mode !== "tools" && <MobileSheet
            open={pinnedOpen}
            onClose={() => setPinnedOpen(false)}
            title={localeKey === "fa" ? "چیدمان پین‌ها" : "Pinned layout"}
            options={pinnedOptions}
            value={pinnedLayout}
            onChange={onPinnedLayoutChange}
            theme={theme}
            locale={localeKey}
          />}
        </>
      )}
    </div>
  );
});

LayoutControls.displayName = "LayoutControls";

function Dropdown({
  label,
  selected,
  options,
  value,
  open,
  onToggle,
  onChange,
  theme,
  locale,
}: any) {
  const Icon = selected.icon;
  const panelRef = useViewportMenu(open);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`flex min-h-12 items-center gap-2 rounded-[16px] border px-3.5 text-xs font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.card} ${theme.border} ${theme.text}`}
      >
        <Icon size={16} className={theme.accent} aria-hidden="true" />
        <span>{label}</span>
        <ChevronDown
          size={14}
          className={`${theme.textMuted} ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="menu"
          ref={panelRef}
          className={`absolute end-0 top-full z-50 mt-2 w-52 max-w-[calc(100vw-2rem)] rounded-[20px] border p-2 shadow-xl bg-[var(--app-menu)] ${theme.border}`}
        >
          {options.map((option: any) => {
            const OptionIcon = option.icon;
            const active = value === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => onChange(option.value)}
                className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-ring)] ${
                  active
                    ? `${theme.secondary} ${theme.accent}`
                    : `${theme.text} hover:bg-black/5 dark:hover:bg-white/5`
                }`}
              >
                <OptionIcon size={16} aria-hidden="true" />
                <span className="flex-1 text-start">{option.label[locale]}</span>
                {active && <Check size={14} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileTrigger({ label, value, icon: Icon, onClick, theme }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 items-center gap-2 rounded-[16px] border px-3 text-start focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.card} ${theme.border}`}
    >
      <Icon size={16} className={theme.accent} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className={`text-xs font-bold ${theme.textMuted}`}>{label}</div>
        <div className={`truncate text-xs font-black ${theme.text}`}>{value}</div>
      </div>
      <ChevronDown size={13} className={theme.textMuted} aria-hidden="true" />
    </button>
  );
}
