"use client";
import { memo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  LayoutGrid,
  LayoutList,
  AlignJustify,
  Columns2,
  Columns3,
  Columns4,
  GripHorizontal,
  Minimize2,
  ChevronDown,
  X,
} from "lucide-react";
import { ToolsLayoutMode, PinnedLayoutMode } from "./types";

interface LayoutControlsProps {
  toolsLayout: ToolsLayoutMode;
  pinnedLayout: PinnedLayoutMode;
  onToolsLayoutChange: (layout: ToolsLayoutMode) => void;
  onPinnedLayoutChange: (layout: PinnedLayoutMode) => void;
  theme: any;
  locale: string;
}
type LocaleType = "fa" | "en";

const allToolsLayoutOptions = [
  {
    value: "list-compact" as ToolsLayoutMode,
    icon: AlignJustify,
    label: { fa: "لیست فشرده", en: "Compact List" },
  },
  {
    value: "list-detail" as ToolsLayoutMode,
    icon: LayoutList,
    label: { fa: "لیست کامل", en: "Detailed List" },
  },
  {
    value: "grid-1" as ToolsLayoutMode,
    icon: AlignJustify,
    label: { fa: "گرید ۱ ستونه", en: "1 Column" },
  },
  {
    value: "grid-2" as ToolsLayoutMode,
    icon: Columns2,
    label: { fa: "گرید ۲ ستونه", en: "2 Columns" },
  },
  {
    value: "grid-3" as ToolsLayoutMode,
    icon: Columns3,
    label: { fa: "گرید ۳ ستونه", en: "3 Columns" },
  },
  {
    value: "grid-4" as ToolsLayoutMode,
    icon: Columns4,
    label: { fa: "گرید ۴ ستونه", en: "4 Columns" },
  },
];
const allToolsLayoutOptionsMobile = [
  {
    value: "list-compact" as ToolsLayoutMode,
    icon: AlignJustify,
    label: { fa: "لیست فشرده", en: "Compact List" },
  },
  {
    value: "list-detail" as ToolsLayoutMode,
    icon: LayoutList,
    label: { fa: "لیست کامل", en: "Detailed List" },
  },
  {
    value: "grid-2" as ToolsLayoutMode,
    icon: Columns2,
    label: { fa: "گرید ۱ ستونه", en: "1 Column" },
  },
  {
    value: "grid-4" as ToolsLayoutMode,
    icon: Columns4,
    label: { fa: "گرید ۲ ستونه", en: "2 Columns" },
  },
];
const mobileToolsOptions = allToolsLayoutOptionsMobile.filter((o) =>
  ["list-compact", "list-detail", "grid-2", "grid-4"].includes(o.value),
);
const pinnedLayoutOptions = [
  {
    value: "horizontal-scroll" as PinnedLayoutMode,
    icon: GripHorizontal,
    label: { fa: "اسکرول افقی", en: "Horizontal Scroll" },
  },
  {
    value: "grid-small" as PinnedLayoutMode,
    icon: Minimize2,
    label: { fa: "نمایش ریز", en: "Small Grid" },
  },
  {
    value: "grid-medium" as PinnedLayoutMode,
    icon: Columns3,
    label: { fa: "نمایش متوسط", en: "Medium Grid" },
  },
  {
    value: "grid-large" as PinnedLayoutMode,
    icon: Columns4,
    label: { fa: "نمایش درشت", en: "Large Grid" },
  },
  {
    value: "minimal" as PinnedLayoutMode,
    icon: AlignJustify,
    label: { fa: "فوق فشرده", en: "Ultra Compact" },
  },
];

const BottomSheet = ({
  isOpen,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
  theme,
  locale,
  isRTL,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: any[];
  selectedValue: string;
  onSelect: (v: any) => void;
  theme: any;
  locale: LocaleType;
  isRTL: boolean;
}) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return createPortal(
    <div
      className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 max-h-[70vh] overflow-hidden rounded-t-2xl border-t shadow-2xl transition-transform duration-300 ${theme.card} ${theme.border} ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${theme.border}`}
        >
          <h3 className={`text-base font-bold ${theme.text}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/10`}
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(70vh-64px)] p-2">
          <div className="space-y-1">
            {options.map((option) => {
              const Icon = option.icon;
              const isActive = selectedValue === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all ${isActive ? `${theme.secondary} ${theme.accent} font-bold` : `${theme.text} hover:bg-gray-100 dark:hover:bg-white/10`}`}
                >
                  <Icon
                    size={18}
                    className={isActive ? theme.accent : theme.textMuted}
                  />
                  <span>{option.label[locale]}</span>
                  {isActive && (
                    <span
                      className={`${isRTL ? "mr-auto" : "ml-auto"} text-xs ${theme.accent}`}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export const LayoutControls = memo(
  ({
    toolsLayout,
    pinnedLayout,
    onToolsLayoutChange,
    onPinnedLayoutChange,
    theme,
    locale,
  }: LayoutControlsProps) => {
    const localeKey = locale as LocaleType;
    const isRTL = locale === "fa";
    const [openToolsMenu, setOpenToolsMenu] = useState(false);
    const [openPinnedMenu, setOpenPinnedMenu] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const toolsMenuRef = useRef<HTMLDivElement>(null);
    const pinnedMenuRef = useRef<HTMLDivElement>(null);
    const toolsButtonRef = useRef<HTMLButtonElement>(null);
    const pinnedButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth < 640);
      check();
      window.addEventListener("resize", check);
      return () => window.removeEventListener("resize", check);
    }, []);
    useEffect(() => {
      if (isMobile) return;
      const h = (e: MouseEvent) => {
        if (
          toolsMenuRef.current &&
          !toolsMenuRef.current.contains(e.target as Node) &&
          toolsButtonRef.current &&
          !toolsButtonRef.current.contains(e.target as Node)
        )
          setOpenToolsMenu(false);
        if (
          pinnedMenuRef.current &&
          !pinnedMenuRef.current.contains(e.target as Node) &&
          pinnedButtonRef.current &&
          !pinnedButtonRef.current.contains(e.target as Node)
        )
          setOpenPinnedMenu(false);
      };
      if (openToolsMenu || openPinnedMenu)
        document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [openToolsMenu, openPinnedMenu, isMobile]);

    const toolsOptions = isMobile ? mobileToolsOptions : allToolsLayoutOptions;
    const currentToolsLabel =
      toolsOptions.find((o) => o.value === toolsLayout)?.label[localeKey] || "";
    const currentPinnedLabel =
      pinnedLayoutOptions.find((o) => o.value === pinnedLayout)?.label[
        localeKey
      ] || "";

    return (
      <>
        <div
          className={`hidden sm:flex ${isRTL ? "flex-row-reverse" : "flex-row"} items-stretch gap-2`}
        >
          <div className="relative" ref={toolsMenuRef}>
            <button
              ref={toolsButtonRef}
              onClick={() => {
                setOpenToolsMenu(!openToolsMenu);
                setOpenPinnedMenu(false);
              }}
              className={`h-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 border hover:shadow-md hover:-translate-y-0.5 ${theme.card} ${theme.border}`}
            >
              <LayoutGrid size={14} className={theme.accent} />
              <span className={theme.text}>
                {localeKey === "fa" ? "ابزارها" : "Tools"}
              </span>
              <ChevronDown
                size={12}
                className={`${theme.textMuted} transition-transform duration-200 ${openToolsMenu ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute top-full mt-2 ${isRTL ? "left-0" : "right-0"} z-50 w-44 p-1.5 rounded-xl border shadow-xl transition-all duration-200 origin-top ${theme.card} ${theme.border} ${openToolsMenu ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"}`}
            >
              <div
                className={`text-[10px] font-semibold px-2 py-1 mb-1 border-b ${theme.textMuted} ${theme.border}`}
              >
                {localeKey === "fa" ? "نمایش ابزارها" : "Tools Display"}
              </div>
              {allToolsLayoutOptions.map((option) => {
                const Icon = option.icon;
                const isActive = toolsLayout === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onToolsLayoutChange(option.value);
                      setOpenToolsMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all ${isActive ? `${theme.secondary} ${theme.accent} font-bold` : `${theme.text} hover:bg-gray-100 dark:hover:bg-white/10`}`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? theme.accent : theme.textMuted}
                    />
                    <span>{option.label[localeKey]}</span>
                    {isActive && (
                      <span
                        className={`${isRTL ? "mr-auto" : "ml-auto"} text-[10px] ${theme.accent}`}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="relative" ref={pinnedMenuRef}>
            <button
              ref={pinnedButtonRef}
              onClick={() => {
                setOpenPinnedMenu(!openPinnedMenu);
                setOpenToolsMenu(false);
              }}
              className={`h-full flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 border hover:shadow-md hover:-translate-y-0.5 ${theme.card} ${theme.border}`}
            >
              <LayoutGrid size={14} className={theme.accent} />
              <span className={theme.text}>
                {localeKey === "fa" ? "پین‌ها" : "Pinned"}
              </span>
              <ChevronDown
                size={12}
                className={`${theme.textMuted} transition-transform duration-200 ${openPinnedMenu ? "rotate-180" : ""}`}
              />
            </button>
            <div
              className={`absolute top-full mt-2 ${isRTL ? "left-0" : "right-0"} z-50 w-44 p-1.5 rounded-xl border shadow-xl transition-all duration-200 origin-top ${theme.card} ${theme.border} ${openPinnedMenu ? "opacity-100 visible scale-100" : "opacity-0 invisible scale-95"}`}
            >
              <div
                className={`text-[10px] font-semibold px-2 py-1 mb-1 border-b ${theme.textMuted} ${theme.border}`}
              >
                {localeKey === "fa" ? "نمایش پین‌ها" : "Pinned Display"}
              </div>
              {pinnedLayoutOptions.map((option) => {
                const Icon = option.icon;
                const isActive = pinnedLayout === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onPinnedLayoutChange(option.value);
                      setOpenPinnedMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs transition-all ${isActive ? `${theme.secondary} ${theme.accent} font-bold` : `${theme.text} hover:bg-gray-100 dark:hover:bg-white/10`}`}
                  >
                    <Icon
                      size={15}
                      className={isActive ? theme.accent : theme.textMuted}
                    />
                    <span>{option.label[localeKey]}</span>
                    {isActive && (
                      <span
                        className={`${isRTL ? "mr-auto" : "ml-auto"} text-[10px] ${theme.accent}`}
                      >
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="sm:hidden grid grid-cols-2 gap-2">
          <button
            onClick={() => setOpenToolsMenu(true)}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border hover:shadow-md ${theme.card} ${theme.border}`}
          >
            <div className="flex items-center gap-1.5">
              <LayoutGrid size={14} className={theme.accent} />
              <span className={theme.text}>
                {localeKey === "fa" ? "چیدمان ابزارها" : "Tools Layout"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] truncate max-w-[70px] ${theme.textMuted}`}
              >
                {currentToolsLabel}
              </span>
              <ChevronDown size={12} className={theme.textMuted} />
            </div>
          </button>
          <button
            onClick={() => setOpenPinnedMenu(true)}
            className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-medium border hover:shadow-md ${theme.card} ${theme.border}`}
          >
            <div className="flex items-center gap-1.5">
              <LayoutGrid size={14} className={theme.accent} />
              <span className={theme.text}>
                {localeKey === "fa" ? "چیدمان پین‌ها" : "Pinned Layout"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span
                className={`text-[10px] truncate max-w-[70px] ${theme.textMuted}`}
              >
                {currentPinnedLabel}
              </span>
              <ChevronDown size={12} className={theme.textMuted} />
            </div>
          </button>
        </div>
        {isMobile && (
          <BottomSheet
            isOpen={openToolsMenu}
            onClose={() => setOpenToolsMenu(false)}
            title={localeKey === "fa" ? "چیدمان ابزارها" : "Tools Layout"}
            options={mobileToolsOptions}
            selectedValue={toolsLayout}
            onSelect={onToolsLayoutChange}
            theme={theme}
            locale={localeKey}
            isRTL={isRTL}
          />
        )}
        {isMobile && (
          <BottomSheet
            isOpen={openPinnedMenu}
            onClose={() => setOpenPinnedMenu(false)}
            title={localeKey === "fa" ? "چیدمان پین‌ها" : "Pinned Layout"}
            options={pinnedLayoutOptions}
            selectedValue={pinnedLayout}
            onSelect={onPinnedLayoutChange}
            theme={theme}
            locale={localeKey}
            isRTL={isRTL}
          />
        )}
      </>
    );
  },
);
LayoutControls.displayName = "LayoutControls";
