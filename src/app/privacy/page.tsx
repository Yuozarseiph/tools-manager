"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Cookie,
  Database,
  History,
  Lock,
  Mail,
  ServerOff,
  ShieldCheck,
  UserX,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { privacyContent } from "@/data/pages/privacy.content";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function PrivacyPage() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = privacyContent[locale];
  const isFa = locale === "fa";

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <main className="mx-auto w-full max-w-4xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
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
            className={`mb-5 flex h-11 w-11 items-center justify-center rounded-[15px] ${theme.secondary}`}
          >
            <ShieldCheck
              size={20}
              className={theme.accent}
              aria-hidden="true"
            />
          </div>

          <h1
            className={`text-3xl font-black leading-tight tracking-[-0.025em] sm:text-4xl ${theme.text}`}
          >
            {content.hero.title}
          </h1>

          <p className={`mt-4 text-base leading-8 ${theme.textMuted}`}>
            {content.hero.lead}
          </p>

          <p
            className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${theme.secondary} ${theme.textMuted}`}
          >
            {content.hero.lastUpdated}
          </p>
        </header>

        <div className="space-y-6">
          <section
            aria-labelledby="privacy-main-principle"
            className={`rounded-[22px] border p-5 sm:p-6 ${theme.card} ${theme.border}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
              >
                <ServerOff
                  size={18}
                  className={theme.accent}
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0">
                <h2
                  id="privacy-main-principle"
                  className={`text-xl font-black ${theme.text}`}
                >
                  {content.principle1.title}
                </h2>

                <p
                  className={`mt-3 text-sm leading-7 sm:text-base ${theme.textMuted}`}
                >
                  {content.principle1.intro}
                </p>
              </div>
            </div>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              <CheckItem
                text={content.principle1.points.noUpload}
                theme={theme}
              />
              <CheckItem
                text={content.principle1.points.noLeaveDevice}
                theme={theme}
              />
              <CheckItem
                text={content.principle1.points.allInBrowser}
                theme={theme}
              />
              <CheckItem
                text={content.principle1.points.onlyCpuRam}
                theme={theme}
              />
            </ul>
          </section>

          <section
            aria-labelledby="privacy-data-title"
            className={`rounded-[22px] border p-5 sm:p-6 ${theme.card} ${theme.border}`}
          >
            <h2
              id="privacy-data-title"
              className={`text-xl font-black ${theme.text}`}
            >
              {isFa ? "اطلاعاتی که جمع‌آوری نمی‌کنیم" : "Data we do not collect"}
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <InfoBlock
                icon={Database}
                title={content.noData.files.title}
                theme={theme}
              >
                <p>{content.noData.files.body}</p>
              </InfoBlock>

              <InfoBlock
                icon={UserX}
                title={content.noData.account.title}
                theme={theme}
              >
                <p>{content.noData.account.intro}</p>

                <ul className="mt-3 space-y-2">
                  <li>{content.noData.account.bullets.noSignup}</li>
                  <li>{content.noData.account.bullets.noEmail}</li>
                  <li>{content.noData.account.bullets.noPassword}</li>
                </ul>

                <p className={`mt-4 font-black ${theme.accent}`}>
                  {content.noData.account.anonymous}
                </p>
              </InfoBlock>
            </div>
          </section>

          <section
            aria-labelledby="privacy-storage-title"
            className={`rounded-[22px] border p-5 sm:p-6 ${theme.card} ${theme.border}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
              >
                <Cookie
                  size={18}
                  className={theme.accent}
                  aria-hidden="true"
                />
              </div>

              <h2
                id="privacy-storage-title"
                className={`text-xl font-black ${theme.text}`}
              >
                {content.cookies.title}
              </h2>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <h3 className={`text-base font-black ${theme.text}`}>
                  {content.cookies.noTrackingTitle}
                </h3>
                <p className={`mt-2 text-sm leading-7 ${theme.textMuted}`}>
                  {content.cookies.noTrackingBody}
                </p>
              </div>

              <div className={`border-t pt-6 ${theme.border}`}>
                <h3 className={`text-base font-black ${theme.text}`}>
                  {content.cookies.localTitle}
                </h3>

                <p className={`mt-2 text-sm leading-7 ${theme.textMuted}`}>
                  {content.cookies.localIntro}
                </p>

                <div
                  className={`mt-4 flex items-start gap-3 rounded-[18px] p-4 ${theme.secondary}`}
                >
                  <History
                    size={18}
                    className={`mt-0.5 shrink-0 ${theme.accent}`}
                    aria-hidden="true"
                  />

                  <div>
                    <h4 className={`text-sm font-black ${theme.text}`}>
                      {content.cookies.themeTitle}
                    </h4>
                    <p
                      className={`mt-1.5 text-xs leading-6 ${theme.textMuted}`}
                    >
                      {content.cookies.themeBody}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="privacy-security-title"
            className={`rounded-[22px] border p-5 sm:p-6 ${theme.card} ${theme.border}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
              >
                <Lock
                  size={18}
                  className={theme.accent}
                  aria-hidden="true"
                />
              </div>

              <h2
                id="privacy-security-title"
                className={`text-xl font-black ${theme.text}`}
              >
                {content.security.title}
              </h2>
            </div>

            <p className={`mt-5 text-sm leading-7 ${theme.textMuted}`}>
              {content.security.intro}
            </p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              <SecurityItem
                text={content.security.stats.db}
                theme={theme}
              />
              <SecurityItem
                text={content.security.stats.info}
                theme={theme}
              />
              <SecurityItem
                text={content.security.stats.sale}
                theme={theme}
              />
            </ul>

            <p
              className={`mt-6 border-t pt-5 text-sm font-black leading-7 ${theme.border} ${theme.accent}`}
            >
              {content.security.quote}
            </p>
          </section>

          <section
            aria-labelledby="privacy-updates-title"
            className={`border-t pt-8 ${theme.border}`}
          >
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h2
                  id="privacy-updates-title"
                  className={`text-base font-black ${theme.text}`}
                >
                  {content.footer.changesTitle}
                </h2>

                <p className={`mt-2 text-sm leading-7 ${theme.textMuted}`}>
                  {content.footer.changesBody}
                </p>
              </div>

              <div>
                <h2 className={`text-base font-black ${theme.text}`}>
                  {content.footer.contactTitle}
                </h2>

                <p className={`mt-2 text-sm leading-7 ${theme.textMuted}`}>
                  {content.footer.contactBody}
                </p>

                <Link
                  href="/contact"
                  className={`mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-black text-white shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.primary}`}
                >
                  <Mail size={16} aria-hidden="true" />
                  {content.footer.contactButton}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function CheckItem({
  text,
  theme,
}: {
  text: string;
  theme: any;
}) {
  return (
    <li className="flex items-start gap-3">
      <CheckCircle2
        size={17}
        className={`mt-1 shrink-0 ${theme.accent}`}
        aria-hidden="true"
      />
      <span className={`text-sm leading-6 ${theme.text}`}>
        {text}
      </span>
    </li>
  );
}

function InfoBlock({
  icon: Icon,
  title,
  children,
  theme,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
  theme: any;
}) {
  return (
    <div>
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] ${theme.secondary}`}
        >
          <Icon
            size={16}
            className={theme.accent}
            aria-hidden="true"
          />
        </div>

        <h3 className={`text-base font-black ${theme.text}`}>
          {title}
        </h3>
      </div>

      <div className={`mt-3 text-sm leading-7 ${theme.textMuted}`}>
        {children}
      </div>
    </div>
  );
}

function SecurityItem({
  text,
  theme,
}: {
  text: string;
  theme: any;
}) {
  return (
    <li
      className={`flex min-h-12 items-center gap-2 rounded-[15px] px-3.5 ${theme.secondary}`}
    >
      <CheckCircle2
        size={16}
        className={`shrink-0 ${theme.accent}`}
        aria-hidden="true"
      />
      <span className={`text-xs font-bold leading-5 ${theme.text}`}>
        {text}
      </span>
    </li>
  );
}
