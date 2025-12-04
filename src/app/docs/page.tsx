"use client";

import { useState, useEffect } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { DOCS_DATA } from "@/data/docs";
import DocSection from "@/components/docs/DocSection";
import { Menu, X, ChevronLeft } from "lucide-react";

export default function DocsPage() {
  const theme = useThemeColors();
  const [activeId, setActiveId] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- تشخیص اسکرول برای هایلایت کردن منوی کناری ---
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("div[id]");
      let current = "";

      sections.forEach((section) => {
        const sectionTop = (section as HTMLElement).offsetTop;
        if (window.scrollY >= sectionTop - 150) {
          current = section.getAttribute("id") || "";
        }
      });
      setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- گروه‌بندی ابزارها بر اساس دسته‌بندی ---
  const categories = Array.from(new Set(DOCS_DATA.map((doc) => doc.category)));

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`lg:hidden fixed top-20 left-4 z-50 p-3 rounded-xl shadow-lg backdrop-blur-md border transition-all active:scale-95
          ${
            isMobileMenuOpen
              ? "bg-red-500/80 border-red-500 text-white"
              : `bg-white/70 dark:bg-black/70 border-gray-200 dark:border-gray-700 ${theme.text}`
          }
        `}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex gap-12 items-start">
        {/* --- Sidebar (Desktop + Mobile Drawer) --- */}
        <aside
          className={`
          fixed inset-y-0 right-0 z-40 w-72 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-[calc(100vh-100px)] lg:sticky lg:top-24 lg:w-80
          ${
            isMobileMenuOpen
              ? "translate-x-0 bg-white dark:bg-gray-900 shadow-2xl"
              : "translate-x-full"
          }
          lg:bg-transparent lg:shadow-none overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700
        `}
        >
          <div className="p-6 lg:p-0 space-y-8">
            <div className="mb-8 lg:hidden flex items-center justify-between">
              <h2 className={`text-xl font-black ${theme.text}`}>
                فهرست مطالب
              </h2>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} className={theme.text} />
              </button>
            </div>

            {categories.map((cat) => (
              <div key={cat}>
                <h3
                  className={`font-bold text-sm mb-3 px-3 flex items-center gap-2 ${theme.accent}`}
                >
                  {cat}
                </h3>
                <ul className={`space-y-1 border-r-2 ${theme.border}`}>
                  {DOCS_DATA.filter((d) => d.category === cat).map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={`#${doc.id}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`group flex items-center justify-between px-3 py-2 text-sm transition-all border-r-2 -mr-[2px]
                          ${
                            activeId === doc.id
                              ? "border-blue-500 text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/10"
                              : `border-transparent ${theme.textMuted} hover:text-blue-500 hover:bg-black/5 dark:hover:bg-white/5`
                          }
                        `}
                      >
                        <span className="truncate">{doc.title}</span>
                        {activeId === doc.id && (
                          <ChevronLeft size={14} className="text-blue-500" />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          />
        )}

        <main className="flex-1 min-w-0">
          <div className="mb-16 border-b pb-12 relative overflow-hidden rounded-3xl p-8 sm:p-12 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/10">
            <div className="relative z-10">
              <h1
                className={`text-4xl md:text-5xl font-black mb-6 ${theme.text}`}
              >
                مستندات فنی
              </h1>
              <p
                className={`text-lg md:text-xl leading-loose max-w-2xl ${theme.textMuted}`}
              >
                راهنمای جامع ابزارها، معماری سیستم و جزئیات فنی.
                <br />
                ما به <strong>شفافیت</strong> و <strong>حریم خصوصی</strong>{" "}
                متعهدیم.
              </p>
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="space-y-24 pb-20">
            {DOCS_DATA.map((doc, index) => (
              <DocSection key={doc.id} data={doc} theme={theme} index={index} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
