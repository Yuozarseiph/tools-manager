"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  Globe,
  Lock,
  Monitor,
  Smartphone,
  Terminal,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { downloadContent } from "@/data/pages/download.content";
import { useThemeColors } from "@/hooks/useThemeColors";

type DownloadAction = {
  label: string;
  href?: string;
  disabled?: boolean;
  download?: boolean;
};

type DownloadCardProps = {
  icon: any;
  title: string;
  description: string;
  hint?: string;
  version?: string;
  actions: DownloadAction[];
  theme: any;
  locale: string;
  featured?: boolean;
};

function DownloadCard({
  icon: Icon,
  title,
  description,
  hint,
  version,
  actions,
  theme,
  locale,
  featured = false,
}: DownloadCardProps) {
  return (
    <section
      className={`flex h-full flex-col rounded-[22px] border p-5 sm:p-6 ${featured ? "shadow-sm" : ""
        } ${theme.card} ${theme.border}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] ${theme.secondary}`}
        >
          <Icon size={21} className={theme.accent} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`text-lg font-black ${theme.text}`}>{title}</h2>

            {version && (
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-black ${theme.secondary} ${theme.accent}`}
              >
                {version}
              </span>
            )}
          </div>

          <p className={`mt-2 text-sm leading-7 ${theme.textMuted}`}>
            {description}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <div className="grid gap-2 sm:grid-cols-2">
          {actions.map((action) =>
            action.disabled ? (
              <button
                key={action.label}
                type="button"
                disabled
                className={`flex min-h-12 cursor-not-allowed items-center justify-center gap-2 rounded-[15px] border px-4 text-sm font-black opacity-45 ${theme.border} ${theme.textMuted}`}
              >
                <Lock size={16} aria-hidden="true" />
                {action.label}
              </button>
            ) : action.href === "/" ? (
              <Link
                key={action.label}
                href={action.href}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-[15px] px-4 text-sm font-black text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.primary}`}
              >
                <Globe size={16} aria-hidden="true" />
                {action.label}
              </Link>
            ) : (
              <a
                key={action.label}
                href={action.href}
                download={action.download}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-[15px] px-4 text-sm font-black text-white shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.primary}`}
              >
                <Download size={16} aria-hidden="true" />
                {action.label}
              </a>
            ),
          )}
        </div>

        {hint && (
          <p className={`mt-3 text-xs leading-6 ${theme.textMuted}`}>
            {hint}
          </p>
        )}
      </div>
    </section>
  );
}

export default function DownloadPage() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = downloadContent[locale];
  const isFa = locale === "fa";

  const links = {
    pwa: "/",
    windowsSetup:
      "https://github.com/Yuozarseiph/qodeforge/releases/download/26.3.1/QodeForge-Setup-26.3.1.exe",
    windowsPortable:
      "https://github.com/Yuozarseiph/qodeforge/releases/download/26.3.1/QodeForge-Portable-26.3.1.exe",
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <Link
          href="/"
          className={`inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.textMuted}`}
        >
          {isFa ? (
            <ArrowRight size={16} aria-hidden="true" />
          ) : (
            <ArrowLeft size={16} aria-hidden="true" />
          )}
          {content.back}
        </Link>

        <header className="mb-10 mt-8 max-w-3xl">
          <div
            className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${theme.secondary} ${theme.accent}`}
          >
            <Check size={14} aria-hidden="true" />
            {content.hero.badge}
          </div>

          <h1
            className={`text-3xl font-black tracking-[-0.025em] sm:text-4xl ${theme.text}`}
          >
            {content.hero.title}
          </h1>

          <p className={`mt-4 text-base leading-8 ${theme.textMuted}`}>
            {content.hero.lead}
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          <DownloadCard
            icon={Globe}
            title={content.cards.pwa.title}
            description={content.cards.pwa.desc}
            hint={content.cards.pwa.hint}
            version={content.cards.pwa.version}
            actions={[
              {
                label: content.cards.pwa.cta,
                href: links.pwa,
              },
            ]}
            theme={theme}
            locale={locale}
            featured
          />

          <DownloadCard
            icon={Monitor}
            title={content.cards.windows.title}
            description={content.cards.windows.desc}
            hint={content.cards.windows.hint}
            version={content.cards.windows.version}
            actions={[
              {
                label: content.cards.windows.setupCta,
                href: links.windowsSetup,
              },
              {
                label: content.cards.windows.portableCta,
                href: links.windowsPortable,
              },
            ]}
            theme={theme}
            locale={locale}
            featured
          />

          <DownloadCard
            icon={Smartphone}
            title={content.cards.android.title}
            description={content.cards.android.desc}
            version={content.cards.android.version}
            actions={[
              {
                label: content.cards.android.cta,
                disabled: true,
              },
            ]}
            theme={theme}
            locale={locale}
          />

          <DownloadCard
            icon={Terminal}
            title={content.cards.linux.title}
            description={content.cards.linux.desc}
            version={content.cards.linux.version}
            actions={[
              {
                label: content.cards.linux.cta,
                disabled: true,
              },
            ]}
            theme={theme}
            locale={locale}
          />
        </div>

        <section
          aria-labelledby="download-notes-title"
          className={`mt-8 rounded-[22px] border p-5 sm:p-6 ${theme.card} ${theme.border}`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
            >
              <Lock size={18} className={theme.accent} aria-hidden="true" />
            </div>

            <h2
              id="download-notes-title"
              className={`text-base font-black ${theme.text}`}
            >
              {content.notes.title}
            </h2>
          </div>

          <ul className="mt-5 grid gap-3">
            {Object.values(content.notes.items).map((item) => (
              <li
                key={item}
                className={`flex items-start gap-3 text-sm leading-7 ${theme.textMuted}`}
              >
                <span
                  className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--app-accent)" }}
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

