"use client";

import Link from "next/link";
import {
  ArrowUpLeft,
  ArrowUpRight,
  BookOpen,
  ExternalLink,
  Fingerprint,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { footerContent } from "@/data/layout/footer.content";

export default function Footer() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = footerContent[locale];
  const currentYear = new Date().getFullYear();
  const isFa = locale === "fa";

  const quickLinks = [
    { href: "/docs", label: content.links.docs, icon: BookOpen },
    { href: "/contact", label: content.links.contact, icon: Mail },
    { href: "/privacy", label: content.links.privacy, icon: ShieldCheck },
  ];

  return (
    <footer
      className={`relative mt-20 w-full overflow-hidden border-t ${theme.card} ${theme.border}`}
      aria-label="Site footer"
    >
      {/* Full-width tonal background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -start-24 top-8 h-72 w-72 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: "var(--app-accent)" }}
        />
        <div
          className="absolute -end-24 bottom-0 h-80 w-80 rounded-full opacity-[0.05] blur-3xl"
          style={{ background: "var(--app-secondary-color)" }}
        />
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--app-accent), var(--app-secondary-color), transparent)",
          }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-5 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_0.65fr] lg:gap-16">
          {/* Brand / message */}
          <div>
            <div className="flex items-center gap-4">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] shadow-sm ${theme.primary}`}
              >
                <Sparkles size={25} className="text-white" />
              </div>

              <div>
                <div className={`text-2xl font-black tracking-tight ${theme.text}`}>
                  QodeForge
                </div>
                <div className={`mt-1 text-xs font-bold ${theme.textMuted}`}>
                  by XenonQode
                </div>
              </div>
            </div>

            <p
              className={`mt-7 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 ${theme.textMuted}`}
            >
              {content.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-xs font-black ${theme.secondary} ${theme.accent}`}
              >
                QodeForge.ir
              </span>

              <span
                className={`inline-flex min-h-9 items-center rounded-full border px-3.5 text-xs font-bold ${theme.border} ${theme.textMuted}`}
              >
                {content.text}
              </span>
            </div>

            <div
              className={`mt-9 max-w-2xl rounded-[22px] border p-5 sm:p-6 ${theme.border}`}
              style={{
                background:
                  "color-mix(in srgb, var(--app-accent) 5%, transparent)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
                >
                  <Fingerprint size={19} className={theme.accent} />
                </div>

                <div>
                  <div className={`text-sm font-black ${theme.text}`}>
                    {isFa ? "یک محصول از XenonQode" : "A XenonQode product"}
                  </div>
                  <p className={`mt-1.5 text-xs leading-6 ${theme.textMuted}`}>
                    {isFa
                      ? "QodeForge با تمرکز روی ابزارهای سریع، ساده و پردازش محلی در مرورگر توسعه داده می‌شود."
                      : "QodeForge is built around fast, focused tools with privacy-friendly local browser processing."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div
              className={`mb-5 text-xs font-black uppercase tracking-[0.18em] ${theme.textMuted}`}
            >
              {isFa ? "دسترسی سریع" : "Quick access"}
            </div>

            <nav className="grid gap-2.5" aria-label="Footer navigation">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`group flex min-h-14 items-center gap-3 rounded-[18px] border px-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${theme.border} ${theme.card} ${theme.text}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
                  >
                    <Icon size={18} className={theme.accent} />
                  </span>

                  <span className="flex-1 text-sm font-black">{label}</span>

                  {isFa ? (
                    <ArrowUpLeft
                      size={17}
                      className={`opacity-40 transition-all duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 ${theme.accent}`}
                    />
                  ) : (
                    <ArrowUpRight
                      size={17}
                      className={`opacity-40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 ${theme.accent}`}
                    />
                  )}
                </Link>
              ))}

              <a
                href="https://XenonQode.ir"
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex min-h-14 items-center gap-3 rounded-[18px] border px-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${theme.border} ${theme.card} ${theme.text}`}
              >
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
                >
                  <ExternalLink size={18} className={theme.accent} />
                </span>

                <span className="flex-1 text-sm font-black">
                  {content.links.team}
                </span>

                <ExternalLink
                  size={16}
                  className={`opacity-40 transition-opacity group-hover:opacity-100 ${theme.accent}`}
                />
              </a>
            </nav>
          </div>
        </div>
      </div>

      {/* Full-width bottom legal bar */}
      <div className={`relative border-t ${theme.border}`}>
        <div
          className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-5 py-5 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
          style={{
            paddingBottom:
              "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <p className={theme.textMuted}>
            {content.year.replace("{year}", currentYear.toString())}
          </p>

          <p className={`font-semibold ${theme.textMuted}`}>
            {content.madeBy}
          </p>
        </div>
      </div>

      {/* Extra clearance for mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </footer>
  );
}
