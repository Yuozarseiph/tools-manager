// components/home/ToolsGrid.tsx
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X, Grid, FileText, Image as ImageIcon, Code2, ShieldCheck, MonitorSmartphone, Wrench } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { TOOLS } from "@/data/tools"; 

// لیست دسته‌بندی‌ها برای تب‌ها
const CATEGORIES = [
  { id: 'all', label: 'همه ابزارها', icon: Grid },
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'image', label: 'تصویر', icon: ImageIcon },
  { id: 'developer', label: 'برنامه‌نویسی', icon: Code2 },
  { id: 'security', label: 'امنیت', icon: ShieldCheck },
  { id: 'system', label: 'سیستم', icon: MonitorSmartphone },
  { id: 'utility', label: 'کاربردی', icon: Wrench },
  { id: 'excel', label: 'اکسل', icon: FileText },
  { id: 'audio', label: 'صدا', icon: FileText },
];

export default function ToolsGrid() {
  const theme = useThemeColors();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState('all');

  // فیلتر ترکیبی (سرچ + دسته‌بندی)
  const filteredTools = useMemo(() => {
    let tools = TOOLS;

    // 1. فیلتر دسته‌بندی
    if (activeCategory !== 'all') {
      // نکته: چون توی دیتا ممکنه "Tools" یا "Image" باشه، باید با حروف کوچک مقایسه کنیم
      // و همچنین دسته‌بندی‌های عمومی رو هندل کنیم
      if (activeCategory === 'utility') {
         tools = tools.filter(t => ['Tools', 'utility'].includes(t.category || ''));
      } else {
         tools = tools.filter(t => t.category?.toLowerCase() === activeCategory);
      }
    }

    // 2. فیلتر سرچ
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

  return (
    <div className="pb-20 space-y-10">
      
      {/* نوار جستجو */}
      <div className="max-w-lg mx-auto relative z-20">
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

      {/* دسته‌بندی‌ها (Tabs) */}
      <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto px-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
            ${activeCategory === cat.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105' 
              : `${theme.bg} ${theme.text} border ${theme.border} hover:bg-zinc-100 dark:hover:bg-zinc-800`
            }`}
          >
            <cat.icon size={16} />
            {cat.label}
          </button>
        ))}
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
                  className={`relative group block p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl h-full flex flex-col
                  ${theme.card} ${theme.border}
                  ${tool.status === "coming-soon" ? "opacity-60 grayscale pointer-events-none" : ""}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg transition-colors duration-300 ${theme.secondary}`}>
                    <tool.Icon className={`w-7 h-7 ${theme.accent}`} />
                  </div>

                  <div className="space-y-2 flex-1">
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
              className="col-span-full text-center py-20 opacity-50 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Search size={32} className={theme.textMuted} />
              </div>
              <p className={`text-lg font-medium ${theme.text}`}>هیچ ابزاری در این دسته پیدا نشد :(</p>
              <button 
                onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                className="text-blue-500 hover:underline text-sm"
              >
                نمایش همه ابزارها
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
