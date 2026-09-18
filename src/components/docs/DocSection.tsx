"use client";

import Link from "next/link";
import {
  ArrowUpLeft,
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  Info,
  ShieldCheck,
} from "lucide-react";

import { ThemePalette } from "@/constants/themes";
import { useLanguage } from "@/context/LanguageContext";
import type { DocSectionItem } from "@/data/docs/docs.content";

import { useDocSectionContent } from "./docSection.content";

interface Props {
  data: DocSectionItem;
  theme: ThemePalette;
  index: number;
}

export default function DocSection({ data, theme }: Props) {
  const content = useDocSectionContent();
  const { locale } = useLanguage();
  const isFa = locale === "fa";

  const categoryLabel = content.categories[data.category] ?? data.category;

  return (
    <article aria-labelledby="doc-title" className="min-w-0">
      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-black ${theme.secondary} ${theme.accent}`}
          >
            {categoryLabel}
          </span>

          <span className={`text-xs font-semibold ${theme.textMuted}`}>
            QodeForge Docs
          </span>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1
              id="doc-title"
              className={`text-3xl font-black leading-tight tracking-[-0.025em] sm:text-4xl ${theme.text}`}
            >
              {data.title}
            </h1>

            <p
              className={`mt-4 max-w-3xl text-base leading-8 sm:text-lg ${theme.textMuted}`}
            >
              {data.description}
            </p>
          </div>

          <Link
            href={`/tools/${data.id}`}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full px-5 text-sm font-black text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.primary}`}
          >
            {content.section.openTool}
            {isFa ? (
              <ArrowUpLeft size={16} aria-hidden="true" />
            ) : (
              <ArrowUpRight size={16} aria-hidden="true" />
            )}
          </Link>
        </div>
      </header>

      <div className="space-y-5">
        {data.features && data.features.length > 0 && (
          <section
            aria-labelledby="features-title"
            className={`rounded-[22px] border p-5 sm:p-6 ${theme.card} ${theme.border}`}
          >
            <div className="mb-5 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
              >
                <CheckCircle2
                  size={18}
                  className={theme.accent}
                  aria-hidden="true"
                />
              </div>

              <h2
                id="features-title"
                className={`text-lg font-black ${theme.text}`}
              >
                {content.section.featuresTitle}
              </h2>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2">
              {data.features.map((feature, index) => (
                <li
                  key={`${feature}-${index}`}
                  className={`flex items-start gap-3 text-sm leading-7 ${theme.textMuted}`}
                >
                  <span
                    className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--app-accent)" }}
                    aria-hidden="true"
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.howItWorks && data.howItWorks.length > 0 && (
          <section
            aria-labelledby="how-it-works-title"
            className={`rounded-[22px] border p-5 sm:p-6 ${theme.card} ${theme.border}`}
          >
            <div className="mb-5 flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
              >
                <Cpu size={18} className={theme.accent} aria-hidden="true" />
              </div>

              <h2
                id="how-it-works-title"
                className={`text-lg font-black ${theme.text}`}
              >
                {content.section.howItWorksTitle}
              </h2>
            </div>

            <ol className="space-y-4">
              {data.howItWorks.map((step, index) => (
                <li key={`${step}-${index}`} className="flex items-start gap-4">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${theme.secondary} ${theme.accent}`}
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <p className={`pt-0.5 text-sm leading-7 ${theme.textMuted}`}>
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {data.technicalNote && (
          <section
            aria-labelledby="technical-note-title"
            className={`
              rounded-[20px] border p-5
              ${theme.note.warningBg}
              ${theme.note.warningBorder}
              ${theme.note.warningText}
            `}
          >
            <div className="flex items-start gap-3">
              <Info size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <h2 id="technical-note-title" className="font-black">
                  {data.technicalNote.title}
                </h2>
                <p className="mt-2 text-sm leading-7 opacity-90">
                  {data.technicalNote.content}
                </p>
              </div>
            </div>
          </section>
        )}

        {data.privacyNote && (
          <section
            aria-labelledby="privacy-note-title"
            className={`
              rounded-[20px] border p-5
              ${theme.note.infoBg}
              ${theme.note.infoBorder}
              ${theme.note.infoText}
            `}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h2 id="privacy-note-title" className="font-black">
                  {content.section.privacyTitle}
                </h2>
                <p className="mt-2 text-sm leading-7 opacity-90">
                  {data.privacyNote}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
