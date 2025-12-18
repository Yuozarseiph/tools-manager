// app/docs/Docs.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, BookOpen } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import DocSection from "@/components/docs/DocSection";
import { useLanguage } from "@/context/LanguageContext";
import {
  useDocsContent as useDocsData,
  type DocSectionItem,
} from "@/data/docs/docs.content";

import { useMemo } from "react";
import { useDocsPageContent, type DocsCategory } from "./content";

export default function DocsClient() {
  const theme = useThemeColors();
  const { locale } = useLanguage();

  const pageContent = useDocsPageContent();
  const docs: DocSectionItem[] = useDocsData();

  const [selectedTool, setSelectedTool] = useState<string | null>(
    () => docs[0]?.id ?? null
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!selectedTool && docs[0]) setSelectedTool(docs[0].id);
  }, [locale, docs, selectedTool]);

  const categories = useMemo(() => {
    const set = new Set<DocsCategory>();
    docs.forEach((d) => set.add(d.category as DocsCategory));
    return Array.from(set);
  }, [docs]);
  const currentDoc = docs.find((d) => d.id === selectedTool) ?? docs[0];

  const handleToolClick = (id: string) => {
    setSelectedTool(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${theme.scrollbar.track};
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${theme.scrollbar.thumb};
          border-radius: 10px;
          transition: background 0.2s;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${theme.scrollbar.thumbHover};
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${theme.scrollbar.thumb} ${theme.scrollbar.track};
        }
      `}</style>

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
        {isMobileMenuOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <Menu size={24} className={theme.text} />
        )}
      </button>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="mb-8 lg:mb-12">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
          >
            <ArrowRight size={16} />
            {pageContent.ui.back}
          </Link>

          <div
            className={`rounded-3xl border p-8 md:p-12 relative overflow-hidden ${theme.card} ${theme.border}`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${theme.secondary}`}>
                  <BookOpen size={28} className={theme.accent} />
                </div>
                <h1 className={`text-3xl md:text-4xl font-bold ${theme.text}`}>
                  {pageContent.ui.hero.title}
                </h1>
              </div>

              <p
                className={`text-base md:text-lg max-w-2xl ${theme.textMuted}`}
              >
                {pageContent.ui.hero.subtitle}
                <span className="block mt-2 text-sm opacity-70">
                  {pageContent.ui.hero.badge}
                </span>
              </p>
            </div>

            <div
              className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`}
            />
            <div
              className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`}
            />
          </div>
        </div>

        <div className="flex gap-8 items-start">
          <aside
            className={`custom-scrollbar fixed inset-y-0 right-0 z-40 w-80 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:w-72 xl:w-80 lg:sticky lg:top-24 ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            } ${
              theme.card
            } lg:bg-transparent shadow-2xl lg:shadow-none border-l lg:border-0 ${
              theme.border
            } overflow-y-auto max-h-screen lg:max-h-[calc(100vh-120px)]`}
          >
            <div className="p-6 space-y-6">
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className={`text-lg font-bold ${theme.text}`}>
                  {pageContent.ui.sidebar.mobileTitle}
                </h2>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className={theme.text} />
                </button>
              </div>

              {categories.map((cat) => (
                <div key={cat}>
                  <h3
                    className={`font-bold text-xs uppercase tracking-wider mb-3 px-2 ${theme.textMuted}`}
                  >
                    {pageContent.ui.categories[cat] ?? cat}
                  </h3>

                  <ul className="space-y-1">
                    {docs
                      .filter((d) => d.category === cat)
                      .map((doc) => {
                        const Icon = doc.icon;
                        const isActive = selectedTool === doc.id;

                        return (
                          <li key={doc.id}>
                            <button
                              onClick={() => handleToolClick(doc.id)}
                              className={`w-full text-right flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                                isActive
                                  ? `${theme.primary} shadow-md`
                                  : `${theme.bg} ${theme.text} hover:${theme.secondary}`
                              }`}
                            >
                              <Icon
                                size={18}
                                className={
                                  isActive ? "text-white" : theme.accent
                                }
                              />
                              <span
                                className={`truncate ${
                                  isActive ? "text-white" : ""
                                }`}
                              >
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

          {isMobileMenuOpen && (
            <div
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            />
          )}

          <main className="flex-1 min-w-0">
            {currentDoc && (
              <DocSection data={currentDoc} theme={theme} index={0} />
            )}

            <div
              className={`mt-12 flex gap-4 justify-between items-center p-6 rounded-2xl border ${theme.card} ${theme.border}`}
            >
              {(() => {
                const currentIndex = docs.findIndex(
                  (d) => d.id === selectedTool
                );
                const prevDoc =
                  currentIndex > 0 ? docs[currentIndex - 1] : null;
                const nextDoc =
                  currentIndex >= 0 && currentIndex < docs.length - 1
                    ? docs[currentIndex + 1]
                    : null;

                return (
                  <>
                    {prevDoc ? (
                      <button
                        onClick={() => handleToolClick(prevDoc.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition hover:${theme.secondary} ${theme.text}`}
                      >
                        <ArrowRight size={16} />
                        <div className="text-right">
                          <div className={`text-xs ${theme.textMuted}`}>
                            {pageContent.ui.nav.prev}
                          </div>
                          <div className="text-sm font-bold">
                            {prevDoc.title}
                          </div>
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
                          <div className={`text-xs ${theme.textMuted}`}>
                            {pageContent.ui.nav.next}
                          </div>
                          <div className="text-sm font-bold">
                            {nextDoc.title}
                          </div>
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

            <div className={`mt-8 text-center py-6 ${theme.textMuted}`}>
              <p className="text-sm">
                {pageContent.ui.footer.question}{" "}
                <Link
                  href="/contact"
                  className={`font-bold hover:underline ${theme.accent}`}
                >
                  {pageContent.ui.footer.contactCta}
                </Link>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
