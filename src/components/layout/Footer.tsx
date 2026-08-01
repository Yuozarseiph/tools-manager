"use client";

import Link from "next/link";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import { footerContent } from "@/data/layout/footer.content";

export default function Footer() {
  const theme = useThemeColors();
  const { locale } = useLanguage();

  // 🔥 انتخاب محتوا بر اساس زبان
  const content = footerContent[locale];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="mb-20 lg:mb-5 px-3 sm:px-6" aria-label="Site footer">
      <div
        className={`
          max-w-5xl mx-auto
          rounded-3xl
          border ${theme.border} ${theme.card}
          backdrop-blur-sm
          px-4 sm:px-6 py-5 sm:py-7
          flex flex-col gap-4 sm:gap-3
        `}
        style={{
          // برای این‌که متن فوتر زیر نوبار موبایل نره
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          {/* متن اصلی فوتر */}
          <div className="text-center sm:text-right space-y-1">
            <p className={`text-sm ${theme.textMuted}`}>{content.text}</p>
            <p className="text-xs text-zinc-400">
              {content.year.replace("{year}", currentYear.toString())}{" "}
              {content.madeBy}
            </p>
          </div>

          {/* لینک‌های فوتر */}
          <nav
            className={`
              flex flex-wrap items-center justify-center sm:justify-end gap-2.5
              text-sm font-medium ${theme.textMuted}
            `}
            aria-label="Footer navigation"
          >
            <Link
              href="/docs"
              className={`
                px-3 py-1.5 rounded-full
                border border-transparent hover:border-[var(--app-accent)]/40
                bg-black/0 hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
              `}
            >
              {content.links.docs}
            </Link>
            <Link
              href="/contact"
              className={`
                px-3 py-1.5 rounded-full
                border border-transparent hover:border-[var(--app-accent)]/40
                bg-black/0 hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
              `}
            >
              {content.links.contact}
            </Link>
            <Link
              href="/privacy"
              className={`
                px-3 py-1.5 rounded-full
                border border-transparent hover:border-[var(--app-accent)]/40
                bg-black/0 hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
              `}
            >
              {content.links.privacy}
            </Link>
            <a
              href="https://XenonQode.ir"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                px-3 py-1.5 rounded-full
                border border-transparent hover:border-[var(--app-accent)]/40
                bg-black/0 hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
              `}
            >
              {content.links.team}
            </a>
          </nav>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {content.description}
          </p>
        </div>
      </div>
    </footer>
  );
}
