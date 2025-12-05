// app/docs/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useThemeColors } from "@/hooks/useThemeColors";
import { DOCS_DATA } from "@/data/docs";
import DocSection from "@/components/docs/DocSection";
import { Menu, X, ArrowRight, BookOpen } from "lucide-react";

export default function DocsPage() {
  const theme = useThemeColors();
  const [selectedTool, setSelectedTool] = useState<string>(DOCS_DATA[0].id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const categories = Array.from(new Set(DOCS_DATA.map((doc) => doc.category)));
  const currentDoc = DOCS_DATA.find((d) => d.id === selectedTool) || DOCS_DATA[0];

  const handleToolClick = (id: string) => {
    setSelectedTool(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* استایل سفارشی اسکرول */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme.text === 'text-slate-900' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.3)'};
          border-radius: 10px;
          transition: background 0.2s;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme.text === 'text-slate-900' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(96, 165, 250, 0.5)'};
        }

        /* برای Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${theme.text === 'text-slate-900' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.3)'} transparent;
        }
      `}</style>

      {/* دکمه منو موبایل */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`lg:hidden fixed top-20 left-4 z-50 p-3 rounded-xl shadow-lg backdrop-blur-md border transition-all active:scale-95
          ${
            isMobileMenuOpen
              ? `${theme.primary} border-transparent`
              : `${theme.card} ${theme.border}`
          }
        `}
      >
        {isMobileMenuOpen ? <X size={24} className="text-white" /> : <Menu size={24} className={theme.text} />}
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* هدر صفحه */}
        <div className="mb-8 lg:mb-12">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
          >
            <ArrowRight size={16} /> بازگشت به خانه
          </Link>

          <div className={`rounded-3xl border p-8 md:p-12 relative overflow-hidden ${theme.card} ${theme.border}`}>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${theme.secondary}`}>
                  <BookOpen size={28} className={theme.accent} />
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>
                  مستندات فنی
                </h1>
              </div>
              <p className={`text-base md:text-lg max-w-2xl ${theme.textMuted}`}>
                راهنمای جامع ابزارها، معماری سیستم و جزئیات فنی پردازش.
                <span className="block mt-2 text-sm opacity-70">
                  🔒 همه پردازش‌ها در مرورگر شما انجام می‌شود
                </span>
              </p>
            </div>
            
            {/* دکوریشن */}
            <div className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`} />
            <div className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`} />
          </div>
        </div>

        <div className="flex gap-8 items-start">
          {/* Sidebar با اسکرول سفارشی */}
          <aside
            className={`
            custom-scrollbar
            fixed inset-y-0 right-0 z-40 w-80 transform transition-transform duration-300 
            lg:translate-x-0 lg:static lg:w-72 xl:w-80 lg:sticky lg:top-24 
            ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
            ${theme.card} lg:bg-transparent shadow-2xl lg:shadow-none border-l lg:border-0 ${theme.border}
            overflow-y-auto
            max-h-screen lg:max-h-[calc(100vh-120px)]
          `}
          >
            <div className="p-6 space-y-6">
              {/* عنوان موبایل */}
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${theme.text}`}>انتخاب ابزار</h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className={theme.text} />
                </button>
              </div>

              {/* دسته‌بندی‌ها */}
              {categories.map((cat) => (
                <div key={cat}>
                  <h3 className={`font-bold text-xs uppercase tracking-wider mb-3 px-2 ${theme.textMuted}`}>
                    {cat}
                  </h3>
                  <ul className="space-y-1">
                    {DOCS_DATA.filter((d) => d.category === cat).map((doc) => {
                      const Icon = doc.icon;
                      const isActive = selectedTool === doc.id;
                      
                      return (
                        <li key={doc.id}>
                          <button
                            onClick={() => handleToolClick(doc.id)}
                            className={`w-full text-right flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                              ${
                                isActive
                                  ? `${theme.primary} shadow-md`
                                  : `${theme.bg} ${theme.text} hover:${theme.secondary}`
                              }
                            `}
                          >
                            <Icon size={18} className={isActive ? "text-white" : theme.accent} />
                            <span className={`truncate ${isActive ? "text-white" : ""}`}>
                              {doc.title}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </aside>

          {/* Overlay */}
          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            />
          )}

          {/* محتوای اصلی */}
          <main className="flex-1 min-w-0">
            <DocSection data={currentDoc} theme={theme} index={0} />

            {/* ناوبری بین ابزارها */}
            <div className={`mt-12 flex gap-4 justify-between items-center p-6 rounded-2xl border ${theme.card} ${theme.border}`}>
              {(() => {
                const currentIndex = DOCS_DATA.findIndex((d) => d.id === selectedTool);
                const prevDoc = currentIndex > 0 ? DOCS_DATA[currentIndex - 1] : null;
                const nextDoc = currentIndex < DOCS_DATA.length - 1 ? DOCS_DATA[currentIndex + 1] : null;

                return (
                  <>
                    {prevDoc ? (
                      <button
                        onClick={() => handleToolClick(prevDoc.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition hover:${theme.secondary} ${theme.text}`}
                      >
                        <ArrowRight size={16} />
                        <div className="text-right">
                          <div className={`text-xs ${theme.textMuted}`}>قبلی</div>
                          <div className="text-sm font-bold">{prevDoc.title}</div>
                        </div>
                      </button>
                    ) : (
                      <div />
                    )}

                    {nextDoc ? (
                      <button
                        onClick={() => handleToolClick(nextDoc.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition hover:${theme.secondary} ${theme.text}`}
                      >
                        <div className="text-left">
                          <div className={`text-xs ${theme.textMuted}`}>بعدی</div>
                          <div className="text-sm font-bold">{nextDoc.title}</div>
                        </div>
                        <ArrowRight size={16} className="rotate-180" />
                      </button>
                    ) : (
                      <div />
                    )}
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className={`mt-8 text-center py-6 ${theme.textMuted}`}>
              <p className="text-sm">
                سوال یا پیشنهادی دارید؟{" "}
                <Link href="/contact" className={`font-bold hover:underline ${theme.accent}`}>
                  تماس با ما
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
