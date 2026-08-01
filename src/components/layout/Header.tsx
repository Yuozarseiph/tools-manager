"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wand2,
  Heart,
  Book,
  Mail,
  FileQuestion,
  LogsIcon,
  Home,
  Download,
  MoreHorizontal,
  X,
} from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import { HeaderContent } from "@/data/layout/header.content";

const desktopNavItems = [
  { href: "/docs", icon: Book, key: "docs" as const },
  { href: "/contact", icon: Mail, key: "contact" as const },
  { href: "/about", icon: FileQuestion, key: "about" as const },
  { href: "/changelog", icon: LogsIcon, key: "changelog" as const },
  { href: "/download", icon: Download, key: "download" as const },
];

// ۳ آیتم ثابت پایین موبایل
const mobileMainTabs = [
  { href: "/", icon: Home, key: "home" as const },
  { href: "/docs", icon: Book, key: "docs" as const },
  { href: "/download", icon: Download, key: "download" as const },
];

// آیتم‌های داخل منوی "بیشتر"
const mobileMoreItems = [
  { href: "/contact", icon: Mail, key: "contact" as const, external: false },
  {
    href: "/about",
    icon: FileQuestion,
    key: "about" as const,
    external: false,
  },
  {
    href: "/changelog",
    icon: LogsIcon,
    key: "changelog" as const,
    external: false,
  },
  {
    href: "https://reymit.ir/yuozarseiph",
    icon: Heart,
    key: "donate" as const,
    external: true,
  },
];

export default function Header() {
  const theme = useThemeColors();
  const pathname = usePathname();
  const { locale, setLocale } = useLanguage();
  const content = HeaderContent[locale];

  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const toggleLocale = () => setLocale(locale === "fa" ? "en" : "fa");

  // بستن منو با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    };

    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [moreOpen]);

  // بستن منو با تغییر مسیر
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // چک کنیم آیا یکی از آیتم‌های "بیشتر" فعاله
  const isMoreActive = mobileMoreItems.some(
    (item) => !item.external && isActiveRoute(item.href),
  );

  const desktopNavLinkClass = (path: string) =>
    `
      text-sm font-semibold
      inline-flex items-center gap-1.5
      px-3.5 py-2
      rounded-full
      border ${theme.border}
      backdrop-blur-xl
      transition-all duration-200
      ${
        pathname === path ? "text-[var(--app-accent)]" : theme.textMuted
      }
      hover:scale-105 active:scale-95
    `;

  return (
    <>
      {/* ═══════════════════════════════════════
          Desktop & Mobile Top Header
      ═══════════════════════════════════════ */}
      <header
        className={`
          sticky top-0 z-50
        `}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 select-none rounded-full"
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

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-3 lg:gap-4">
            {desktopNavItems.map(({ href, icon: Icon, key }) => (
              <Link
                key={href}
                href={href}
                className={desktopNavLinkClass(href)}
              >
                <Icon size={16} />
                {content[key]}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleLocale}
              className={`
                w-9 h-9 sm:w-10 sm:h-10
                rounded-full text-xs font-bold
                border ${theme.border}
                ${theme.text}
                backdrop-blur-sm
                flex items-center justify-center
                hover:opacity-90 transition-opacity
              `}
              title={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
            >
              {locale === "fa" ? "EN" : "فا"}
            </button>

            <div className="inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full">
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
            >
              <Heart size={16} className="text-red-500 fill-red-500" />
              <span className={theme.textMuted}>{content.donate}</span>
            </a>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════
          Mobile Bottom Glass Tab Bar
      ═══════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Overlay when more menu is open */}
        {moreOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMoreOpen(false)}
          />
        )}

        <div
          ref={moreMenuRef}
          className="relative z-50"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {/* ── More Menu Popup ── */}
          <div
            className={`
              absolute bottom-full right-4 mb-2
              min-w-[180px]
              rounded-2xl
              border ${theme.border}
              backdrop-blur-sm backdrop-saturate-150
              shadow-xl shadow-black/10 dark:shadow-black/30
              overflow-hidden
              transition-all duration-250 ease-out origin-bottom-right
              ${
                moreOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 scale-90 translate-y-2 pointer-events-none"
              }
            `}
          >
            <div className="p-2 space-y-0.5">
              {mobileMoreItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = !item.external && isActiveRoute(item.href);
                const isDonate = item.key === "donate";

                const itemContent = (
                  <div
                    className={`
                      flex items-center gap-3
                      px-3 py-2.5
                      rounded-xl
                      text-sm font-medium
                      transition-all duration-150
                      active:scale-[0.97]
                      ${
                        isActive
                          ? "bg-[var(--app-secondary-bg)] text-[var(--app-accent)]"
                          : isDonate
                            ? "text-red-500 hover:bg-red-500/10"
                            : `${theme.text} hover:bg-black/5 dark:hover:bg-white/5`
                      }
                    `}
                    style={{
                      transitionDelay: moreOpen ? `${index * 30}ms` : "0ms",
                    }}
                  >
                    <Icon
                      size={18}
                      strokeWidth={isActive ? 2.5 : 2}
                      className={isDonate ? "fill-red-500/30" : ""}
                    />
                    <span>{content[item.key]}</span>
                    {isActive && (
                      <div className="mr-auto w-1.5 h-1.5 rounded-full bg-[var(--app-accent)]" />
                    )}
                  </div>
                );

                if (item.external) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMoreOpen(false)}
                    >
                      {itemContent}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                  >
                    {itemContent}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* ── Main Tab Bar ── */}
          <div
            className={`
              mx-10 mb-3
              rounded-full
              border ${theme.border}
              backdrop-blur-sm
              shadow-lg shadow-black/5 dark:shadow-black/20
              
            `}
          >
            <div className="flex items-center justify-around px-2 py-1.5">
              {/* ۳ آیتم اصلی */}
              {mobileMainTabs.map(({ href, icon: Icon, key }) => {
                const active = isActiveRoute(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    className={`
                      flex flex-col items-center justify-center
                      gap-0.5
                      min-w-0 flex-1
                      py-1.5 px-1
                      rounded-xl
                      transition-all duration-200
                      active:scale-90
                      ${
                        active
                          ? "text-[var(--app-accent)]"
                          : `text-zinc-500 dark:text-zinc-400`
                      }
                    `}
                  >
                    <div className="relative">
                      <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                      {active && (
                        <div
                          className="
                            absolute -top-0.5 -right-0.5
                            w-1.5 h-1.5 rounded-full
                            bg-[var(--app-accent)]
                            shadow-sm shadow-[var(--app-accent)]/50
                          "
                        />
                      )}
                    </div>
                    <span
                      className={`
                        text-[10px] leading-tight font-semibold
                        truncate max-w-full
                        ${active ? "opacity-100" : "opacity-60"}
                      `}
                    >
                      {content[key]}
                    </span>
                  </Link>
                );
              })}

              {/* دکمه بیشتر */}
              <button
                onClick={() => setMoreOpen((prev) => !prev)}
                className={`
                  flex flex-col items-center justify-center
                  gap-0.5
                  min-w-0 flex-1
                  py-1.5 px-1
                  rounded-xl
                  transition-all duration-200
                  active:scale-90
                  ${
                    moreOpen || isMoreActive
                      ? "text-[var(--app-accent)]"
                      : "text-zinc-500 dark:text-zinc-400"
                  }
                `}
              >
                <div className="relative">
                  {moreOpen ? (
                    <X size={22} strokeWidth={2.5} />
                  ) : (
                    <MoreHorizontal
                      size={22}
                      strokeWidth={isMoreActive ? 2.5 : 1.8}
                    />
                  )}
                  {isMoreActive && !moreOpen && (
                    <div
                      className="
                        absolute -top-0.5 -right-0.5
                        w-1.5 h-1.5 rounded-full
                        bg-[var(--app-accent)]
                        shadow-sm shadow-[var(--app-accent)]/50
                      "
                    />
                  )}
                </div>
                <span
                  className={`
                    text-[10px] leading-tight font-semibold
                    truncate max-w-full
                    ${moreOpen || isMoreActive ? "opacity-100" : "opacity-60"}
                  `}
                >
                  {locale === "fa" ? "بیشتر" : "More"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for mobile bottom nav */}
      <div className="md:hidden h-[72px]" />
    </>
  );
}
