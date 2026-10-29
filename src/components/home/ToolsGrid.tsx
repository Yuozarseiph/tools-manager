"use client";
import { usePanelPresence } from "@/hooks/usePanelPresence";

import { AccessibleInput, AccessibleTextarea } from "@/components/ui/AccessibleControls";
import { normaliseOutputName } from "@/lib/output-name";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "@/components/LocalizedLink";
import {
  ArrowLeft,
  Calculator,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  FileJson,
  FileText,
  Gamepad2,
  Grid,
  HelpCircle,
  Image as ImageIcon,
  Landmark,
  Music,
  Palette,
  Pin,
  PinOff,
  Presentation,
  Search,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  Table,
  Upload,
  Wrench,
  X,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { TOOLS } from "@/data/tools";
import { toolsContent } from "@/data/tools.content";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useViewportMenu } from "@/hooks/useViewportMenu";

import HelpModal from "./HelpModal";
import { LayoutControls } from "./LayoutControls";
import { PinnedSection } from "./PinnedSection";
import {
  DEFAULT_LAYOUT,
  LAYOUT_STORAGE_KEY,
  LayoutSettings,
  PinnedLayoutMode,
  ToolsLayoutMode,
  ToolWithText,
} from "./types";

const CATEGORIES = [
  { id: "all", icon: Grid },
  { id: "ai", icon: Sparkles },
  { id: "pdf", icon: FileText },
  { id: "image", icon: ImageIcon },
  { id: "developer", icon: Code2 },
  { id: "security", icon: ShieldCheck },
  { id: "utility", icon: Wrench },
  { id: "excel", icon: Table },
  { id: "audio", icon: Music },
  { id: "powerpoint", icon: Presentation },
  { id: "calculator", icon: Calculator },
  { id: "banking", icon: Landmark },
  { id: "graphics", icon: Palette },
  { id: "game", icon: Gamepad2 },
] as const;

type ExportData = {
  pinnedTools: string[];
  exportDate: string;
  version: string;
};

const availableToolIds = new Set(TOOLS.map(tool => tool.id));
const availablePins = (pins: unknown[]) => [...new Set(pins.filter((id): id is string => typeof id === "string" && availableToolIds.has(id)))];

const getGridClass = (layout: ToolsLayoutMode): string => {
  switch (layout) {
    case "list-compact":
      return "grid-cols-1 gap-2";
    case "list-detail":
      return "grid-cols-1 gap-3";
    case "grid-1":
      return "grid-cols-1 gap-3";
    case "grid-2":
      return "grid-cols-1 sm:grid-cols-2 gap-3";
    case "grid-3":
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3";
    case "grid-4":
      return "grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4";
    default:
      return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3";
  }
};

const ToolCard = memo(function ToolCard({
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
  onTogglePin: (id: string, event: React.MouseEvent) => void;
  theme: any;
  locale: string;
  content: any;
  layout: ToolsLayoutMode;
}) {
  const list =
    layout === "list-compact" ||
    layout === "list-detail" ||
    layout === "grid-1";
  const compact = layout === "list-compact";
  const isRTL = locale === "fa";

  return (
    <article
      className={`tool-card group relative h-full min-w-0 rounded-lg border transition-colors duration-200 ${theme.card} ${theme.border}`}
    >
      <Link
        href={tool.href}
        className={`flex h-full rounded-[20px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${
          list ? "items-start gap-3 p-4 pe-16" : "flex-col p-5"
        } ${
          tool.status === "coming-soon"
            ? "pointer-events-none opacity-50 grayscale"
            : ""
        }`}
      >
        <div
          className={`flex shrink-0 items-center justify-center rounded-[15px] ${theme.secondary} ${
            list ? "h-11 w-11" : "h-12 w-12"
          }`}
        >
          <tool.Icon
            className={`${list ? "h-5 w-5" : "h-[22px] w-[22px]"} ${theme.accent}`}
            aria-hidden="true"
          />
        </div>

        <div className={`min-w-0 flex-1 ${list ? "" : "mt-4"}`}>
          <div className="flex min-w-0 flex-col items-start gap-2">
            <h2
              className={`min-w-0 text-base font-bold leading-7 ${theme.text}`}
            >
              {tool.title}
            </h2>

            {content.categories[tool.category] && (
              <span
                className={`max-w-full rounded-md border px-2 py-1 text-xs font-semibold leading-5 ${theme.border} ${theme.secondary} ${theme.accent}`}
              >
                {content.categories[tool.category]}
              </span>
            )}
          </div>

          {!compact && (
            <p
              className={`mt-3 text-sm leading-7 ${theme.textMuted} ${
                list ? "" : "line-clamp-3"
              }`}
            >
              {tool.description}
            </p>
          )}
        </div>

        {!list && (
          <div
            className={`mt-5 flex items-center justify-between border-t pt-3 text-sm font-bold ${theme.border} ${theme.accent}`}
          >
            <span>{content.item.cta}</span>
            <ArrowLeft
              size={14}
              className={isRTL ? "" : "rotate-180"}
              aria-hidden="true"
            />
          </div>
        )}
      </Link>

      <button
        type="button"
        onClick={(event) => onTogglePin(tool.id, event)}
        aria-pressed={isPinned}
        aria-label={
          isPinned
            ? locale === "fa"
              ? `حذف ${tool.title} از پین‌ها`
              : `Unpin ${tool.title}`
            : locale === "fa"
              ? `پین کردن ${tool.title}`
              : `Pin ${tool.title}`
        }
        className={`tool-pin absolute top-3 z-10 flex h-11 w-11 items-center justify-center rounded-lg ${
          isRTL ? "left-3" : "right-3"
        } ${
          theme.textMuted
        }`}
      >
        {isPinned ? (
          <Pin size={16} className="fill-current" aria-hidden="true" />
        ) : (
          <PinOff size={16} aria-hidden="true" />
        )}
      </button>
    </article>
  );
});

ToolCard.displayName = "ToolCard";

export default function ToolsGrid() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = toolsContent[locale];
  const isRTL = locale === "fa";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(TOOLS.length);
  const [pinnedTools, setPinnedTools] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"file" | "text">("file");
  const [exportName, setExportName] = useState("");
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState("");
  const [layoutSettings, setLayoutSettings] =
    useState<LayoutSettings>(DEFAULT_LAYOUT);
  const [showExportHelp, setShowExportHelp] = useState(false);
  const [showImportHelp, setShowImportHelp] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const categoryPresence = usePanelPresence(showCategoryDropdown);
  const exportPresence = usePanelPresence(showExportModal);
  const importPresence = usePanelPresence(showImportModal);
  const categoryPanelRef = useViewportMenu(categoryPresence.present);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const uiText = useMemo(() => {
    const isFa = locale === "fa";
    return {
      pinnedTitle: isFa ? "ابزارهای پین‌شده" : "Pinned tools",
      noPinned: isFa ? "هنوز ابزاری پین نشده" : "No tools pinned yet",
      exportTitle: isFa ? "خروجی تنظیمات" : "Export settings",
      importTitle: isFa ? "وارد کردن تنظیمات" : "Import settings",
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
      category: isFa ? "دسته‌بندی" : "Category",
      searchLabel: isFa ? "جستجو در ابزارها" : "Search tools",
    };
  }, [locale]);

  useEffect(() => {
    try {
      const savedLayout = localStorage.getItem(LAYOUT_STORAGE_KEY);
      if (savedLayout) setLayoutSettings(JSON.parse(savedLayout));

      const savedPins = localStorage.getItem("tm_pinned_tools");
      if (savedPins) {
        const data = JSON.parse(savedPins);
        setPinnedTools(availablePins(Array.isArray(data.pinnedTools) ? data.pinnedTools : []));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  useEffect(() => {
    if (!showCategoryDropdown) return;

    const handler = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showCategoryDropdown]);

  const saveLayoutSettings = useCallback((settings: LayoutSettings) => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(settings));
  }, []);

  const handleToolsLayoutChange = useCallback(
    (layout: ToolsLayoutMode) => {
      setLayoutSettings((previous) => {
        const next = { ...previous, toolsLayout: layout };
        saveLayoutSettings(next);
        return next;
      });
    },
    [saveLayoutSettings],
  );

  const handlePinnedLayoutChange = useCallback(
    (layout: PinnedLayoutMode) => {
      setLayoutSettings((previous) => {
        const next = { ...previous, pinnedLayout: layout };
        saveLayoutSettings(next);
        return next;
      });
    },
    [saveLayoutSettings],
  );

  const savePinnedTools = useCallback((pins: string[]) => {
    localStorage.setItem(
      "tm_pinned_tools",
      JSON.stringify({
        pinnedTools: pins,
        exportDate: new Date().toISOString(),
        version: "1.0",
      }),
    );
  }, []);

  const togglePin = useCallback(
    (toolId: string, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setPinnedTools((previous) => {
        const next = previous.includes(toolId)
          ? previous.filter((id) => id !== toolId)
          : [...previous, toolId];

        savePinnedTools(next);
        return next;
      });
    },
    [savePinnedTools],
  );

  const removePin = useCallback(
    (toolId: string, event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      setPinnedTools((previous) => {
        const next = previous.filter((id) => id !== toolId);
        savePinnedTools(next);
        return next;
      });
    },
    [savePinnedTools],
  );

  const toolsWithText = useMemo<ToolWithText[]>(
    () =>
      TOOLS.map((tool) => {
        const item = content.items[tool.id as keyof typeof content.items];

        return item
          ? {
              ...tool,
              title: item.title,
              description: item.description,
              badge: item.badge,
            }
          : {
              ...tool,
              title: tool.id,
              description: "",
              badge: undefined,
            };
      }),
    [content],
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

    if (activeCategory !== "all") {
      result = result.filter((tool) => tool.category === activeCategory);
    }

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (tool) =>
          tool.title.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query),
      );
    }

    return result;
  }, [searchQuery, activeCategory, toolsWithText]);

  const visibleTools = filteredTools.slice(0, visibleCount);

  const getExportData = useCallback(
    (): ExportData => ({
      pinnedTools,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }),
    [pinnedTools],
  );

  const handleExportFile = useCallback(() => {
    const blob = new Blob([JSON.stringify(getExportData(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = normaliseOutputName(exportName, `pinned-tools-${new Date().toISOString().split("T")[0]}.json`);
    anchor.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  }, [getExportData, exportName]);

  const handleCopyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(getExportData(), null, 2),
    );
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [getExportData]);

  const handleImportFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const data = JSON.parse(loadEvent.target?.result as string);
          if (data.pinnedTools && Array.isArray(data.pinnedTools)) {
            const unique = availablePins(data.pinnedTools);
            setPinnedTools(unique);
            savePinnedTools(unique);
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
        const unique = availablePins(data.pinnedTools);
        setPinnedTools(unique);
        savePinnedTools(unique);
        setImportText("");
        setShowImportModal(false);
      }
    } catch {
      alert(uiText.invalidJson);
    }
  }, [importText, savePinnedTools, uiText.invalidJson]);

  const activeCategoryData =
    CATEGORIES.find((category) => category.id === activeCategory) ??
    CATEGORIES[0];
  const ActiveCategoryIcon = activeCategoryData.icon;
  const activeCategoryLabel =
    content.categories[
      activeCategory as keyof typeof content.categories
    ];

  return (
    <section id="tools-workspace" aria-label={locale === "fa" ? "فهرست ابزارها" : "Tools directory"} className="mx-auto w-full max-w-7xl scroll-mt-20 space-y-5 px-4 pb-12 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <PinnedSection
        pinnedTools={pinnedToolsList}
        onRemove={removePin}
        onExport={() => setShowExportModal(true)}
        onImport={() => setShowImportModal(true)}
        layout={layoutSettings.pinnedLayout}
        theme={theme}
        uiText={uiText}
        locale={locale}
        layoutControls={
          <LayoutControls
            mode="pinned"
            toolsLayout={layoutSettings.toolsLayout}
            pinnedLayout={layoutSettings.pinnedLayout}
            onToolsLayoutChange={handleToolsLayoutChange}
            onPinnedLayoutChange={handlePinnedLayoutChange}
            theme={theme}
            locale={locale}
          />
        }
      />

      <div
        className="tools-toolbar"
      >
        <div className="tools-search-field relative">
            <label htmlFor="tools-search" className="sr-only">
              {uiText.searchLabel}
            </label>

            <Search
              size={18}
              aria-hidden="true"
              className={`pointer-events-none absolute z-10 top-1/2 -translate-y-1/2 ${
                isRTL ? "right-4" : "left-4"
              } ${theme.textMuted}`}
            />

            <AccessibleInput
              id="tools-search"
              hasVisibleLabel
              style={{ paddingInline: "2.75rem" }}
              type="search"
              value={searchQuery}
              placeholder={content.search.placeholder}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setVisibleCount(TOOLS.length);
              }}
              className={`min-h-12 w-full rounded-[16px] border bg-transparent py-3 text-sm outline-none transition-colors focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-ring)] ${
                isRTL ? "pl-11 pr-11" : "pl-11 pr-11"
              } ${theme.border} ${theme.text}`}
              dir={isRTL ? "rtl" : "ltr"}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className={`absolute z-10 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${
                  isRTL ? "left-2.5" : "right-2.5"
                } ${theme.secondary} ${theme.textMuted}`}
                aria-label={isRTL ? "پاک کردن جستجو" : "Clear search"}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
        </div>
      <div className="tools-filters">
        <LayoutControls
          mode="tools"
          toolsLayout={layoutSettings.toolsLayout}
          pinnedLayout={layoutSettings.pinnedLayout}
          onToolsLayoutChange={handleToolsLayoutChange}
          onPinnedLayoutChange={handlePinnedLayoutChange}
          theme={theme}
          locale={locale}
        />

        <div ref={categoryDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setShowCategoryDropdown((value) => !value)}
              aria-expanded={showCategoryDropdown}
              aria-haspopup="menu"
              onKeyDown={(event) => {
                if (event.key === "Escape") setShowCategoryDropdown(false);
              }}
              className={`ui-control flex min-h-12 items-center gap-2 rounded-lg border px-3.5 text-sm font-semibold ${theme.card} ${theme.text}`}
            >
              <SlidersHorizontal size={15} className={theme.accent} aria-hidden="true" />
              <span className={`hidden sm:inline ${theme.textMuted}`}>{uiText.category}</span>
              <ActiveCategoryIcon size={15} className={theme.accent} aria-hidden="true" />
              <span>{activeCategoryLabel}</span>
              <ChevronDown
                size={14}
                aria-hidden="true"
                className={`${theme.textMuted} ${
                  showCategoryDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {categoryPresence.present && (
              <div
                role="menu"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setShowCategoryDropdown(false);
                    categoryDropdownRef.current?.querySelector("button")?.focus();
                  }
                }}
                {...categoryPresence.attributes}
                ref={categoryPanelRef}
                className={`absolute top-full z-50 mt-2 max-h-[70dvh] overflow-y-auto category-menu w-[min(22rem,calc(100vw-2rem))] rounded-[22px] border p-2 shadow-xl bg-[var(--app-menu)] ${
                  isRTL ? "left-0" : "right-0"
                } ${theme.border}`}
              >
                <div className="grid grid-cols-2 gap-1">
                  {CATEGORIES.map((category) => {
                    const Icon = category.icon;
                    const active = activeCategory === category.id;
                    const label =
                      content.categories[
                        category.id as keyof typeof content.categories
                      ];
                    const count =
                      category.id === "all"
                        ? TOOLS.length
                        : TOOLS.filter(
                            (tool) => tool.category === category.id,
                          ).length;

                    return (
                      <button
                        key={category.id}
                        type="button"
                        role="menuitemradio"
                        aria-checked={active}
                        onClick={() => {
                          setActiveCategory(category.id);
                          setVisibleCount(TOOLS.length);
                          setShowCategoryDropdown(false);
                        }}
                        className={`flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--app-ring)] ${
                          active
                            ? `${theme.secondary} ${theme.accent}`
                            : `${theme.text} hover:bg-black/5 dark:hover:bg-white/5`
                        }`}
                      >
                        <Icon className="shrink-0" size={17} aria-hidden="true" />
                        <span className="flex min-w-0 flex-1 items-center gap-2">
                          <span className="block whitespace-normal text-xs font-semibold leading-5">
                            {label}
                          </span>
                          <span className="ms-auto shrink-0 text-xs text-[var(--app-text-muted)]">
                            {count}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
        </div>

      </div>
      </div>

      <p className="tools-result-count" role="status" aria-live="polite" aria-atomic="true">
        {filteredTools.length.toLocaleString(locale === "fa" ? "fa-IR" : "en-US")} {locale === "fa" ? "ابزار در دسترس" : "tools available"}
      </p>

      <div className={`grid ${getGridClass(layoutSettings.toolsLayout)}`}>
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
          <div
            className={`col-span-full flex min-h-56 flex-col items-center justify-center rounded-[22px] border border-dashed px-5 text-center ${theme.border}`}
          >
            <Search size={24} className={theme.textMuted} aria-hidden="true" />
            <p className={`mt-3 text-sm font-black ${theme.text}`}>
              {content.empty.title}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className={`mt-3 rounded-full px-4 py-2 text-sm font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.secondary} ${theme.accent}`}
            >
              {content.empty.showAll}
            </button>
          </div>
        )}
      </div>

      {visibleCount < filteredTools.length && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + 9)}
            className={`min-h-12 rounded-full px-6 text-sm font-black text-white shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.primary}`}
          >
            {content.loadMore}
          </button>
        </div>
      )}

      {exportPresence.present && (
        <SettingsModal
          presence={exportPresence.attributes}
          title={uiText.exportTitle}
          onClose={() => setShowExportModal(false)}
          theme={theme}
          locale={locale}
          onHelp={() => setShowExportHelp(true)}
        >
          <div className="space-y-4">
            <div className={`grid grid-cols-2 gap-1 rounded-[15px] p-1 ${theme.secondary}`}>
              <button
                type="button"
                onClick={() => setExportFormat("file")}
                aria-pressed={exportFormat === "file"}
                className={`rounded-[12px] px-3 py-2.5 text-sm font-black ${
                  exportFormat === "file"
                    ? `${theme.card} ${theme.text} shadow-sm`
                    : theme.textMuted
                }`}
              >
                <FileJson size={16} className="me-1.5 inline" aria-hidden="true" />
                {uiText.file}
              </button>
              <button
                type="button"
                onClick={() => setExportFormat("text")}
                aria-pressed={exportFormat === "text"}
                className={`rounded-[12px] px-3 py-2.5 text-sm font-black ${
                  exportFormat === "text"
                    ? `${theme.card} ${theme.text} shadow-sm`
                    : theme.textMuted
                }`}
              >
                <Copy size={16} className="me-1.5 inline" aria-hidden="true" />
                {uiText.text}
              </button>
            </div>

            {exportFormat === "file" ? (
              <>
              <label className={`block space-y-2 text-sm ${theme.text}`}>
                <span>{locale === "fa" ? "نام فایل خروجی (اختیاری)" : "Output filename (optional)"}</span>
                <AccessibleInput value={exportName} onChange={event => setExportName(event.target.value)} maxLength={160} placeholder={locale === "fa" ? "نام خودکار؛ پسوند JSON خودکار اضافه می‌شود" : "Automatic name; JSON extension is added automatically"} className={`w-full rounded-xl border px-3 py-2 ${theme.border} ${theme.bg} ${theme.text}`} dir="auto" />
              </label>
              <button data-testid="download-result"
                type="button"
                onClick={handleExportFile}
                className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] font-black text-white ${theme.primary}`}
              >
                <Download size={17} aria-hidden="true" />
                {uiText.downloadJson}
              </button>
              </>
            ) : (
              <>
                <AccessibleTextarea
                  readOnly
                  aria-label={uiText.text}
                  value={JSON.stringify(getExportData(), null, 2)}
                  className={`h-44 w-full resize-none rounded-[16px] border p-4 font-mono text-xs ${theme.border} ${theme.bg} ${theme.text}`}
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className={`flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border text-sm font-black ${theme.card} ${theme.border} ${theme.text}`}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? uiText.copied : uiText.copyClipboard}
                </button>
              </>
            )}
          </div>
        </SettingsModal>
      )}

      {importPresence.present && (
        <SettingsModal
          presence={importPresence.attributes}
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
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-[15px] border text-sm font-black ${theme.card} ${theme.border} ${theme.text}`}
            >
              <Upload size={17} aria-hidden="true" />
              {uiText.uploadFile}
            </button>

            <AccessibleInput
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <div className={`text-center text-xs ${theme.textMuted}`}>
              {uiText.or}
            </div>

            <AccessibleTextarea
              aria-label={uiText.pasteJson}
              placeholder={uiText.pasteJson}
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              className={`h-36 w-full resize-none rounded-[16px] border p-4 font-mono text-xs ${theme.border} ${theme.bg} ${theme.text}`}
              dir="ltr"
            />

            <button
              type="button"
              onClick={handleImportText}
              disabled={!importText}
              className={`min-h-12 w-full rounded-[15px] text-sm font-black text-white disabled:opacity-40 ${theme.primary}`}
            >
              {uiText.import}
            </button>
          </div>
        </SettingsModal>
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
    </section>
  );
}

function SettingsModal({
  presence,
  title,
  onClose,
  children,
  theme,
  locale,
  onHelp,
}: {
  presence: ReturnType<typeof usePanelPresence>["attributes"];
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  theme: any;
  locale: string;
  onHelp: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      {...presence}
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md overflow-hidden rounded-[26px] border shadow-2xl ${theme.card} ${theme.border}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`flex items-center justify-between border-b p-5 ${theme.border}`}
        >
          <div className="flex items-center gap-2">
            <h3
              id="settings-modal-title"
              className={`text-lg font-black ${theme.text}`}
            >
              {title}
            </h3>
            <button
              type="button"
              onClick={onHelp}
              className={`flex h-8 w-8 items-center justify-center rounded-full ${theme.secondary} ${theme.textMuted}`}
              aria-label={locale === "fa" ? "راهنما" : "Help"}
            >
              <HelpCircle size={15} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-10 w-10 items-center justify-center rounded-full ${theme.secondary} ${theme.text}`}
            aria-label={locale === "fa" ? "بستن" : "Close"}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
