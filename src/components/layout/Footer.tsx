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
      className={`mt-8 border-t ${theme.border} ${theme.card}`}
      aria-label="Site footer"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-4 sm:gap-3">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="text-center sm:text-right space-y-1">
            <p
              className={`text-sm ${theme.textMuted}`}
            >
              {t("footer.text")}
            </p>
            <p className="text-xs text-zinc-400">
              © {currentYear} ToolsManager.{" "}
              {locale === "fa"
                ? "ساخته‌شده با عشق توسط تیم YUOZARSEIPH."
                : "Built with care by the YUOZARSEIPH team."}
            </p>
          </div>

          <nav
            className={`flex flex-wrap items-center justify-center sm:justify-end gap-3 text-sm font-medium ${theme.textMuted}`}
            aria-label="Footer navigation"
          >
            <Link
              href="/docs"
              className="hover:text-blue-500 transition-colors"
            >
              {t("footer.links.docs")}
            </Link>
            <Link
              href="/contact"
              className="hover:text-blue-500 transition-colors"
            >
              {t("footer.links.contact")}
            </Link>
            <Link
              href="/privacy"
              className="hover:text-blue-500 transition-colors"
            >
              {t("footer.links.privacy")}
            </Link>
            <a
              href="https://YUOZARSEIPH.TOP"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500 transition-colors"
            >
              {locale === "fa"
                ? "تیم YUOZARSEIPH"
                : "YUOZARSEIPH Team"}
            </a>
          </nav>
        </div>

        {/* ردیف پایین: متن ریز سئویی (اختیاری) */}
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
