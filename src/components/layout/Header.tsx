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
  Home,
  Menu,
  X,
  Download,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import { HeaderContent } from "@/data/layout/header.content";

const navItems = [
  { href: "/docs", icon: Book, key: "docs" as const },
  { href: "/contact", icon: Mail, key: "contact" as const },
  { href: "/about", icon: FileQuestionMark, key: "about" as const },
  { href: "/changelog", icon: LogsIcon, key: "changelog" as const },
  { href: "/download", icon: Download, key: "download" as const },
];

export default function Header() {
  const theme = useThemeColors();
  const pathname = usePathname();
  const { locale, setLocale } = useLanguage();

  const content = HeaderContent[locale];

  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLocale = () => setLocale(locale === "fa" ? "en" : "fa");
  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const navLinkClass = (path: string) =>
    `
      text-sm font-semibold
      inline-flex items-center gap-1.5
      px-3.5 py-2
      rounded-full
      border ${theme.border}
      backdrop-blur-xl
      transition-all duration-200
      ${
        pathname === path ? "text-blue-600 dark:text-blue-400" : theme.textMuted
      }
      hover:scale-105 active:scale-95
    `;

  // دکمه‌های دایره‌ای پایین (Home و FAB منو)
  const bottomCircleBase = `
    pointer-events-auto
    w-12 h-12
    rounded-full
    border ${theme.border}
    backdrop-blur-sm
    flex items-center justify-center
    transition-all duration-200
    active:scale-95
  `;

  const docsCircleClass = `
    ${bottomCircleBase}
    ${pathname === "/" ? "text-blue-600 dark:text-blue-400" : theme.text}
  `;

  const menuFabClass = `
    ${bottomCircleBase}
    ${theme.text}
  `;

  const menuItems = [
    { id: "docs", icon: Book, href: "/docs", external: false },
    { id: "contact", icon: Mail, href: "/contact", external: false },
    { id: "about", icon: FileQuestionMark, href: "/about", external: false },
    { id: "changelog", icon: LogsIcon, href: "/changelog", external: false },
    { id: "download", icon: Download, href: "/download", external: false },
    {
      id: "donate",
      icon: Heart,
      href: "https://reymit.ir/yuozarseiph",
      external: true,
    },
  ] as const;

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className={`
              flex items-center gap-2 select-none
              rounded-full`}
          >
            <div
              className={`
                w-8 h-8 sm:w-9 sm:h-9 rounded-full
                flex items-center justify-center
                ${theme.primary}
              `}
            >
              <Wand2 size={18} className="text-white" />
            </div>
            <span
              className={`
                hidden xs:inline text-sm sm:text-base font-black
                ${theme.text}
              `}
            >
              {content.brand.nameMain}
              <span className={theme.accent}>{content.brand.nameAccent}</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-3 lg:gap-4">
            {navItems.map(({ href, icon: Icon, key }) => (
              <Link key={href} href={href} className={navLinkClass(href)}>
                <Icon size={16} />
                {content[key]}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLocale}
              className={`
                w-9 h-9 sm:w-10 sm:h-10
                rounded-full text-xs font-bold
                border ${theme.border}
                ${theme.text}
                flex items-center justify-center
                backdrop-blur-sm
                hover:opacity-90 transition-opacity
              `}
              title={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
            >
              {locale === "fa" ? "EN" : "فا"}
            </button>

            <div
              className={`
                inline-flex items-center justify-center
                w-9 h-9 sm:w-10 sm:h-10
                rounded-full
              `}
            >
              <ThemeSwitcher />
            </div>

            <a
              href="https://reymit.ir/yuozarseiph"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                hidden sm:inline-flex items-center gap-1.5
                rounded-full border ${theme.border}
                backdrop-blur-sm
                px-3 py-2 text-sm font-semibold
                hover:scale-105 active:scale-95
                transition-all duration-200
              `}
              title="حمایت مالی"
            >
              <Heart size={16} className="text-red-500 fill-red-500" />
              <span className={theme.textMuted}>{content.donate}</span>
            </a>
          </div>
        </div>
      </header>
      <nav
        className="
          md:hidden
          fixed bottom-4 left-0 right-0 z-60
          pointer-events-none
        "
      >
        <div
          className="relative max-w-md mx-auto flex items-center justify-between px-6"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          <Link href="/" className={docsCircleClass}>
            <Home size={20} />
          </Link>

          <div className="relative pointer-events-auto">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label="Toggle menu"
              className={menuFabClass}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div
              className={`
                absolute bottom-14 right-1
                flex flex-col items-center gap-2
                transition-all duration-200
                ${
                  menuOpen
                    ? "opacity-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 translate-y-2 pointer-events-none"
                }
              `}
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = !item.external && pathname === item.href;

                const itemClass = `
                  w-11 h-11
                  rounded-full
                  border ${theme.border}
                  backdrop-blur-sm
                  flex items-center justify-center
                  text-xs
                  ${
                    item.id === "donate"
                      ? "text-red-500"
                      : isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : theme.text
                  }
                  active:scale-95
                  transition-colors transition-transform duration-200
                `;

                const style = {
                  transitionDelay: menuOpen ? `${index * 40}ms` : "0ms",
                };

                if (item.external) {
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className={itemClass}
                      style={style}
                    >
                      <Icon
                        size={18}
                        className={
                          item.id === "donate" ? "fill-red-500/70" : ""
                        }
                      />
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={itemClass}
                    style={style}
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
