"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { TOOLS, type Tool } from "@/data/tools";
import { useLanguage } from "@/context/LanguageContext";

const CATEGORIES = [
  { id: "all", icon: Grid },
  { id: "pdf", icon: FileText },
  { id: "image", icon: ImageIcon },
  { id: "developer", icon: Code2 },
  { id: "security", icon: ShieldCheck },
  { id: "system", icon: MonitorSmartphone },
  { id: "utility", icon: Wrench },
  { id: "excel", icon: FileText },
  { id: "audio", icon: FileText },
  { id: "powerpoint", icon: Presentation },
] as const;

type ToolWithText = Tool & {
  title: string;
  description: string;
  badge?: string;
};

export default function ToolsGrid() {
  const theme = useThemeColors();
  const { t, locale } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(6);

  // تزریق ترجمه به TOOLS
  const toolsWithText = useMemo<ToolWithText[]>(() => {
    return TOOLS.map((tool) => {
      const baseKey = `tools.items.${tool.id}`;
      const title = t(`${baseKey}.title`);
      const description = t(`${baseKey}.description`);
      const badge = t(`${baseKey}.badge`);
      const safeBadge =
        badge === `${baseKey}.badge` ? undefined : (badge as string);

      return {
        ...tool,
        title,
        description,
        badge: safeBadge,
      };
    });
  }, [t, locale]);

  // فیلتر بر اساس دسته و جستجو
  const filteredTools = useMemo(() => {
    let tool = toolsWithText;

    // ۱. فیلتر دسته‌بندی
    if (activeCategory !== "all") {
      tool = tool.filter((t) => t.category === activeCategory);
    }

    // ۲. فیلتر جستجو (روی متن ترجمه‌شده)
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      tool = tool.filter(
        (tool) =>
          tool.title.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      );
    }

    return tool;
  }, [searchQuery, activeCategory, toolsWithText]);

  const visibleTools = useMemo(
    () => filteredTools.slice(0, visibleCount),
    [filteredTools, visibleCount]
  );

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    setVisibleCount(6);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setVisibleCount(6);
  };

  return (
    <div className="pb-28 pt-2 space-y-8 md:space-y-10">
      {/* سرچ – تمام عرض، مرکز */}
      <div className="max-w-lg mx-auto relative z-20 px-4 sm:px-0">
        <div
          className={`absolute right-7 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
        >
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder={t("tool.search.placeholder")}
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={`
            w-full py-3.5 pr-11 pl-11 rounded-2xl border-2
            transition-all outline-none shadow-sm text-base md:text-lg
            ${theme.bg} ${theme.text} ${theme.border}
            focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
          `}
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange("")}
            className="
              absolute left-7 top-1/2 -translate-y-1/2
              p-1.5 rounded-full
              hover:bg-zinc-200 dark:hover:bg-zinc-700
              text-zinc-500 transition-colors
            "
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* دسته‌بندی‌ها – موبایل: اسکرول افقی، دسکتاپ: wrap */}
      {/* موبایل */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto">
        <div className="flex gap-2 pb-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`
                  flex items-center gap-1.5
                  px-3.5 py-2
                  rounded-full text-xs font-semibold
                  flex-shrink-0
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                      : `${theme.bg} ${theme.text} border ${theme.border} hover:bg-zinc-100 dark:hover:bg-zinc-800`
                  }
                `}
              >
                <Icon size={16} />
                <span className="whitespace-nowrap">
                  {t(`tool.categories.${cat.id}`)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* دسکتاپ / تبلت */}
      <div className="hidden md:flex flex-wrap justify-center gap-2 max-w-4xl mx-auto px-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl
                text-sm font-bold transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                    : `${theme.bg} ${theme.text} border ${theme.border} hover:bg-zinc-100 dark:hover:bg-zinc-800`
                }
              `}
            >
              <Icon size={16} />
              {t(`tool.categories.${cat.id}`)}
            </button>
          );
        })}
      </div>

      {/* گرید ابزارها */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 px-4 md:px-0">
        <AnimatePresence mode="popLayout">
          {visibleTools.length > 0 ? (
            visibleTools.map((tool) => (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
              >
                <Link
                  href={tool.href}
                  className={`
                    relative group block p-4 md:p-6 rounded-3xl border
                    transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                    h-full flex flex-col
                    ${theme.card} ${theme.border}
                    ${
                      tool.status === "coming-soon"
                        ? "opacity-60 grayscale pointer-events-none"
                        : ""
                    }
                  `}
                >
                  <div
                    className={`
                      w-12 h-12 md:w-14 md:h-14 rounded-2xl
                      flex items-center justify-center mb-4 md:mb-6
                      shadow-lg transition-colors duration-300
                      ${theme.secondary}
                    `}
                  >
                    <tool.Icon
                      className={`w-6 h-6 md:w-7 md:h-7 ${theme.accent}`}
                    />
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h2
                        className={`text-lg md:text-xl font-bold ${theme.text}`}
                      >
                        {tool.title}
                      </h2>
                      {tool.badge && (
                        <span
                          className={`
                            text-[10px] font-bold px-2 py-1 rounded-full
                            border ${theme.border} ${theme.bg} ${theme.textMuted}
                          `}
                        >
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs md:text-sm leading-relaxed ${theme.textMuted}`}
                    >
                      {tool.description}
                    </p>
                  </div>

                  {/* CTA: روی موبایل همیشه دیده میشه، روی دسکتاپ فقط روی hover */}
                  <div
                    className={`
                      mt-4 md:mt-6 pt-4 md:pt-6 border-t flex items-center
                      text-xs md:text-sm font-semibold
                      ${theme.border} ${theme.accent}
                      opacity-100 translate-x-0
                      md:opacity-0 md:-translate-x-2
                      md:group-hover:opacity-100 md:group-hover:translate-x-0
                      transition-all duration-300
                    `}
                  >
                    {t("tool.item.cta")}
                    <ArrowLeft size={16} className="mr-2" />
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="
                col-span-full text-center py-20 opacity-50
                flex flex-col items-center gap-4
              "
            >
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Search size={32} className={theme.textMuted} />
              </div>
              <p className={`text-lg font-medium ${theme.text}`}>
                {t("tools.empty.title")}
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  handleSearchChange("");
                }}
                className="text-blue-500 hover:underline text-sm"
              >
                {t("tools.empty.showAll")}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {visibleCount < filteredTools.length && (
        <div className="flex justify-center mt-2 md:mt-4">
          <button
            onClick={() => setVisibleCount((c) => c + 9)}
            className={`
              px-4 py-2 text-sm rounded-xl font-medium shadow-sm
              ${theme.primary}
            `}
          >
            {t("tool.loadMore")}
          </button>
        </div>
      )}
    </div>
  );
}
