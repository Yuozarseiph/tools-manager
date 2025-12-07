"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wand2,
  Heart,
  Book,
  Mail,
  FileQuestionMark,
  LogsIcon,
  Menu,
  X
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";

const navItems = [
  { href: "/docs", icon: Book, key: "nav.docs" },
  { href: "/contact", icon: Mail, key: "nav.contact" },
  { href: "/about", icon: FileQuestionMark, key: "nav.about" },
  { href: "/changelog", icon: LogsIcon, key: "nav.changelog" }
];

export default function Header() {
  const theme = useThemeColors();
  const pathname = usePathname();
  const { t, locale, setLocale } = useLanguage();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileVisible, setMobileVisible] = useState(false);

  const navLinkClass = (path: string) =>
    `text-sm font-bold  trans rounded-full border ${theme.border} bg-transparent backdrop-blur-md px-4 py-2 transition-all duration-250 flex items-center gap-1.5 ${
      pathname === path
        ? "text-blue-600 dark:text-blue-400"
        : theme.textMuted
    } hover:text-blue-500 hover:scale-105`;

  const toggleLocale = () =>
    setLocale(locale === "fa" ? "en" : "fa");

  const openMobile = () => {
    setMobileVisible(true);
    requestAnimationFrame(() => setMobileOpen(true));
  };

  const closeMobile = () => {
    setMobileOpen(false);
    setTimeout(() => setMobileVisible(false), 220);
  };

  return (
    <>
      <header className="sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className={`
                flex items-center gap-2 select-none
                rounded-full border ${theme.border} bg-transparent backdrop-blur-md
                px-2.5 py-1.5
              `}
            >
              <div
                className={`
                  w-8 h-8 sm:w-9 sm:h-9 rounded-xl
                  flex items-center justify-center
                  ${theme.primary}
                `}
              >
                <Wand2 size={18} className="text-white" />
              </div>
              <span
                className={`hidden xs:inline text-sm sm:text-base font-black ${theme.text}`}
              >
                Tools<span className={theme.accent}>Manager</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              {navItems.map(({ href, icon: Icon, key }) => (
                <Link key={href} href={href} className={navLinkClass(href)}>
                  <Icon size={16} />
                  {t(key)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLocale}
              className={`
                px-2.5 py-1.5 rounded-full text-xs font-bold
                border ${theme.border} bg-transparent backdrop-blur-md ${theme.text}
                hover:opacity-90 transition-opacity
              `}
              title={
                locale === "fa"
                  ? "Switch to English"
                  : "تغییر به فارسی"
              }
            >
              {locale === "fa" ? "EN" : "فا"}
            </button>

            <div className="inline-flex items-center justify-center">
              <ThemeSwitcher />
            </div>

            <a
              href="https://reymit.ir/yuozarseiph"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                hidden sm:inline-flex items-center gap-1.5
                rounded-full border ${theme.border}
                backdrop-blur-md
                px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity
              `}
              title="حمایت مالی"
            >
              <Heart
                size={16}
                className="text-red-500 fill-red-500"
              />
              <span className={theme.textMuted}>
                {t("nav.donate")}
              </span>
            </a>

            <a
              href="https://reymit.ir/yuozarseiph"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                sm:hidden inline-flex items-center justify-center
                w-9 h-9 rounded-full border ${theme.border}
                bg-transparent backdrop-blur-md
              `}
              title="حمایت مالی"
            >
              <Heart
                size={18}
                className="text-red-500 fill-red-500"
              />
            </a>

            <button
              className={`
                md:hidden w-9 h-9 flex items-center justify-center
                rounded-full border ${theme.border} bg-transparent backdrop-blur-md
                
                ${theme.textMuted} hover:opacity-80 transition-opacity
              `}
              onClick={() =>
                mobileOpen ? closeMobile() : openMobile()
              }
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {mobileVisible && (
        <div
          className={`
            fixed inset-0 z-50 md:hidden flex items-center justify-center
            bg-black/40 backdrop-blur-xl
            transition-opacity duration-200
            ${mobileOpen ? "opacity-100" : "opacity-0"}
          `}
          onClick={closeMobile}
        >
          <div
            className={`
              w-full max-w-xs mx-auto px-4
              transition-transform duration-200
              ${mobileOpen ? "translate-y-0 scale-100" : "translate-y-3 scale-95"}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-3 items-stretch">
              <div className="flex items-center justify-center gap-2 mb-1">
                <button
                  onClick={toggleLocale}
                  className={`
                    px-4 py-2 rounded-full text-xs font-bold
                    border ${theme.border} ${theme.card} ${theme.text}
                    shadow-md shadow-black/10 backdrop-blur-md
                    hover:opacity-90 transition-opacity
                  `}
                >
                  {locale === "fa"
                    ? "Switch to English"
                    : "تغییر به فارسی"}
                </button>
                <div
                  className={`
                    px-3 py-2 z-100 rounded-full border ${theme.border} ${theme.card}
                    shadow-md shadow-black/10 backdrop-blur-md
                  `}
                >
                  <ThemeSwitcher />
                </div>
              </div>

              {navItems.map(({ href, icon: Icon, key }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center justify-between
                    rounded-2xl px-4 py-3
                    border ${theme.border} ${theme.card}
                    shadow-xl shadow-black/20 backdrop-blur-md
                    text-sm font-medium ${theme.text}
                    active:scale-[0.97] transition-all
                  `}
                  onClick={closeMobile}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={18} className={theme.textMuted} />
                    {t(key)}
                  </span>
                  {pathname === href && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  )}
                </Link>
              ))}

              <button
                type="button"
                onClick={() => {
                  window.open("https://reymit.ir/yuozarseiph", "_blank");
                  closeMobile();
                }}
                className={`
                  mt-1 flex items-center justify-center gap-2
                  rounded-2xl px-4 py-3
                  text-sm font-semibold
                  ${theme.primary}
                  shadow-xl shadow-blue-500/30
                  active:scale-[0.97] transition-transform
                `}
              >
                <Heart size={18} className="fill-white" />
                {t("nav.donate")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
