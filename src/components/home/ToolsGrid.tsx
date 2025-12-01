// components/home/ToolsGrid.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { TOOLS } from "@/data/tools"; // ایمپورت دیتا

export default function ToolsGrid() {
  const theme = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");

  // فیلتر کردن ابزارها
  const filteredTools = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return TOOLS;

    return TOOLS.filter(
      (tool) =>
        tool.title.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  return (
    <div className="pb-20">
      
      {/* نوار جستجو */}
      <div className="max-w-lg mx-auto mb-12 relative">
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`}>
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="جستجو در ابزارها..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full py-4 pr-12 pl-12 rounded-2xl border-2 transition-all outline-none shadow-sm text-lg
          ${theme.bg} ${theme.text} ${theme.border} focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10`}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* لیست ابزارها */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <motion.div
                key={tool.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={tool.href}
                  className={`relative group block p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full
                  ${theme.card} ${theme.border}
                  ${tool.status === "coming-soon" ? "opacity-60 grayscale pointer-events-none" : ""}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-colors duration-300 ${theme.secondary}`}>
                    <tool.Icon className={`w-7 h-7 ${theme.accent}`} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h2 className={`text-xl font-bold ${theme.text}`}>{tool.title}</h2>
                      {tool.badge && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${theme.border} ${theme.bg} ${theme.textMuted}`}>
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm leading-relaxed ${theme.textMuted}`}>{tool.description}</p>
                  </div>

                  <div className={`mt-6 pt-6 border-t flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 duration-300 ${theme.border} ${theme.accent}`}>
                    استفاده از ابزار <ArrowLeft size={16} className="mr-2" />
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="col-span-full text-center py-12 opacity-50"
            >
              <p className={`text-lg ${theme.text}`}>هیچ ابزاری پیدا نشد :(</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
