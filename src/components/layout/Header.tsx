"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wand2,
  Heart,
  Book,
  Mail,
  FileQuestionMark,
  LogsIcon,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext"; // ← جدید

export default function Header() {
  const theme = useThemeColors();
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage(); // ← جدید

  const navLinkClass = (path: string) =>
    `text-sm font-bold transition-all hover:text-blue-500 ${
      pathname === path ? "text-blue-600 dark:text-blue-400" : theme.textMuted
    }`;

  return (
    <header
      className={`border-b backdrop-blur-md sticky top-0 z-50 transition-colors duration-500 ${theme.border} ${theme.card}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-black text-lg sm:text-xl tracking-tighter select-none"
          >
            <div
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform hover:scale-105 ${theme.primary}`}
            >
              <Wand2 size={18} className="text-white" />
            </div>
            <span className={`hidden xs:inline ${theme.text}`}>
              Tools<span className={theme.accent}>Manager</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/docs" className={navLinkClass("/docs")}>
              <span className="flex items-center gap-1.5">
                <Book size={16} /> {t("nav.docs")}
              </span>
            </Link>
            <Link href="/contact" className={navLinkClass("/contact")}>
              <span className="flex items-center gap-1.5">
                <Mail size={16} /> {t("nav.contact")}
              </span>
            </Link>
            <Link href="/about" className={navLinkClass("/about")}>
              <span className="flex items-center gap-1.5">
                <FileQuestionMark size={16} /> {t("nav.about")}
              </span>
            </Link>
            <Link href="/changelog" className={navLinkClass("/changelog")}>
              <span className="flex items-center gap-1.5">
                <LogsIcon size={16} /> {t("nav.changelog")}
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex md:hidden items-center">
            <Link
              href="/docs"
              className={`p-2 rounded-lg ${theme.textMuted} hover:bg-zinc-100 dark:hover:bg-zinc-800`}
            >
              <Book size={20} />
            </Link>
            <Link
              href="/contact"
              className={`p-2 rounded-lg ${theme.textMuted} hover:bg-zinc-100 dark:hover:bg-zinc-800`}
            >
              <Mail size={20} />
            </Link>
            <Link
              href="/about"
              className={`p-2 rounded-lg ${theme.textMuted} hover:bg-zinc-100 dark:hover:bg-zinc-800`}
            >
              <FileQuestionMark size={20} />
            </Link>
            <Link
              href="/changelog"
              className={`p-2 rounded-lg ${theme.textMuted} hover:bg-zinc-100 dark:hover:bg-zinc-800`}
            >
              <LogsIcon size={16} />
            </Link>
          </div>

          <div className={`w-px h-6 mx-1 ${theme.border}`} />
          <button
            onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
            className="px-3 py-2 rounded-lg text-xs font-bold border border-slate-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
          >
            {locale === "fa" ? "EN" : "فا"}
          </button>

          <ThemeSwitcher />

          <a
            href="https://reymit.ir/yuozarseiph"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-xl border transition-all
              ${theme.border} hover:border-red-500/30 hover:bg-red-50 dark:hover:bg-red-900/10 group`}
            title="حمایت مالی"
          >
            <Heart
              size={20}
              className="text-red-500 fill-red-500 group-hover:animate-pulse"
            />
            <span
              className={`hidden sm:inline text-sm font-bold ${theme.textMuted}`}
            >
              {t("nav.donate")}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
