"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Home, SearchX, Wrench } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function NotFound() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const isFa = locale === "fa";

  const copy = isFa
    ? {
        eyebrow: "خطای ۴۰۴",
        title: "این صفحه پیدا نشد",
        description:
          "احتمالاً آدرس را اشتباه وارد کرده‌اید یا این ابزار جابه‌جا شده است. از مسیرهای زیر به جعبه‌ابزار برگردید.",
        home: "بازگشت به خانه",
        docs: "مشاهدهٔ مستندات",
        hint: "یا از فهرست ابزارها یک ابزار انتخاب کنید",
      }
    : {
        eyebrow: "ERROR 404",
        title: "This page is missing",
        description:
          "The address may be incorrect, or this tool may have moved. Use one of the paths below to get back to the toolbox.",
        home: "Back to home",
        docs: "Browse documentation",
        hint: "Or choose a tool from the catalogue",
      };

  return (
    <main className={`relative isolate flex min-h-[calc(100vh-9rem)] items-center overflow-hidden ${theme.bg}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className={`absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl ${theme.secondary}`} />
        <div className={`absolute -left-24 top-16 h-56 w-56 rounded-full border ${theme.border} opacity-40`} />
        <div className={`absolute -right-20 bottom-8 h-72 w-72 rounded-full border ${theme.border} opacity-30`} />
      </div>

      <div className="mx-auto w-full max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-24">
        <div className={`mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl ${theme.secondary}`}>
          <SearchX className={theme.accent} size={30} strokeWidth={1.8} aria-hidden="true" />
        </div>

        <p className={`text-xs font-black uppercase tracking-[0.28em] ${theme.accent}`}>{copy.eyebrow}</p>
        <div className={`mt-3 text-[clamp(6rem,24vw,12rem)] font-black leading-[0.8] tracking-[-0.08em] ${theme.text}`} aria-hidden="true">
          404
        </div>
        <h1 className={`mt-8 text-3xl font-black tracking-tight sm:text-5xl ${theme.text}`}>{copy.title}</h1>
        <p className={`mx-auto mt-5 max-w-xl text-base leading-8 sm:text-lg ${theme.textMuted}`}>{copy.description}</p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.primary}`}
          >
            <Home size={17} aria-hidden="true" />
            {copy.home}
          </Link>
          <Link
            href="/docs"
            className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-6 text-sm font-black transition-colors hover:bg-black/5 dark:hover:bg-white/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--app-ring)] ${theme.card} ${theme.border} ${theme.text}`}
          >
            <BookOpen size={17} className={theme.accent} aria-hidden="true" />
            {copy.docs}
          </Link>
        </div>

        <Link href="/" className={`mt-8 inline-flex items-center gap-2 text-sm font-bold underline-offset-4 hover:underline ${theme.textMuted}`}>
          <Wrench size={16} aria-hidden="true" />
          {copy.hint}
          {isFa ? <ArrowLeft size={15} aria-hidden="true" /> : <ArrowRight size={15} aria-hidden="true" />}
        </Link>
      </div>
    </main>
  );
}
