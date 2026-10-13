"use client";
import { AccessibleInput } from "@/components/ui/AccessibleControls";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "@/components/LocalizedLink";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Menu,
  Search,
  X,
} from "lucide-react";

import DocSection from "@/components/docs/DocSection";
import { useLanguage } from "@/context/LanguageContext";
import {
  type DocSectionItem,
  useDocsContent as useDocsData,
} from "@/data/docs/docs.content";
import { useThemeColors } from "@/hooks/useThemeColors";

import { type DocsCategory, useDocsPageContent } from "./content";

export default function DocsClient() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const isFa = locale === "fa";

  const pageContent = useDocsPageContent();
  const docs: DocSectionItem[] = useDocsData();

  const [selectedTool, setSelectedTool] = useState<string | null>(
    () => docs[0]?.id ?? null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!selectedTool && docs[0]) {
      setSelectedTool(docs[0].id);
    }
  }, [docs, selectedTool]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        mobileMenuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobileMenuOpen]);

  const categories = useMemo(() => {
    const values = new Set<DocsCategory>();
    docs.forEach((doc) => values.add(doc.category as DocsCategory));
    return Array.from(values);
  }, [docs]);

  const filteredDocs = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(locale);

    if (!query) return docs;

    return docs.filter(
      (doc) =>
        doc.title.toLocaleLowerCase(locale).includes(query) ||
        doc.description.toLocaleLowerCase(locale).includes(query) ||
        (pageContent.ui.categories[
          doc.category as DocsCategory
        ] ?? doc.category)
          .toLocaleLowerCase(locale)
          .includes(query),
    );
  }, [docs, locale, pageContent.ui.categories, searchQuery]);

  const currentDoc =
    docs.find((doc) => doc.id === selectedTool) ?? docs[0];

  const currentIndex = docs.findIndex((doc) => doc.id === currentDoc?.id);
  const previousDoc = currentIndex > 0 ? docs[currentIndex - 1] : null;
  const nextDoc =
    currentIndex >= 0 && currentIndex < docs.length - 1
      ? docs[currentIndex + 1]
      : null;

  const handleToolClick = (id: string) => {
    setSelectedTool(id);
    setIsMobileMenuOpen(false);

    window.requestAnimationFrame(() => {
      document
        .getElementById("docs-content")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const renderDocList = () => {
    if (filteredDocs.length === 0) {
      return (
        <div
          className={`rounded-[16px] border border-dashed px-4 py-8 text-center text-sm ${theme.border} ${theme.textMuted}`}
        >
          <Search
            size={20}
            className="mx-auto mb-2 opacity-50"
            aria-hidden="true"
          />
          {pageContent.ui.sidebar.noResults}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {categories.map((category) => {
          const categoryDocs = filteredDocs.filter(
            (doc) => doc.category === category,
          );

          if (categoryDocs.length === 0) return null;

          return (
            <section key={category}>
              <h2
                className={`mb-2 px-2 text-xs font-black uppercase tracking-[0.14em] ${theme.textMuted}`}
              >
                {pageContent.ui.categories[category] ?? category}
              </h2>

              <div className="space-y-1">
                {categoryDocs.map((doc) => {
                  const Icon = doc.icon;
                  const active = currentDoc?.id === doc.id;

                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleToolClick(doc.id)}
                      aria-pressed={active}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-[14px] px-3 text-start text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${
                        active
                          ? `${theme.secondary} ${theme.accent}`
                          : `${theme.text} hover:bg-black/5 dark:hover:bg-white/5`
                      }`}
                    >
                      <Icon
                        size={17}
                        className={active ? theme.accent : theme.textMuted}
                        aria-hidden="true"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {doc.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="mx-auto w-full max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <div className="mb-8">
          <Link
            href="/"
            className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.textMuted}`}
          >
            {isFa ? (
              <ArrowRight size={16} aria-hidden="true" />
            ) : (
              <ArrowLeft size={16} aria-hidden="true" />
            )}
            {pageContent.ui.back}
          </Link>

          <div className="mt-7 max-w-3xl">
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-[15px] ${theme.secondary}`}
              >
                <BookOpen size={20} className={theme.accent} aria-hidden="true" />
              </div>

              <span
                className={`rounded-full px-3 py-1.5 text-xs font-black ${theme.secondary} ${theme.accent}`}
              >
                {pageContent.ui.hero.badge}
              </span>
            </div>

            <h1
              className={`text-3xl font-black tracking-[-0.025em] sm:text-4xl ${theme.text}`}
            >
              {pageContent.ui.hero.title}
            </h1>

            <p className={`mt-4 text-base leading-8 ${theme.textMuted}`}>
              {pageContent.ui.hero.subtitle}
            </p>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-10">
          <aside className="hidden lg:block">
            <div
              className={`sticky top-24 max-h-[calc(100vh-7rem)] overflow-hidden rounded-[22px] border ${theme.card} ${theme.border}`}
            >
              <div className={`border-b p-3 ${theme.border}`}>
                <label htmlFor="docs-search-desktop" className="sr-only">
                  {pageContent.ui.sidebar.searchLabel}
                </label>

                <div className="relative">
                  <Search
                    size={16}
                    className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
                      isFa ? "right-3" : "left-3"
                    } ${theme.textMuted}`}
                    aria-hidden="true"
                  />

                  <AccessibleInput fieldLabel={pageContent.ui.sidebar.searchLabel}
                    id="docs-search-desktop"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={pageContent.ui.sidebar.searchPlaceholder}
                    className={`min-h-11 w-full rounded-[14px] border bg-transparent py-2 text-sm outline-none focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-ring)] ${
                      isFa ? "pl-3 pr-9" : "pl-9 pr-3"
                    } ${theme.border} ${theme.text}`}
                  />
                </div>
              </div>

              <nav
                aria-label={pageContent.ui.sidebar.mobileTitle}
                className="custom-scrollbar max-h-[calc(100vh-11rem)] overflow-y-auto p-3"
              >
                {renderDocList()}
              </nav>
            </div>
          </aside>

          <div className="lg:hidden">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-expanded={isMobileMenuOpen}
              className={`mb-5 flex min-h-12 w-full items-center justify-between gap-3 rounded-[16px] border px-4 text-sm font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.card} ${theme.border} ${theme.text}`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <Menu size={18} className={theme.accent} aria-hidden="true" />
                <span className="truncate">
                  {currentDoc?.title ?? pageContent.ui.sidebar.mobileTitle}
                </span>
              </span>

              <span className={`text-xs font-bold ${theme.textMuted}`}>
                {pageContent.ui.sidebar.mobileTitle}
              </span>
            </button>
          </div>

          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 z-[100] flex items-end bg-black/45 backdrop-blur-[2px] lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label={pageContent.ui.sidebar.mobileTitle}
            >
              <button
                type="button"
                className="absolute inset-0"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label={pageContent.ui.sidebar.closeMenu}
              />

              <div
                className={`relative max-h-[86vh] w-full overflow-hidden rounded-t-[28px] border-t shadow-2xl ${theme.card} ${theme.border}`}
              >
                <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-current opacity-15" />

                <div
                  className={`flex items-center justify-between border-b px-4 pb-4 pt-3 ${theme.border}`}
                >
                  <h2 className={`font-black ${theme.text}`}>
                    {pageContent.ui.sidebar.mobileTitle}
                  </h2>

                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.secondary} ${theme.text}`}
                    aria-label={pageContent.ui.sidebar.closeMenu}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>

                <div className={`border-b p-3 ${theme.border}`}>
                  <label htmlFor="docs-search-mobile" className="sr-only">
                    {pageContent.ui.sidebar.searchLabel}
                  </label>

                  <div className="relative">
                    <Search
                      size={16}
                      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${
                        isFa ? "right-3" : "left-3"
                      } ${theme.textMuted}`}
                      aria-hidden="true"
                    />

                    <AccessibleInput fieldLabel={pageContent.ui.sidebar.searchLabel}
                      id="docs-search-mobile"
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={pageContent.ui.sidebar.searchPlaceholder}
                      className={`min-h-11 w-full rounded-[14px] border bg-transparent py-2 text-sm outline-none focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-ring)] ${
                        isFa ? "pl-3 pr-9" : "pl-9 pr-3"
                      } ${theme.border} ${theme.text}`}
                      autoFocus
                    />
                  </div>
                </div>

                <nav
                  aria-label={pageContent.ui.sidebar.mobileTitle}
                  className="custom-scrollbar max-h-[calc(86vh-8.5rem)] overflow-y-auto p-3"
                >
                  {renderDocList()}
                </nav>
              </div>
            </div>
          )}

          <div
            id="docs-content"
            className="min-w-0 scroll-mt-24"
            tabIndex={-1}
          >
            {currentDoc && (
              <DocSection data={currentDoc} theme={theme} index={0} />
            )}

            <nav
              aria-label={
                isFa ? "جابجایی بین مستندات" : "Documentation navigation"
              }
              className={`mt-8 grid gap-3 border-t pt-6 sm:grid-cols-2 ${theme.border}`}
            >
              <div>
                {previousDoc && (
                  <button
                    type="button"
                    onClick={() => handleToolClick(previousDoc.id)}
                    className={`group flex min-h-16 w-full items-center gap-3 rounded-[18px] border px-4 text-start focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.card} ${theme.border} ${theme.text}`}
                  >
                    {isFa ? (
                      <ArrowRight size={17} className={theme.accent} aria-hidden="true" />
                    ) : (
                      <ArrowLeft size={17} className={theme.accent} aria-hidden="true" />
                    )}

                    <span className="min-w-0">
                      <span className={`block text-xs font-bold ${theme.textMuted}`}>
                        {pageContent.ui.nav.prev}
                      </span>
                      <span className="mt-1 block truncate text-sm font-black">
                        {previousDoc.title}
                      </span>
                    </span>
                  </button>
                )}
              </div>

              <div>
                {nextDoc && (
                  <button
                    type="button"
                    onClick={() => handleToolClick(nextDoc.id)}
                    className={`group flex min-h-16 w-full items-center justify-end gap-3 rounded-[18px] border px-4 text-end focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.card} ${theme.border} ${theme.text}`}
                  >
                    <span className="min-w-0">
                      <span className={`block text-xs font-bold ${theme.textMuted}`}>
                        {pageContent.ui.nav.next}
                      </span>
                      <span className="mt-1 block truncate text-sm font-black">
                        {nextDoc.title}
                      </span>
                    </span>

                    {isFa ? (
                      <ArrowLeft size={17} className={theme.accent} aria-hidden="true" />
                    ) : (
                      <ArrowRight size={17} className={theme.accent} aria-hidden="true" />
                    )}
                  </button>
                )}
              </div>
            </nav>

            <div className={`mt-8 py-4 text-center text-sm ${theme.textMuted}`}>
              {pageContent.ui.footer.question}{" "}
              <Link
                href="/contact"
                className={`font-black underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.accent}`}
              >
                {pageContent.ui.footer.contactCta}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
