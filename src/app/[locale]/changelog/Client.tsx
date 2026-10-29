"use client";
import PanelDisclosure from "@/components/ui/PanelDisclosure";
import { AccessibleInput } from "@/components/ui/AccessibleControls";

import { useEffect, useMemo, useState } from "react";
import Link from "@/components/LocalizedLink";
import {
  ArrowLeft,
  ArrowRight,
  Bug,
  Calendar,
  ChevronDown,
  FlaskConical,
  GitBranch,
  Rocket,
  Search,
  Sparkles,
  StickyNote,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import {
  CHANGELOG_BY_LOCALE,
  type ChangelogEntry,
} from "@/data/changelog";
import { useChangelogContent } from "@/data/changelog/changelog.content";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColors } from "@/hooks/useThemeColors";

type CategoryKey = "added" | "improved" | "fixed" | "beta" | "note";

const CATEGORY_CONFIG: Record<
  CategoryKey,
  {
    icon: any;
    className: string;
    dotClassName: string;
  }
> = {
  added: {
    icon: Sparkles,
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    dotClassName: "bg-emerald-500",
  },
  improved: {
    icon: Wrench,
    className:
      "bg-[var(--app-secondary-bg)] text-[var(--app-accent)]",
    dotClassName: "bg-[var(--app-accent)]",
  },
  fixed: {
    icon: Bug,
    className:
      "bg-[var(--app-error-bg)] text-[var(--app-error-text)]",
    dotClassName: "bg-[var(--app-error-text)]",
  },
  beta: {
    icon: FlaskConical,
    className:
      "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    dotClassName: "bg-purple-500",
  },
  note: {
    icon: StickyNote,
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    dotClassName: "bg-amber-500",
  },
};

export default function ChangelogPage() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = useChangelogContent();
  const isFa = locale === "fa";

  const data: ChangelogEntry[] = CHANGELOG_BY_LOCALE[locale];

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    () => new Set(data[0]?.version ? [data[0].version] : []),
  );

  useEffect(() => {
    if (!data[0]?.version) return;

    setExpandedVersions((current) => {
      if (current.size > 0) return current;
      return new Set([data[0].version]);
    });
  }, [data]);

  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(locale);

    if (!query) return data;

    return data.filter((entry) => {
      if (
        entry.version.toLocaleLowerCase(locale).includes(query) ||
        entry.date.toLocaleLowerCase(locale).includes(query) ||
        entry.type.toLocaleLowerCase(locale).includes(query)
      ) {
        return true;
      }

      return entry.changes.some((group) => {
        const categoryLabel =
          content.categories[
          group.category as keyof typeof content.categories
          ] ?? group.category;

        return (
          categoryLabel.toLocaleLowerCase(locale).includes(query) ||
          group.items.some((item) =>
            item.toLocaleLowerCase(locale).includes(query),
          )
        );
      });
    });
  }, [content.categories, data, locale, searchQuery]);

  const toggleVersion = (version: string) => {
    setExpandedVersions((current) => {
      const next = new Set(current);

      if (next.has(version)) {
        next.delete(version);
      } else {
        next.add(version);
      }

      return next;
    });
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "release":
        return {
          icon: Rocket,
          label: content.type.release,
        };
      case "fix":
        return {
          icon: Bug,
          label: content.type.fix,
        };
      default:
        return {
          icon: Zap,
          label: content.type.update,
        };
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <Link
          href="/"
          className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.textMuted}`}
        >
          {isFa ? (
            <ArrowRight size={16} aria-hidden="true" />
          ) : (
            <ArrowLeft size={16} aria-hidden="true" />
          )}
          {content.back}
        </Link>

        <header className="mb-8 mt-8 max-w-3xl">
          <div
            className={`mb-5 flex h-11 w-11 items-center justify-center rounded-[15px] ${theme.secondary}`}
          >
            <Rocket size={20} className={theme.accent} aria-hidden="true" />
          </div>

          <h1
            className={`text-3xl font-black tracking-[-0.025em] sm:text-4xl ${theme.text}`}
          >
            {content.hero.title}
          </h1>

          <p className={`mt-4 text-base leading-8 ${theme.textMuted}`}>
            {content.hero.subtitle}
          </p>
        </header>

        <section
          aria-label={content.search.label}
          className={`mb-5 rounded-[20px] border p-3 sm:p-4 ${theme.card} ${theme.border}`}
        >
          <label htmlFor="changelog-search" className="sr-only">
            {content.search.label}
          </label>

          <div className="relative">
            <Search
              size={17}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${isFa ? "right-4" : "left-4"
                } ${theme.textMuted}`}
              aria-hidden="true"
            />

            <AccessibleInput fieldLabel={content.search.label}
              id="changelog-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={content.search.placeholder}
              className={`min-h-12 w-full rounded-[15px] border bg-transparent py-3 text-sm outline-none focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-ring)] ${isFa ? "pl-11 pr-11" : "pl-11 pr-11"
                } ${theme.border} ${theme.text}`}
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label={content.search.clear}
                className={`absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${isFa ? "left-2.5" : "right-2.5"
                  } ${theme.secondary} ${theme.textMuted}`}
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          {searchQuery && (
            <p
              className={`mt-2 px-1 text-xs ${theme.textMuted}`}
              aria-live="polite"
            >
              {filteredEntries.length} {content.search.results}
            </p>
          )}
        </section>

        {filteredEntries.length === 0 ? (
          <div
            className={`flex min-h-52 flex-col items-center justify-center rounded-[22px] border border-dashed px-5 text-center ${theme.border}`}
          >
            <Search
              size={24}
              className={theme.textMuted}
              aria-hidden="true"
            />
            <p className={`mt-3 text-sm font-black ${theme.text}`}>
              {content.search.noResults}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className={`mt-3 rounded-full px-4 py-2 text-sm font-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.secondary} ${theme.accent}`}
            >
              {content.search.clear}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry, index) => {
              const isLatest = data[0]?.version === entry.version;
              const isExpanded =
                searchQuery.trim().length > 0 ||
                expandedVersions.has(entry.version);
              const typeConfig = getTypeConfig(entry.type);
              const TypeIcon = typeConfig.icon;
              const panelId = `changelog-${entry.version.replace(
                /[^a-zA-Z0-9_-]/g,
                "-",
              )}`;

              return (
                <article
                  key={entry.version}
                  className={`overflow-hidden rounded-[22px] border ${isLatest
                      ? "border-[var(--app-accent)]"
                      : theme.border
                    } ${theme.card}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleVersion(entry.version)}
                    aria-expanded={isExpanded}
                    aria-controls={panelId}
                    className={`flex w-full items-start gap-4 p-4 text-start focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-[var(--app-ring)] sm:p-5`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
                    >
                      <TypeIcon
                        size={18}
                        className={theme.accent}
                        aria-hidden="true"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-base font-black sm:text-lg ${theme.text}`}
                        >
                          {content.versionLabel} {entry.version}
                        </span>

                        {(entry.status === "development" || entry.version === data.find(item => item.status !== "development")?.version) && (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-black ${theme.primary} text-white`}
                          >
                            {entry.status === "development" ? (isFa ? "در حال توسعه" : "In development") : content.currentLabel}
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ${theme.secondary} ${theme.textMuted}`}
                        >
                          {typeConfig.label}
                        </span>
                      </span>

                      <span
                        className={`mt-1.5 flex items-center gap-1.5 text-xs ${theme.textMuted}`}
                      >
                        <Calendar size={13} aria-hidden="true" />
                        {entry.date}
                      </span>
                    </span>

                    <span
                      className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${theme.secondary} ${theme.textMuted}`}
                      aria-hidden="true"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform motion-reduce:transition-none ${isExpanded ? "rotate-180" : ""
                          }`}
                      />
                    </span>
                  </button>

                  {(
                    <PanelDisclosure
                      id={panelId}
                      open={isExpanded}
                      className={`border-t px-4 pb-5 pt-4 sm:px-5 sm:pb-6 ${theme.border}`}
                    >
                      <span className="sr-only">
                        {content.release.hideChanges}
                      </span>

                      <div className="space-y-6">
                        {entry.changes.map((changeGroup, groupIndex) => {
                          const category =
                            changeGroup.category as CategoryKey;
                          const config =
                            CATEGORY_CONFIG[category] ??
                            CATEGORY_CONFIG.improved;
                          const CategoryIcon = config.icon;
                          const categoryTitle =
                            content.categories[
                            category as keyof typeof content.categories
                            ] ?? category;

                          return (
                            <section
                              key={`${entry.version}-${category}-${groupIndex}`}
                              aria-labelledby={`${panelId}-${category}-${groupIndex}`}
                            >
                              <div className="mb-3 flex items-center gap-2">
                                <span
                                  className={`flex h-8 w-8 items-center justify-center rounded-[11px] ${config.className}`}
                                >
                                  <CategoryIcon
                                    size={15}
                                    aria-hidden="true"
                                  />
                                </span>

                                <h2
                                  id={`${panelId}-${category}-${groupIndex}`}
                                  className={`text-sm font-black ${theme.text}`}
                                >
                                  {categoryTitle}
                                </h2>
                              </div>

                              <ul className="space-y-2.5">
                                {changeGroup.items.map((item, itemIndex) => (
                                  <li
                                    key={`${entry.version}-${groupIndex}-${itemIndex}`}
                                    className={`flex items-start gap-3 text-sm leading-7 ${theme.textMuted}`}
                                  >
                                    <span
                                      className={`mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full ${config.dotClassName}`}
                                      aria-hidden="true"
                                    />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </section>
                          );
                        })}
                      </div>
                    </PanelDisclosure>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <footer className={`mt-8 border-t pt-6 ${theme.border}`}>
          <div className="flex items-start gap-3">
            <GitBranch
              size={17}
              className={`mt-0.5 shrink-0 ${theme.accent}`}
              aria-hidden="true"
            />
            <p className={`text-sm leading-7 ${theme.textMuted}`}>
              {content.note}
            </p>
          </div>

          <p className={`mt-4 text-sm ${theme.textMuted}`}>
            {content.contact.question}{" "}
            <Link
              href="/contact"
              className={`font-black underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.accent}`}
            >
              {content.contact.contact}
            </Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
