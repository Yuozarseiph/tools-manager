"use client";

import Link from "next/link";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const theme = useThemeColors();
  const { t, locale } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mb-20 lg:mb-5 px-3 sm:px-6"
      aria-label="Site footer"
    >
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
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))"
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          {/* متن اصلی فوتر */}
          <div className="text-center sm:text-right space-y-1">
            <p className={`text-sm ${theme.textMuted}`}>
              {t("footer.text")}
            </p>
            <p className="text-xs text-zinc-400">
              © {currentYear} ToolsManager.{" "}
              {locale === "fa"
                ? "ساخته‌شده با عشق توسط تیم YUOZARSEIPH."
                : "Built with care by the YUOZARSEIPH team."}
            </p>
          </div>

          {/* لینک‌های فوتر – استایل نزدیک به هدر */}
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
                border border-transparent hover:border-blue-500/40
                bg-black/0 hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
              `}
            >
              {t("footer.links.docs")}
            </Link>
            <Link
              href="/contact"
              className={`
                px-3 py-1.5 rounded-full
                border border-transparent hover:border-blue-500/40
                bg-black/0 hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
              `}
            >
              {t("footer.links.contact")}
            </Link>
            <Link
              href="/privacy"
              className={`
                px-3 py-1.5 rounded-full
                border border-transparent hover:border-blue-500/40
                bg-black/0 hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
              `}
            >
              {t("footer.links.privacy")}
            </Link>
            <a
              href="https://YUOZARSEIPH.TOP"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                px-3 py-1.5 rounded-full
                border border-transparent hover:border-blue-500/40
                bg-black/0 hover:bg-black/5 dark:hover:bg-white/5
                transition-all duration-200
              `}
            >
              {locale === "fa" ? "تیم YUOZARSEIPH" : "YUOZARSEIPH Team"}
            </a>
          </nav>
        </div>

        {/* توضیح پایین فوتر */}
        <div className="text-center sm:text-right">
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            {locale === "fa"
              ? "ToolsManager مجموعه‌ای از ابزارهای تحت وب برای کارهای روزمره توسعه‌دهندگان، تولیدکنندگان محتوا و کاربران عادی است؛ همه‌چیز به‌صورت رایگان و در مرورگر شما."
              : "ToolsManager is a collection of browser-based tools for developers, content creators, and everyday users — fast, free, and privacy‑friendly."}
          </p>
        </div>
      </div>
    </footer>
  );
}
