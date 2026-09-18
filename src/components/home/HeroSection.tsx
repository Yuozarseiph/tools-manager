"use client";

import { ArrowDown, ShieldCheck } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { homeContent } from "@/data/home.content";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function HeroSection() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = homeContent[locale];

  const scrollToTools = () => {
    document
      .getElementById("tools-workspace")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="py-12 text-center sm:py-16 lg:py-20">
      <div className="mx-auto max-w-3xl">
        <h1
          className={`text-4xl font-black leading-[1.12] tracking-[-0.035em] sm:text-5xl lg:text-6xl ${theme.text}`}
        >
          {content.hero.titleLine1}
          <span className={`mt-2 block ${theme.accent}`}>
            {content.hero.titleHighlight}
          </span>
        </h1>

        <p
          className={`mx-auto mt-6 max-w-2xl text-base leading-8 sm:text-lg ${theme.textMuted}`}
        >
          {content.hero.subtitle}
        </p>

        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={scrollToTools}
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-black text-white shadow-sm transition-all hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] motion-reduce:transition-none ${theme.primary}`}
          >
            {content.hero.primaryAction}
            <ArrowDown size={17} aria-hidden="true" />
          </button>
        </div>

        <div
          className={`mx-auto mt-5 flex max-w-xl items-center justify-center gap-2 text-xs leading-6 ${theme.textMuted}`}
        >
          <ShieldCheck size={15} className={theme.accent} aria-hidden="true" />
          <span>{content.hero.privacyNote}</span>
        </div>
      </div>
    </section>
  );
}
