"use client";

import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Database,
  UserX,
  ServerOff,
  Cookie,
  Lock,
  History,
  Mail,
  CheckCircle2,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import { privacyContent } from "@/data/pages/privacy.content";

export default function PrivacyPage() {
  const theme = useThemeColors();
  const { locale } = useLanguage();

  // 🔥 انتخاب محتوا بر اساس زبان
  const content = privacyContent[locale];

  return (
    <div
      className={`min-h-screen flex flex-col ${theme.bg} transition-colors duration-500`}
    >
      <div className="max-w-4xl mx-auto px-6 pt-10 w-full pb-20">
        {/* دکمه بازگشت */}
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-12 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" /> {content.back}
        </Link>

        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* هدر اصلی */}
          <div className="text-center mb-16">
            <div
              className={`w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-full border-4 shadow-xl ${theme.border} ${theme.secondary}`}
            >
              <ShieldCheck size={48} className={theme.accent} />
            </div>
            <h1
              className={`text-3xl md:text-5xl font-black mb-6 tracking-tight ${theme.text}`}
            >
              {content.hero.title}
            </h1>
            <p
              className={`text-lg leading-relaxed max-w-3xl mx-auto ${theme.textMuted}`}
            >
              {content.hero.lead}
            </p>
            <div
              className={`inline-block mt-6 px-4 py-1.5 rounded-full text-xs font-bold border ${theme.border} ${theme.secondary} ${theme.textMuted}`}
            >
              {content.hero.lastUpdated}
            </div>
          </div>

          {/* اصل شماره یک */}
          <div
            className={`relative overflow-hidden p-8 md:p-10 rounded-3xl border-2 ${theme.border} ${theme.card} group transition-all duration-500`}
          >
            <div
              className={`absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-5 blur-3xl ${theme.primary}`}
            />
            <h2
              className={`text-2xl font-bold mb-6 flex items-center gap-3 relative z-10 ${theme.text}`}
            >
              <div className={`p-2 rounded-lg ${theme.secondary}`}>
                <ServerOff size={24} className={theme.accent} />
              </div>
              {content.principle1.title}
            </h2>

            <p
              className={`text-lg leading-loose mb-8 relative z-10 ${theme.textMuted}`}
            >
              {content.principle1.intro}
            </p>

            <div className="grid md:grid-cols-2 gap-4 relative z-10">
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
            </div>
          </div>

          {/* چه چیز جمع‌آوری نمی‌شود */}
          <div className="grid md:grid-cols-2 gap-6">
            <PrivacyCard
              icon={Database}
              title={content.noData.files.title}
              theme={theme}
            >
              {content.noData.files.body}
            </PrivacyCard>

            <PrivacyCard
              icon={UserX}
              title={content.noData.account.title}
              theme={theme}
            >
              <div className="space-y-3">
                <p className={theme.textMuted}>
                  {content.noData.account.intro}
                </p>
                <ul className={`space-y-2 text-sm ${theme.textMuted}`}>
                  <li className="flex items-center gap-2 opacity-80">
                    • {content.noData.account.bullets.noSignup}
                  </li>
                  <li className="flex items-center gap-2 opacity-80">
                    • {content.noData.account.bullets.noEmail}
                  </li>
                  <li className="flex items-center gap-2 opacity-80">
                    • {content.noData.account.bullets.noPassword}
                  </li>
                </ul>
                <p className={`pt-2 text-sm font-bold ${theme.accent}`}>
                  {content.noData.account.anonymous}
                </p>
              </div>
            </PrivacyCard>
          </div>

          {/* کوکی‌ها و Local Storage */}
          <div
            className={`p-8 rounded-3xl border ${theme.border} ${theme.card}`}
          >
            <h2
              className={`text-2xl font-bold mb-8 flex items-center gap-3 ${theme.text}`}
            >
              <Cookie size={26} className={theme.textMuted} />{" "}
              {content.cookies.title}
            </h2>

            <div className="space-y-8 divide-y divide-dashed dark:divide-zinc-800 divide-zinc-200">
              <div className="pb-8">
                <h3
                  className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme.text}`}
                >
                  {content.cookies.noTrackingTitle}
                </h3>
                <p className={`leading-relaxed ${theme.textMuted}`}>
                  {content.cookies.noTrackingBody}
                </p>
              </div>

              <div className="pt-8">
                <h3
                  className={`text-lg font-bold mb-3 flex items-center gap-2 ${theme.text}`}
                >
                  {content.cookies.localTitle}
                </h3>
                <p className={`leading-relaxed mb-4 ${theme.textMuted}`}>
                  {content.cookies.localIntro}
                </p>

                <div
                  className={`p-5 rounded-2xl border ${theme.border} ${theme.secondary}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-white dark:bg-black/20 shadow-sm">
                      <History size={20} className={theme.text} />
                    </div>
                    <div>
                      <strong className={`block text-base mb-1 ${theme.text}`}>
                        {content.cookies.themeTitle}
                      </strong>
                      <p
                        className={`text-sm opacity-80 leading-relaxed ${theme.textMuted}`}
                      >
                        {content.cookies.themeBody}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* امنیت داده‌ها */}
          <div
            className={`p-8 rounded-3xl border relative overflow-hidden ${theme.border} ${theme.card}`}
          >
            <div
              className={`absolute inset-0 opacity-5 bg-gradient-to-r ${theme.gradient}`}
            />
            <h2
              className={`text-2xl font-bold mb-6 flex items-center gap-3 relative z-10 ${theme.text}`}
            >
              <Lock size={26} className={theme.accent} />{" "}
              {content.security.title}
            </h2>

            <p
              className={`leading-loose mb-8 relative z-10 ${theme.textMuted}`}
            >
              {content.security.intro}
            </p>

            <div className="grid sm:grid-cols-3 gap-4 relative z-10">
              <SecurityStat
                label={content.security.stats.db}
                value="0"
                theme={theme}
              />
              <SecurityStat
                label={content.security.stats.info}
                value="0"
                theme={theme}
              />
              <SecurityStat
                label={content.security.stats.sale}
                value="0"
                theme={theme}
              />
            </div>

            <p
              className={`mt-8 text-center font-bold text-lg relative z-10 ${theme.accent}`}
            >
              {content.security.quote}
            </p>
          </div>

          {/* فوتر بخش حریم خصوصی */}
          <div
            className={`grid md:grid-cols-2 gap-8 border-t border-dashed pt-10 ${theme.border}`}
          >
            <div>
              <h3 className={`font-bold mb-3 ${theme.text}`}>
                {content.footer.changesTitle}
              </h3>
              <p className={`text-sm leading-relaxed ${theme.textMuted}`}>
                {content.footer.changesBody}
              </p>
            </div>
            <div>
              <h3 className={`font-bold mb-3 ${theme.text}`}>
                {content.footer.contactTitle}
              </h3>
              <p className={`text-sm leading-relaxed mb-4 ${theme.textMuted}`}>
                {content.footer.contactBody}
              </p>
              <Link
                href="/contact"
                className={`inline-flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-xl transition-all ${theme.primary} hover:brightness-110`}
              >
                <Mail size={16} /> {content.footer.contactButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function CheckItem({ text, theme }: { text: string; theme: any }) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${theme.border} bg-white/50 dark:bg-black/20`}
    >
      <CheckCircle2 size={18} className={theme.accent} />
      <span className={`text-sm font-medium ${theme.text}`}>{text}</span>
    </div>
  );
}

function PrivacyCard({ icon: Icon, title, children, theme }: any) {
  return (
    <div
      className={`p-6 rounded-2xl border flex flex-col h-full transition-colors duration-300 ${theme.border} ${theme.card}`}
    >
      <div
        className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center ${theme.secondary}`}
      >
        <Icon size={24} className={theme.accent} />
      </div>
      <h3 className={`text-xl font-bold mb-4 ${theme.text}`}>{title}</h3>
      <div className={`text-sm leading-loose flex-1 ${theme.textMuted}`}>
        {children}
      </div>
    </div>
  );
}

function SecurityStat({ label, value, theme }: any) {
  return (
    <div
      className={`p-4 rounded-2xl text-center border ${theme.border} ${theme.bg}`}
    >
      <div className={`font-black text-3xl mb-1 ${theme.text}`}>{value}</div>
      <div className={`text-xs font-medium opacity-70 ${theme.textMuted}`}>
        {label}
      </div>
    </div>
  );
}
