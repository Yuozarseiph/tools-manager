"use client";

import { useState, useMemo, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Search,
  X,
  Grid,
  FileText,
  Image as ImageIcon,
  Code2,
  ShieldCheck,
  MonitorSmartphone,
  Wrench,
  Presentation,
  Music,
  Table,
  Calculator,
  Palette,
  Landmark,
  Pin,
  PinOff,
  Copy,
  Check,
  FileJson,
  Upload,
  Download,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { TOOLS } from "@/data/tools";
import { useLanguage } from "@/context/LanguageContext";
import { toolsContent } from "@/data/tools.content";
import { LayoutControls } from "./LayoutControls";
import { PinnedSection } from "./PinnedSection";
import {
  ToolsLayoutMode,
  PinnedLayoutMode,
  LayoutSettings,
  DEFAULT_LAYOUT,
  LAYOUT_STORAGE_KEY,
  ToolWithText,
} from "./types";
import HelpModal from "./HelpModal";
import CustomDropdown from "../ui/CustomDropdown";
import { createPortal } from "react-dom";

const CATEGORIES = [
  { id: "all", icon: Grid },
  { id: "pdf", icon: FileText },
  { id: "image", icon: ImageIcon },
  { id: "developer", icon: Code2 },
  { id: "security", icon: ShieldCheck },
  { id: "system", icon: MonitorSmartphone },
  { id: "utility", icon: Wrench },
  { id: "excel", icon: Table },
  { id: "audio", icon: Music },
  { id: "powerpoint", icon: Presentation },
  { id: "calculator", icon: Calculator },
  { id: "graphics", icon: Palette },
  { id: "banking", icon: Landmark },
] as const;

type ExportData = {
  pinnedTools: string[];
  exportDate: string;
  version: string;
};

const getGridClass = (layout: ToolsLayoutMode): string => {
  switch (layout) {
    case "list-compact":
      return "grid-cols-1 gap-1.5";
    case "list-detail":
      return "grid-cols-1 gap-3";
    case "grid-1":
      return "grid-cols-1 gap-3";
    case "grid-2":
      return "grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3";
    case "grid-3":
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3";
    case "grid-4":
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3";
  }
};

const ToolCard = memo(
  ({
    tool,
    isPinned,
    onTogglePin,
    theme,
    locale,
    content,
    layout,
  }: {
    tool: ToolWithText;
    isPinned: boolean;
    onTogglePin: (id: string, e: React.MouseEvent) => void;
    theme: any;
    locale: string;
    content: any;
    layout: ToolsLayoutMode;
  }) => {
    const isList =
      layout === "list-compact" ||
      layout === "list-detail" ||
      layout === "grid-1";
    const isCompact = layout === "list-compact";
    const isRTL = locale === "fa";

    return (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="h-full"
      >
        <Link
          href={tool.href}
          className={`relative group h-full flex rounded-xl sm:rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 ${theme.card} ${theme.border} ${isList ? "p-2.5 sm:p-3" : "p-3 sm:p-3.5"} ${tool.status === "coming-soon" ? "opacity-60 grayscale pointer-events-none" : ""} ${isList ? "flex-row items-start gap-3" : "flex-col"}`}
        >
          <button
            onClick={(e) => onTogglePin(tool.id, e)}
            className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} z-10 p-1 rounded-md transition-all duration-150 ${isList ? "relative top-0 left-0 right-0" : ""} text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/50`}
          >
            {isPinned ? (
              <Pin size={12} className="fill-current" />
            ) : (
              <PinOff size={12} />
            )}
          </button>
          <div
            className={`flex-1 flex ${isList ? "flex-row items-start gap-3" : "flex-col"}`}
          >
            <div
              className={`shrink-0 ${isList ? "w-8 h-8" : "w-9 h-9 sm:w-10 sm:h-10"} rounded-lg flex items-center justify-center ${theme.secondary} ${isList ? "" : "mb-2"}`}
            >
              <tool.Icon
                className={`${isList ? "w-4 h-4" : "w-4 h-4 sm:w-5 sm:h-5"} ${theme.accent}`}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <div
                className={`flex items-center gap-1.5 ${isList ? "" : "justify-center md:justify-start"}`}
              >
                <h2
                  className={`text-xs sm:text-sm font-bold truncate ${theme.text}`}
                >
                  {tool.title}
                </h2>
                {tool.badge && (
                  <span
                    className={`text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${theme.border} ${theme.secondary}`}
                  >
                    {tool.badge}
                  </span>
                )}
              </div>
              {((isList && !isCompact) || !isList) && (
                <p
                  className={`${isList ? "mt-0.5" : "mt-1.5 flex-1"} text-[10px] sm:text-xs leading-relaxed ${theme.textMuted} ${isList ? "" : "line-clamp-2 text-center md:text-start"}`}
                >
                  {tool.description}
                </p>
              )}
              {/* اسپیسر برای یکسان‌سازی ارتفاع در حالت گرید */}
              {!isList && <div className="flex-1 min-h-0" />}
            </div>
          </div>
          {!isList && (
            <div
              className={`mt-2 sm:mt-3 pt-2 border-t flex items-center justify-center text-[10px] font-semibold opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 ${theme.border} ${theme.accent}`}
            >
              <span className="flex items-center gap-1">
                {content.item.cta}
                <ArrowLeft
                  size={10}
                  className={`mt-0.5 ${isRTL ? "rotate-180" : ""}`}
                />
              </span>
            </div>
          )}
        </Link>
      </motion.div>
    );
  },
);
ToolCard.displayName = "ToolCard";

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
  searchable = false,
  searchPlaceholder = "جستجو...",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: { value: string; label: string; icon?: any }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  theme: any;
  locale: string;
  isRTL: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}) => {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchQuery]);
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
        {searchable && (
          <div className={`p-3 border-b ${theme.border}`}>
            <div className="relative">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-10 pr-8 py-2.5 text-sm rounded-lg border ${theme.border} ${theme.bg} ${theme.text} outline-none focus:ring-1 ${theme.ring}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full ${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/10`}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(70vh-64px)] p-2">
          <div className="space-y-1">
            {filteredOptions.map((option) => {
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
                  {Icon && (
                    <Icon
                      size={18}
                      className={isActive ? theme.accent : theme.textMuted}
                    />
                  )}
                  <span>{option.label}</span>
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

export default function ToolsGrid() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = toolsContent[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(9);
  const [pinnedTools, setPinnedTools] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"file" | "text">("file");
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [layoutSettings, setLayoutSettings] =
    useState<LayoutSettings>(DEFAULT_LAYOUT);
  const [isMobile, setIsMobile] = useState(false);
  const [showExportHelp, setShowExportHelp] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCategorySheet, setShowCategorySheet] = useState(false);

  const uiText = useMemo(() => {
    const isFa = locale === "fa";
    return {
      pinnedTitle: isFa ? "ابزارهای پین شده" : "Pinned Tools",
      noPinned: isFa ? "هنوز ابزاری پین نشده" : "No tools pinned yet",
      exportTitle: isFa ? "خروجی تنظیمات" : "Export Settings",
      importTitle: isFa ? "وارد کردن تنظیمات" : "Import Settings",
      file: isFa ? "فایل" : "File",
      text: isFa ? "متن" : "Text",
      downloadJson: isFa ? "دانلود فایل JSON" : "Download JSON file",
      copyClipboard: isFa ? "کپی در کلیپ‌بورد" : "Copy to clipboard",
      copied: isFa ? "کپی شد" : "Copied",
      uploadFile: isFa ? "آپلود فایل" : "Upload file",
      or: isFa ? "یا" : "or",
      pasteJson: isFa ? "JSON را اینجا پیست کنید..." : "Paste JSON here...",
      import: isFa ? "وارد کردن" : "Import",
      invalidJson: isFa ? "فرمت JSON نامعتبر است" : "Invalid JSON format",
    };
  }, [locale]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) setLayoutSettings(JSON.parse(savedLayout));
      const savedPins = localStorage.getItem("tm_pinned_tools");
      if (savedPins) {
        const data = JSON.parse(savedPins);
        setPinnedTools(data.pinnedTools || []);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  const saveLayoutSettings = useCallback((settings: LayoutSettings) => {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save layout settings:", error);
    }
  }, []);

  const handleToolsLayoutChange = useCallback(
    (layout: ToolsLayoutMode) => {
      setLayoutSettings((prev) => {
        const ns = { ...prev, toolsLayout: layout };
        saveLayoutSettings(ns);
        return ns;
      });
    },
    [saveLayoutSettings],
  );

  const handlePinnedLayoutChange = useCallback(
    (layout: PinnedLayoutMode) => {
      setLayoutSettings((prev) => {
        const ns = { ...prev, pinnedLayout: layout };
        saveLayoutSettings(ns);
        return ns;
      });
    },
    [saveLayoutSettings],
  );

  const savePinnedTools = useCallback((pins: string[]) => {
    try {
      localStorage.setItem(
        "tm_pinned_tools",
        JSON.stringify({
          pinnedTools: pins,
          exportDate: new Date().toISOString(),
          version: "1.0",
        }),
      );
    } catch (error) {
      console.error("Failed to save pinned tools:", error);
    }
  }, []);

  const togglePin = useCallback(
    (toolId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPinnedTools((prev) => {
        const np = prev.includes(toolId)
          ? prev.filter((id) => id !== toolId)
          : [...prev, toolId];
        savePinnedTools(np);
        return np;
      });
    },
    [savePinnedTools],
  );

  const removePin = useCallback(
    (toolId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setPinnedTools((prev) => {
        const np = prev.filter((id) => id !== toolId);
        savePinnedTools(np);
        return np;
      });
    },
    [savePinnedTools],
  );

  const toolsWithText = useMemo<ToolWithText[]>(
    () =>
      TOOLS.map((tool) => {
        const td = content.items[tool.id as keyof typeof content.items];
        if (!td)
          return { ...tool, title: tool.id, description: "", badge: undefined };
        return {
          ...tool,
          title: td.title,
          description: td.description,
          badge: td.badge,
        };
      }),
    [locale, content],
  );

  const pinnedToolsList = useMemo(() => {
    const seen = new Set<string>();
    return toolsWithText.filter((tool) => {
      if (pinnedTools.includes(tool.id) && !seen.has(tool.id)) {
        seen.add(tool.id);
        return true;
      }
      return false;
    });
  }, [toolsWithText, pinnedTools]);

  const filteredTools = useMemo(() => {
    let result = toolsWithText;
    if (activeCategory !== "all")
      result = result.filter((t) => t.category === activeCategory);
    const q = searchQuery.toLowerCase().trim();
    if (q)
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      );
    return result;
  }, [searchQuery, activeCategory, toolsWithText]);

  const visibleTools = useMemo(
    () => filteredTools.slice(0, visibleCount),
    [filteredTools, visibleCount],
  );

  const getExportData = useCallback(
    (): ExportData => ({
      pinnedTools,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }),
    [pinnedTools],
  );

  const handleExportFile = useCallback(() => {
    const data = getExportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pinned-tools-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }, [getExportData]);

  const handleCopyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(getExportData(), null, 2),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getExportData]);

  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.pinnedTools && Array.isArray(data.pinnedTools)) {
            const up = [...new Set(data.pinnedTools as string[])];
            setPinnedTools(up);
            savePinnedTools(up);
            setShowImportModal(false);
          }
        } catch {
          alert(uiText.invalidJson);
        }
      };
      reader.readAsText(file);
    },
    [savePinnedTools, uiText.invalidJson],
  );

  const handleImportText = useCallback(() => {
    try {
      const data = JSON.parse(importText);
      if (data.pinnedTools && Array.isArray(data.pinnedTools)) {
        const up = [...new Set(data.pinnedTools as string[])];
        setPinnedTools(up);
        savePinnedTools(up);
        setImportText("");
        setShowImportModal(false);
      }
    } catch {
      alert(uiText.invalidJson);
    }
  }, [importText, savePinnedTools, uiText.invalidJson]);

  const gridClass = getGridClass(layoutSettings.toolsLayout);
  const isRTL = locale === "fa";

  return (
    <div className="pb-20 sm:pb-28 pt-1 sm:pt-2 space-y-4 sm:space-y-5">
      <PinnedSection
        pinnedTools={pinnedToolsList}
        onRemove={removePin}
        onExport={() => setShowExportModal(true)}
        onImport={() => setShowImportModal(true)}
        layout={layoutSettings.pinnedLayout}
        theme={theme}
        uiText={uiText}
        locale={locale}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-0">
        <div
          className={`hidden sm:flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div className="flex-1 relative">
            <div
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 ${theme.textMuted}`}
            >
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder={content.search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2.5 ${isRTL ? "pr-9 pl-9" : "pl-9 pr-9"} rounded-xl border text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none ${theme.bg} ${theme.text} ${theme.border}`}
              dir={isRTL ? "rtl" : "ltr"}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 p-1`}
              >
                <X size={14} className={theme.textMuted} />
              </button>
            )}
          </div>
          <LayoutControls
            toolsLayout={layoutSettings.toolsLayout}
            pinnedLayout={layoutSettings.pinnedLayout}
            onToolsLayoutChange={handleToolsLayoutChange}
            onPinnedLayoutChange={handlePinnedLayoutChange}
            theme={theme}
            locale={locale}
          />
        </div>
        <div className="sm:hidden space-y-2">
          <div className="relative">
            <div
              className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 ${theme.textMuted}`}
            >
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder={content.search.placeholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full py-2.5 ${isRTL ? "pr-9 pl-9" : "pl-9 pr-9"} rounded-xl border text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none ${theme.bg} ${theme.text} ${theme.border}`}
              dir={isRTL ? "rtl" : "ltr"}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={`absolute ${isRTL ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 p-1`}
              >
                <X size={14} className={theme.textMuted} />
              </button>
            )}
          </div>
          <LayoutControls
            toolsLayout={layoutSettings.toolsLayout}
            pinnedLayout={layoutSettings.pinnedLayout}
            onToolsLayoutChange={handleToolsLayoutChange}
            onPinnedLayoutChange={handlePinnedLayoutChange}
            theme={theme}
            locale={locale}
          />
        </div>
      </div>
      <div className="px-3 sm:px-4 md:px-0 max-w-7xl mx-auto">
        {isMobile ? (
          <>
            <button
              onClick={() => setShowCategorySheet(true)}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${theme.card} ${theme.border} ${theme.text} hover:shadow-md`}
            >
              <span className="flex items-center gap-2">
                <Grid size={16} className={theme.accent} />
                <span>
                  {activeCategory === "all"
                    ? content.categories.all
                    : CATEGORIES.find((c) => c.id === activeCategory)?.id
                      ? content.categories[
                          activeCategory as keyof typeof content.categories
                        ]
                      : content.categories.all}
                </span>
              </span>
              <ChevronDown size={16} className={theme.textMuted} />
            </button>
            <BottomSheet
              isOpen={showCategorySheet}
              onClose={() => setShowCategorySheet(false)}
              title={locale === "fa" ? "انتخاب دسته‌بندی" : "Select Category"}
              options={CATEGORIES.map((cat) => ({
                value: cat.id,
                label:
                  content.categories[cat.id as keyof typeof content.categories],
                icon: cat.icon,
              }))}
              selectedValue={activeCategory}
              onSelect={(val) => {
                setActiveCategory(val);
                setShowCategorySheet(false);
              }}
              theme={theme}
              locale={locale}
              isRTL={isRTL}
              searchable
              searchPlaceholder={
                locale === "fa" ? "جستجوی دسته‌بندی..." : "Search category..."
              }
            />
          </>
        ) : (
          <div className="relative w-64">
            <CustomDropdown
              options={CATEGORIES.map((cat) => ({
                value: cat.id,
                label:
                  content.categories[cat.id as keyof typeof content.categories],
              }))}
              value={activeCategory}
              onChange={setActiveCategory}
              placeholder={content.categories.all}
              searchable
              searchPlaceholder={locale === "fa" ? "جستجو..." : "Search..."}
            />
          </div>
        )}
      </div>
      <div className={`grid ${gridClass} px-3 sm:px-4 md:px-0`}>
        <AnimatePresence mode="popLayout">
          {visibleTools.length > 0 ? (
            visibleTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isPinned={pinnedTools.includes(tool.id)}
                onTogglePin={togglePin}
                theme={theme}
                locale={locale}
                content={content}
                layout={layoutSettings.toolsLayout}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16 opacity-50"
            >
              <Search size={32} className={`mx-auto mb-3 ${theme.textMuted}`} />
              <p className={`text-base font-medium ${theme.text}`}>
                {content.empty.title}
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSearchQuery("");
                }}
                className="text-blue-500 hover:underline text-sm mt-2"
              >
                {content.empty.showAll}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {visibleCount < filteredTools.length && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + 9)}
            className={`px-5 py-2.5 text-sm rounded-xl font-medium shadow-sm hover:shadow-md transition-all ${theme.primary}`}
          >
            {content.loadMore}
          </button>
        </div>
      )}
      {showExportModal && (
        <Modal
          title={uiText.exportTitle}
          onClose={() => setShowExportModal(false)}
          theme={theme}
          locale={locale}
          onHelp={() => setShowExportHelp(true)}
        >
          <div className="space-y-4">
            <div className={`flex gap-2 p-1 rounded-xl ${theme.secondary}`}>
              <button
                onClick={() => setExportFormat("file")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${exportFormat === "file" ? "bg-blue-600 text-white" : `${theme.card} ${theme.text}`}`}
              >
                <FileJson size={16} className="inline mr-1" /> {uiText.file}
              </button>
              <button
                onClick={() => setExportFormat("text")}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${exportFormat === "text" ? "bg-blue-600 text-white" : `${theme.card} ${theme.text}`}`}
              >
                <Copy size={16} className="inline mr-1" /> {uiText.text}
              </button>
            </div>
            {exportFormat === "file" ? (
              <button
                onClick={handleExportFile}
                className={`w-full py-3 rounded-xl font-medium ${theme.primary}`}
              >
                <Download size={16} className="inline mr-2" />{" "}
                {uiText.downloadJson}
              </button>
            ) : (
              <div>
                <textarea
                  readOnly
                  value={JSON.stringify(getExportData(), null, 2)}
                  className={`w-full h-40 p-3 rounded-xl border text-sm font-mono ${theme.border} ${theme.bg} ${theme.text}`}
                  dir="ltr"
                />
                <button
                  onClick={handleCopyToClipboard}
                  className={`mt-2 w-full py-2.5 rounded-lg border font-medium ${theme.border} ${theme.card} hover:bg-gray-50 dark:hover:bg-white/10`}
                >
                  {copied ? (
                    <>
                      <Check size={14} className="inline mr-1" />{" "}
                      {uiText.copied}
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="inline mr-1" />{" "}
                      {uiText.copyClipboard}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
      {showImportModal && (
        <Modal
          title={uiText.importTitle}
          onClose={() => {
            setShowImportModal(false);
            setImportText("");
          }}
          theme={theme}
          locale={locale}
          onHelp={() => setShowImportHelp(true)}
        >
          <div className="space-y-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-3 rounded-xl border font-medium ${theme.border} ${theme.card} hover:bg-gray-50 dark:hover:bg-white/10`}
            >
              <Upload size={16} className="inline mr-2" /> {uiText.uploadFile}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            <div className={`text-center text-sm ${theme.textMuted}`}>
              {uiText.or}
            </div>
            <textarea
              placeholder={uiText.pasteJson}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className={`w-full h-32 p-3 rounded-xl border text-sm font-mono ${theme.border} ${theme.bg} ${theme.text}`}
              dir="ltr"
            />
            <button
              onClick={handleImportText}
              disabled={!importText}
              className={`w-full py-2.5 rounded-lg font-medium disabled:opacity-50 ${theme.primary}`}
            >
              {uiText.import}
            </button>
          </div>
        </Modal>
      )}
      <HelpModal
        isOpen={showExportHelp}
        onClose={() => setShowExportHelp(false)}
        theme={theme}
        locale={locale}
        type="export"
      />
      <HelpModal
        isOpen={showImportHelp}
        onClose={() => setShowImportHelp(false)}
        theme={theme}
        locale={locale}
        type="import"
      />
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  theme,
  locale,
  onHelp,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  theme: any;
  locale: string;
  onHelp: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`max-w-md w-full rounded-2xl p-6 shadow-2xl border ${theme.card} ${theme.border}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${theme.text}`}>{title}</h3>
            <button
              onClick={onHelp}
              className={`p-1 rounded-lg transition-colors ${theme.textMuted} hover:bg-gray-100 dark:hover:bg-white/10`}
            >
              <HelpCircle size={16} />
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X size={18} className={theme.text} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
