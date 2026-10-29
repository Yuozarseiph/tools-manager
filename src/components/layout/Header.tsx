"use client";

import { useState, useRef, useEffect } from "react";
import Link from "@/components/LocalizedLink";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/localized-path";
import {
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
  const pathname = stripLocale(usePathname());
  const { locale, setLocale } = useLanguage();
  const content = HeaderContent[locale];

  const [moreOpen, setMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!moreOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMoreOpen(false);
        moreButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [moreOpen]);

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
      min-h-11 px-3 py-2
      rounded-full
      border border-transparent
      backdrop-blur-xl
      transition-all duration-200
      ${
        pathname === path ? `${theme.accent} ${theme.secondary}` : theme.textMuted
      }
      hover:opacity-90
    `;

  return (
    <>
      {/* ═══════════════════════════════════════
          Desktop & Mobile Top Header
      ═══════════════════════════════════════ */}
      <header
        className={`
          site-header sticky top-0 z-50
        `}
      >
        <div className="mx-auto px-3 sm:px-5 h-16 sm:h-[68px] flex items-center justify-between gap-3">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 select-none rounded-full"
          >
            <Image
              src="/icons/qodeforge.png"
              alt=""
              width={44}
              height={44}
              className="brand-logo h-11 w-11 rounded-lg p-1 object-contain"
              priority
            />
            <span
              className={`text-sm font-bold ${theme.text}`}
            >
              {content.brand.nameMain}
              <span className={theme.accent}>{content.brand.nameAccent}</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav aria-label={locale === "fa" ? "ناوبری اصلی" : "Main navigation"} className="hidden lg:flex items-center gap-1">
            {desktopNavItems.map(({ href, icon: Icon, key }) => (
              <Link
                key={href}
                href={href}
                className={desktopNavLinkClass(href)}
                aria-current={isActiveRoute(href) ? "page" : undefined}
              >
                <Icon size={16} aria-hidden="true" />
                {content[key]}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button aria-label={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
              onClick={toggleLocale}
              className={`
                header-action ui-control
                rounded-full text-xs font-bold
                border
                ${theme.text}
                backdrop-blur-sm
                flex items-center justify-center
                hover:opacity-90 transition-opacity
              `}
              title={locale === "fa" ? "Switch to English" : "تغییر به فارسی"}
            >
              {locale === "fa" ? "EN" : "فا"}
            </button>

            <ThemeSwitcher buttonClassName="header-action" />

            <a
              href="https://reymit.ir/yuozarseiph"
              target="_blank"
              rel="noopener noreferrer"
              className={`
                ui-control hidden sm:inline-flex min-h-11 items-center justify-center gap-1.5
                rounded-lg border
                backdrop-blur-sm
                px-3 text-sm font-semibold
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
      <div role="navigation" aria-label={locale === "fa" ? "ناوبری موبایل" : "Mobile navigation"} className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
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
            id="mobile-more-menu"
            hidden={!moreOpen}
            className={`
              absolute bottom-full end-4 mb-2
              min-w-[180px] max-w-[calc(100vw-2rem)] bg-[var(--app-menu)]
              rounded-2xl
              border ${theme.border}
              backdrop-blur-sm backdrop-saturate-150
              shadow-xl shadow-black/10 dark:shadow-black/30
              overflow-hidden
              transition-all duration-180 ease-[cubic-bezier(.2,.7,.2,1)] origin-bottom-right
              ${
                moreOpen
                  ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                  : "opacity-0 translate-y-1 pointer-events-none"
              }
            `}
          >
            <div className="p-2 space-y-0.5">
              {mobileMoreItems.map((item) => {
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
                            ? "text-[var(--app-error-text)] hover:bg-[var(--app-error-bg)]"
                            : `${theme.text} hover:bg-black/5 dark:hover:bg-white/5`
                      }
                    `}
                    style={{
                      transitionDelay: "0ms",
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
              mobile-tab-bar mx-3 mb-3
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
                    aria-current={active ? "page" : undefined}
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
                          : theme.textMuted
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
                        text-xs leading-tight font-semibold
                        truncate max-w-full
                      `}
                    >
                      {content[key]}
                    </span>
                  </Link>
                );
              })}

              {/* دکمه بیشتر */}
              <button
                ref={moreButtonRef}
                type="button"
                aria-expanded={moreOpen}
                aria-controls="mobile-more-menu"
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
                      : theme.textMuted
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
                    text-xs leading-tight font-semibold
                    truncate max-w-full
                  `}
                >
                  {locale === "fa" ? "بیشتر" : "More"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
