"use client";

import Link from "next/link";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  ArrowRight,
  Calendar,
  Rocket,
  Wrench,
  Bug,
  Sparkles,
  FlaskConical,
  StickyNote,
  GitBranch,
  Zap,
} from "lucide-react";
import { CHANGELOG_BY_LOCALE, type ChangelogEntry } from "@/data/changelog";
import { useLanguage } from "@/context/LanguageContext";
import { useChangelogContent } from "@/data/changelog/changelog.content";

export default function ChangelogPage() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = useChangelogContent();

  const data: ChangelogEntry[] = CHANGELOG_BY_LOCALE[locale];

  const getCategoryConfig = (category: string) => {
    switch (category) {
      case "added":
        return {
          icon: Sparkles,
          iconColor: "text-emerald-500",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
          dotColor: "bg-emerald-500",
          borderColor: "border-emerald-200 dark:border-emerald-800",
        };
      case "improved":
        return {
          icon: Wrench,
          iconColor: "text-[var(--app-accent)]",
          bgColor: "bg-[var(--app-secondary-bg)]",
          dotColor: "bg-[var(--app-accent)]",
          borderColor: "border-[var(--app-border)]",
        };
      case "fixed":
        return {
          icon: Bug,
          iconColor: "text-[var(--app-error-text)]",
          bgColor: "bg-[var(--app-error-bg)]",
          dotColor: "bg-[var(--app-error-text)]",
          borderColor: "border-[var(--app-error-border)]",
        };
      case "beta":
        return {
          icon: FlaskConical,
          iconColor: "text-purple-500",
          bgColor: "bg-purple-50 dark:bg-purple-950/30",
          dotColor: "bg-purple-500",
          borderColor: "border-purple-200 dark:border-purple-800",
        };
      case "note":
        return {
          icon: StickyNote,
          iconColor: "text-amber-500",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          dotColor: "bg-amber-500",
          borderColor: "border-amber-200 dark:border-amber-800",
        };
      default:
        return {
          icon: Sparkles,
          iconColor: "text-gray-500",
          bgColor: "bg-gray-50 dark:bg-gray-950/30",
          dotColor: "bg-gray-500",
          borderColor: "border-gray-200 dark:border-gray-800",
        };
    }
  };

  const getCategoryTitle = (category: string) =>
    content.categories[category as keyof typeof content.categories] ?? category;

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "release":
        return {
          icon: Rocket,
          label: content.type.release,
          className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
        };
      case "fix":
        return {
          icon: Bug,
          label: content.type.fix,
          className:
            "bg-[var(--app-error-bg)] text-[var(--app-error-text)] border-[var(--app-error-border)]",
        };
      default:
        return {
          icon: Zap,
          label: content.type.update,
          className:
            "bg-[var(--app-secondary-bg)] text-[var(--app-accent)] border-[var(--app-border)]",
        };
    }
  };

  const isLatest = (_entry: ChangelogEntry, index: number) => index === 0;

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-10 lg:mb-14">
          <Link
            href="/"
            className={`inline-flex items-center gap-2 text-sm font-medium mb-6 hover:opacity-70 transition-opacity ${theme.textMuted}`}
          >
            <ArrowRight size={16} />
            {content.back}
          </Link>

          <div
            className={`rounded-3xl border p-8 md:p-12 relative overflow-hidden ${theme.card} ${theme.border}`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl ${theme.secondary}`}>
                  <Rocket size={28} className={theme.accent} />
                </div>
                <div>
                  <h1
                    className={`text-3xl md:text-4xl font-black ${theme.text}`}
                  >
                    {content.hero.title}
                  </h1>
                </div>
              </div>
              <p
                className={`text-base md:text-lg max-w-2xl ${theme.textMuted}`}
              >
                {content.hero.subtitle}
              </p>
            </div>

            {/* Gradient blobs */}
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-[var(--app-gradient-from)] to-[var(--app-gradient-to)]" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 bg-gradient-to-br from-purple-600 to-pink-500" />
          </div>
        </div>

        {/* Version filter legend */}
        <div className="flex flex-wrap gap-3 mb-8">
          {(["added", "improved", "fixed", "beta", "note"] as const).map(
            (cat) => {
              const catConfig = getCategoryConfig(cat);
              const Icon = catConfig.icon;
              return (
                <div
                  key={cat}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${catConfig.bgColor} ${catConfig.borderColor}`}
                >
                  <Icon size={14} className={catConfig.iconColor} />
                  <span className={catConfig.iconColor}>
                    {getCategoryTitle(cat)}
                  </span>
                </div>
              );
            },
          )}
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[var(--app-accent)] via-purple-500 to-emerald-500 opacity-30" />

          <div className="space-y-8">
            {data.map((entry, index) => {
              const typeConfig = getTypeBadge(entry.type);
              const TypeIcon = typeConfig.icon;
              const isLatestEntry = isLatest(entry, index);

              return (
                <div key={entry.version} className="relative pl-10 md:pl-14">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-2.5 md:left-4.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 shadow-md z-10 ${
                      isLatestEntry
                        ? "bg-[var(--app-accent)] ring-4 ring-[var(--app-accent)]/20"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />

                  {/* Card */}
                  <div
                    className={`rounded-2xl border overflow-hidden transition-all hover:shadow-lg ${
                      isLatestEntry
                        ? `${theme.card} border-[var(--app-accent)] ring-1 ring-[var(--app-accent)]/20`
                        : `${theme.card} ${theme.border}`
                    }`}
                  >
                    {/* Header */}
                    <div className={`p-5 md:p-6 border-b ${theme.border}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h2
                              className={`text-xl md:text-2xl font-bold ${theme.text}`}
                            >
                              {content.versionLabel} {entry.version}
                            </h2>
                            {isLatestEntry && (
                              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--app-primary-bg)] text-white shadow-md">
                                {content.currentLabel}
                              </span>
                            )}
                          </div>
                          <div
                            className={`flex items-center gap-2 text-sm ${theme.textMuted}`}
                          >
                            <Calendar size={14} />
                            <span>{entry.date}</span>
                          </div>
                        </div>

                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${typeConfig.className}`}
                        >
                          <TypeIcon size={14} />
                          {typeConfig.label}
                        </div>
                      </div>
                    </div>

                    {/* Changes */}
                    <div className="p-5 md:p-6">
                      <div className="space-y-6">
                        {entry.changes.map((changeGroup, idx) => {
                          const catConfig = getCategoryConfig(
                            changeGroup.category,
                          );
                          const CatIcon = catConfig.icon;

                          return (
                            <div key={idx}>
                              <div className="flex items-center gap-2.5 mb-3">
                                <div
                                  className={`p-1.5 rounded-lg ${catConfig.bgColor}`}
                                >
                                  <CatIcon
                                    size={14}
                                    className={catConfig.iconColor}
                                  />
                                </div>
                                <h3
                                  className={`text-sm font-bold uppercase tracking-wider ${catConfig.iconColor}`}
                                >
                                  {getCategoryTitle(changeGroup.category)}
                                </h3>
                              </div>

                              <ul className="space-y-2 ml-2">
                                {changeGroup.items.map((item, itemIdx) => (
                                  <li
                                    key={itemIdx}
                                    className={`flex items-start gap-3 text-sm ${theme.textMuted}`}
                                  >
                                    <span
                                      className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${catConfig.dotColor}`}
                                    />
                                    <span className="leading-relaxed">
                                      {item}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 space-y-4">
          <div
            className={`rounded-2xl border p-6 text-center ${theme.card} ${theme.border}`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <GitBranch size={16} className={theme.accent} />
              <p className={`text-sm ${theme.textMuted}`}>{content.note}</p>
            </div>
          </div>

          <div className="text-center py-4">
            <p className={`text-sm ${theme.textMuted}`}>
              {content.contact.question}{" "}
              <Link
                href="/contact"
                className={`font-bold hover:underline ${theme.accent}`}
              >
                {content.contact.contact}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
