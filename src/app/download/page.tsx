"use client";

import Link from "next/link";
import {
  ArrowRight,
  Download,
  Monitor,
  Globe,
  Smartphone,
  Terminal,
  BadgeCheck,
  Lock,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import { downloadContent } from "@/data/pages/download.content";

type CardProps = {
  icon: any;
  title: string;
  desc: string;
  hint?: string;
  actions: Array<{
    label: string;
    href?: string;
    disabled?: boolean;
  }>;
  theme: any;
};

function DownloadCard({
  icon: Icon,
  title,
  desc,
  hint,
  actions,
  theme,
}: CardProps) {
  return (
    <div
      className={`p-8 rounded-3xl border shadow-xl ${theme.card} ${theme.border}`}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-xl ${theme.secondary}`}>
          <Icon size={26} className={theme.accent} />
        </div>
        <h2 className={`text-xl font-black ${theme.text}`}>{title}</h2>
      </div>

      <p className={`text-sm leading-relaxed mb-5 ${theme.textMuted}`}>
        {desc}
      </p>

      <div className="flex flex-col md:flex-row gap-3">
        {actions.map((a, idx) =>
          a.disabled ? (
            <button
              key={idx}
              disabled
              className="w-full py-3 rounded-xl font-bold border opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Lock size={16} />
              {a.label}
            </button>
          ) : (
            <a
              key={idx}
              href={a.href}
              className={`w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-2 ${theme.primary}`}
            >
              <Download size={16} />
              {a.label}
            </a>
          )
        )}
      </div>

      {hint && (
        <div className={`mt-4 text-xs opacity-70 ${theme.textMuted}`}>
          {hint}
        </div>
      )}
    </div>
  );
}

export default function DownloadPage() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = downloadContent[locale];
  const links = {
    pwa: "/",
    windowsSetup:
      "https://github.com/Yuozarseiph/tools-manager/releases/download/Beta3.0.0/ToolsManager.Setup.3.0.0-beta.0.exe",
    windowsPortable:
      "https://github.com/Yuozarseiph/tools-manager/releases/download/Beta3.0.0/ToolsManager.3.0.0-beta.0-Portable.exe",
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme.bg}`}>
      <div className="max-w-6xl mx-auto px-6 pt-10 w-full pb-20">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-8 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> {content.back}
        </Link>

        {/* Hero */}
        <div
          className={`rounded-3xl border p-8 md:p-12 mb-10 relative overflow-hidden ${theme.card} ${theme.border}`}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl ${theme.secondary}`}>
                <BadgeCheck size={28} className={theme.accent} />
              </div>
              <h1 className={`text-3xl md:text-4xl font-black ${theme.text}`}>
                {content.hero.title}
              </h1>
            </div>

            <p className={`text-base md:text-lg max-w-2xl ${theme.textMuted}`}>
              {content.hero.lead}
              <span className="block mt-2 text-sm opacity-70">
                {content.hero.badge}
              </span>
            </p>
          </div>

          <div
            className={`absolute -top-20 -left-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`}
          />
          <div
            className={`absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 ${theme.gradient} bg-gradient-to-br`}
          />
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          <DownloadCard
            icon={Globe}
            title={content.cards.pwa.title}
            desc={content.cards.pwa.desc}
            hint={content.cards.pwa.hint}
            actions={[{ label: content.cards.pwa.cta, href: links.pwa }]}
            theme={theme}
          />

          <DownloadCard
            icon={Monitor}
            title={content.cards.windows.title}
            desc={content.cards.windows.desc}
            hint={content.cards.windows.hint}
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
          />

          <DownloadCard
            icon={Smartphone}
            title={content.cards.android.title}
            desc={content.cards.android.desc}
            actions={[{ label: content.cards.android.cta, disabled: true }]}
            theme={theme}
          />

          <DownloadCard
            icon={Terminal}
            title={content.cards.linux.title}
            desc={content.cards.linux.desc}
            actions={[{ label: content.cards.linux.cta, disabled: true }]}
            theme={theme}
          />
        </div>

        {/* Notes */}
        <div
          className={`mt-10 p-6 rounded-2xl border ${theme.border} bg-gray-50/50 dark:bg-white/5`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${theme.secondary}`}>
              <Lock size={18} className={theme.accent} />
            </div>
            <h3 className={`font-bold text-lg ${theme.text}`}>
              {content.notes.title}
            </h3>
          </div>

          <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
            <li className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{content.notes.items.verify}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{content.notes.items.beta}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
              <span>{content.notes.items.pwa}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
