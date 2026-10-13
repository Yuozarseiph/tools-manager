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
      ?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  };

  return (
    <section className={`relative -mt-[4.5rem] flex w-full items-center justify-center overflow-hidden border-0 px-5 pb-14 pt-28 text-center shadow-sm sm:px-10 sm:pb-20 lg:pb-24 ${theme.card}`}>
      <div className="pointer-events-none absolute inset-x-1/4 top-0 h-32 rounded-full opacity-20 blur-3xl" style={{ background: "var(--app-accent)" }} />
      <div className="relative mx-auto max-w-3xl">
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
