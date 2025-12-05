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
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { TOOLS } from "@/data/tools";

const CATEGORIES = [
  { id: "all", label: "همه ابزارها", icon: Grid },
  { id: "pdf", label: "PDF", icon: FileText },
  { id: "image", label: "تصویر", icon: ImageIcon },
  { id: "developer", label: "برنامه‌نویسی", icon: Code2 },
  { id: "security", label: "امنیت", icon: ShieldCheck },
  { id: "system", label: "سیستم", icon: MonitorSmartphone },
  { id: "utility", label: "کاربردی", icon: Wrench },
  { id: "excel", label: "اکسل", icon: FileText },
  { id: "audio", label: "صدا", icon: FileText },
];

export default function ToolsGrid() {
  const theme = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredTools = useMemo(() => {
    let tools = TOOLS;

    if (activeCategory !== "all") {
      if (activeCategory === "utility") {
        tools = tools.filter((t) =>
          ["Tools", "utility"].includes((t.category as any) || "")
        );
      } else {
        tools = tools.filter(
          (t) => t.category?.toLowerCase() === activeCategory
        );
      }
    }

    const query = searchQuery.toLowerCase().trim();
    if (query) {
      tools = tools.filter(
        (tool) =>
          tool.title.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query)
      );
    }

    return tools;
  }, [searchQuery, activeCategory]);

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
    <div className="pb-20 space-y-10">
      <div className="max-w-lg mx-auto relative z-20">
        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
        >
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="جستجو در ابزارها..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={`w-full py-4 pr-12 pl-12 rounded-2xl border-2 transition-all outline-none shadow-sm text-lg
          ${theme.bg} ${theme.text} ${theme.border} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10`}
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
            ${
              activeCategory === cat.id
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                : `${theme.bg} ${theme.text} border ${theme.border} hover:bg-zinc-100 dark:hover:bg-zinc-800`
            }`}
          >
            <cat.icon size={16}/>
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  className={`relative group block p-4 md:p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col
                  ${theme.card} ${theme.border}
                  ${
                    tool.status === "coming-soon"
                      ? "opacity-60 grayscale pointer-events-none"
                      : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-lg transition-colors duration-300 ${theme.secondary}`}
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
                          className={`text-[10px] font-bold px-2 py-1 rounded-full border ${theme.border} ${theme.bg} ${theme.textMuted}`}
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

                  <div
                    className={`mt-4 md:mt-6 pt-4 md:pt-6 border-t flex items-center text-xs md:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300 ${theme.border} ${theme.accent}`}
                  >
                    استفاده از ابزار <ArrowLeft size={16} className="mr-2" />
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20 opacity-50 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Search size={32} className={theme.textMuted} />
              </div>
              <p className={`text-lg font-medium ${theme.text}`}>
                هیچ ابزاری در این دسته پیدا نشد :(
              </p>
              <button
                onClick={() => {
                  setActiveCategory("all");
                  handleSearchChange("");
                }}
                className="text-blue-500 hover:underline text-sm"
              >
                نمایش همه ابزارها
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {visibleCount < filteredTools.length && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setVisibleCount((c) => c + 9)}
            className={`px-4 py-2 text-sm rounded-xl font-medium shadow-sm ${theme.primary}`}
          >
            نمایش ابزارهای بیشتر
          </button>
        </div>
      )}
    </div>
  );
}
