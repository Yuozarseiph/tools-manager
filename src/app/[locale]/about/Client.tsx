"use client";

import { useRef, useState } from "react";
import Link from "@/components/LocalizedLink";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  CircleCheck,
  Fingerprint,
  Gift,
  Heart,
  HelpCircle,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { aboutContent } from "@/data/pages/about.content";

const FEATURES = [
  { id: "free", icon: Gift, number: "01" },
  { id: "privacy", icon: ShieldCheck, number: "02" },
  { id: "fast", icon: Zap, number: "03" },
  { id: "product", icon: Layers3, number: "04" },
] as const;

const FAQ_ITEMS = [
  "noSignup",
  "dataStored",
  "sizeLimit",
  "ads",
  "offline",
  "original",
  "whyFree",
] as const;

type Theme = ReturnType<typeof useThemeColors>;

type FeatureCardProps = {
  icon: LucideIcon;
  number: string;
  title: string;
  desc: string;
  theme: Theme;
};

type FAQItemProps = {
  index: number;
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
  theme: Theme;
};

export default function AboutPage() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content = aboutContent[locale];
  const isFa = locale === "fa";
  const principlesRef = useRef<HTMLElement | null>(null);
  const faqRef = useRef<HTMLElement | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (target: "principles" | "faq") => {
    const section =
      target === "principles" ? principlesRef.current : faqRef.current;

    section?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      {/* subtle page canvas */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="mx-auto w-full max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        {/* back action */}
        <div className="mb-6">
          <Link
            href="/"
            className={`group inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${theme.card} ${theme.border} ${theme.text}`}
          >
            {isFa ? (
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            ) : (
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />
            )}
            {content.back}
          </Link>
        </div>

        {/* HERO */}
        <section
          className={`relative overflow-hidden rounded-[28px] border ${theme.border} ${theme.card}`}
        >
          {/* Material top accent */}
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              background:
                "linear-gradient(90deg, var(--app-accent), var(--app-secondary-color))",
            }}
          />

          <div className="grid min-h-[620px] gap-0 lg:grid-cols-[1.05fr_0.95fr]">
            {/* left / copy */}
            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14 xl:p-16">
              <div className="mb-8 flex flex-wrap items-center gap-2">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ${theme.secondary} ${theme.accent}`}
                >
                  <Sparkles size={15} />
                  {content.hero.badge}
                </div>

                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${theme.border} ${theme.textMuted}`}
                >
                  <CircleCheck size={14} />
                  XenonQode
                </div>
              </div>

              <div className="max-w-3xl">
                <p
                  className={`mb-3 text-sm font-bold uppercase tracking-[0.16em] ${theme.textMuted}`}
                >
                  {isFa ? "درباره" : "About"}
                </p>

                <h1
                  className={`text-5xl font-black leading-[1.04] tracking-[-0.04em] sm:text-6xl lg:text-7xl ${theme.text}`}
                >
                  {isFa ? "کد فورج" : "QodeForge"}
                </h1>

                <p
                  className={`mt-7 max-w-2xl text-base leading-8 sm:text-lg sm:leading-9 ${theme.textMuted}`}
                >
                  {content.hero.description}
                </p>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollToSection("principles")}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${theme.primary}`}
                >
                  {content.story.title}
                  {isFa ? <ArrowLeft size={17} /> : <ArrowRight size={17} />}
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("faq")}
                  className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-6 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm ${theme.card} ${theme.border} ${theme.text}`}
                >
                  <HelpCircle size={17} />
                  {content.faq.title}
                </button>
              </div>
            </div>

            {/* right / material composition */}
            <div
              className="relative min-h-[440px] overflow-hidden border-t lg:min-h-full lg:border-s lg:border-t-0"
              style={{ borderColor: "color-mix(in srgb, currentColor 12%, transparent)" }}
            >
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  background:
                    "linear-gradient(145deg, color-mix(in srgb, var(--app-accent) 14%, transparent), color-mix(in srgb, var(--app-secondary-color) 7%, transparent) 70%)",
                }}
              />

              <div className="relative flex h-full min-h-[440px] items-center justify-center p-7 sm:p-10">
                <div className="relative w-full max-w-lg">
                  {/* main material card */}
                  <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    className={`relative z-20 overflow-hidden rounded-[28px] border p-6 shadow-2xl sm:p-8 ${theme.card} ${theme.border}`}
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <div
                          className={`text-xs font-black uppercase tracking-[0.2em] ${theme.textMuted}`}
                        >
                          QODEFORGE
                        </div>
                        <div className={`mt-2 text-2xl font-black ${theme.text}`}>
                          by XenonQode
                        </div>
                      </div>

                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] ${theme.secondary}`}
                      >
                        <Fingerprint size={28} className={theme.accent} />
                      </div>
                    </div>

                    <div className="mt-10 grid gap-3">
                      {[
                        {
                          icon: ShieldCheck,
                          label: content.features.privacy.title,
                        },
                        {
                          icon: Zap,
                          label: content.features.fast.title,
                        },
                        {
                          icon: Layers3,
                          label: content.features.product.title,
                        },
                      ].map(({ icon: Icon, label }) => (
                        <div
                          key={label}
                          className={`flex items-center gap-3 rounded-[18px] border px-4 py-3.5 transition-colors ${theme.border}`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${theme.secondary}`}
                          >
                            <Icon size={18} className={theme.accent} />
                          </div>
                          <span className={`text-sm font-bold ${theme.text}`}>
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      className={`mt-6 flex items-center justify-between rounded-[18px] px-4 py-3 ${theme.secondary}`}
                    >
                      <span className={`text-xs font-bold ${theme.textMuted}`}>
                        QF / PLATFORM
                      </span>
                      <span className={`text-xs font-black ${theme.accent}`}>
                        26.4
                      </span>
                    </div>
                  </motion.div>

                  {/* background elevation slabs */}
                  <div
                    className="absolute -bottom-6 -start-5 z-10 h-40 w-[72%] rounded-[26px] opacity-50 shadow-xl"
                    style={{
                      background:
                        "color-mix(in srgb, var(--app-accent) 18%, transparent)",
                    }}
                  />
                  <div
                    className="absolute -end-5 -top-6 z-0 h-44 w-[58%] rounded-[26px] opacity-40"
                    style={{
                      background:
                        "color-mix(in srgb, var(--app-secondary-color) 18%, transparent)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PRINCIPLES */}
        <section ref={principlesRef} className="scroll-mt-24 pt-24">
          <div className="mb-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <div
                className={`mb-3 text-xs font-black uppercase tracking-[0.18em] ${theme.accent}`}
              >
                QodeForge / Principles
              </div>
              <h2
                className={`text-3xl font-black leading-tight sm:text-4xl ${theme.text}`}
              >
                {content.story.title}
              </h2>
            </div>

            <p className={`max-w-2xl text-sm leading-7 sm:text-base ${theme.textMuted}`}>
              {content.story.p1}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {FEATURES.map((item) => (
              <FeatureCard
                key={item.id}
                icon={item.icon}
                number={item.number}
                title={content.features[item.id].title}
                desc={content.features[item.id].desc}
                theme={theme}
              />
            ))}
          </div>
        </section>

        {/* STORY */}
        <section className="pt-24">
          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div
              className={`relative overflow-hidden rounded-[28px] border p-7 sm:p-10 lg:p-12 ${theme.card} ${theme.border}`}
            >
              <div className="relative z-10">
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] ${theme.secondary}`}
                >
                  <Fingerprint size={26} className={theme.accent} />
                </div>

                <h2 className={`text-3xl font-black ${theme.text}`}>
                  {content.story.title}
                </h2>

                <div
                  className={`mt-7 max-w-3xl space-y-5 text-base leading-8 ${theme.textMuted}`}
                >
                  <p>{content.story.p1}</p>
                  <p>{content.story.p2}</p>
                </div>
              </div>

              <Fingerprint className="pointer-events-none absolute -bottom-20 -end-10 h-80 w-80 opacity-[0.035]" />
            </div>

            <div
              className={`relative overflow-hidden rounded-[28px] border p-7 sm:p-9 ${theme.border}`}
              style={{
                background:
                  "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 15%, transparent), color-mix(in srgb, var(--app-secondary-color) 8%, transparent))",
              }}
            >
              <div
                className={`mb-7 flex h-14 w-14 items-center justify-center rounded-[20px] border ${theme.card} ${theme.border}`}
              >
                <Heart size={24} className="fill-current text-red-500" />
              </div>

              <h3 className={`text-2xl font-black ${theme.text}`}>
                {content.story.support.title}
              </h3>

              <p className={`mt-4 text-sm leading-7 ${theme.textMuted}`}>
                {content.story.support.description}
              </p>

              <a
                href="https://reymit.ir/yuozarseiph"
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${theme.primary}`}
              >
                <Heart size={16} />
                {content.story.support.button}
              </a>
            </div>
          </div>
        </section>

        {/* trust strip */}
        <section className="pt-5">
          <div
            className={`grid overflow-hidden rounded-[24px] border sm:grid-cols-3 ${theme.card} ${theme.border}`}
          >
            {[
              {
                icon: LockKeyhole,
                title: content.features.privacy.title,
                desc: content.features.privacy.desc,
              },
              {
                icon: Zap,
                title: content.features.fast.title,
                desc: content.features.fast.desc,
              },
              {
                icon: CircleCheck,
                title: content.features.free.title,
                desc: content.features.free.desc,
              },
            ].map(({ icon: Icon, title, desc }, index) => (
              <div
                key={title}
                className={`relative p-6 sm:p-7 ${index > 0 ? "border-t sm:border-s sm:border-t-0" : ""
                  } ${theme.border}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] ${theme.secondary}`}
                  >
                    <Icon size={20} className={theme.accent} />
                  </div>
                  <div>
                    <div className={`font-black ${theme.text}`}>{title}</div>
                    <div className={`mt-2 text-xs leading-6 ${theme.textMuted}`}>
                      {desc}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section ref={faqRef} className="scroll-mt-24 pt-24">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            {/* FAQ intro */}
            <div className="lg:sticky lg:top-24">
              <div
                className={`relative overflow-hidden rounded-[28px] border p-7 sm:p-8 ${theme.card} ${theme.border}`}
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] ${theme.secondary}`}
                >
                  <HelpCircle size={25} className={theme.accent} />
                </div>

                <div
                  className={`mb-3 text-xs font-black uppercase tracking-[0.18em] ${theme.accent}`}
                >
                  QodeForge / FAQ
                </div>

                <h2
                  className={`text-3xl font-black leading-tight sm:text-4xl ${theme.text}`}
                >
                  {content.faq.title}
                </h2>

                <p
                  className={`mt-4 max-w-md text-sm leading-7 sm:text-base ${theme.textMuted}`}
                >
                  {content.faq.subtitle}
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ${theme.secondary} ${theme.text}`}
                  >
                    <CircleCheck size={14} className={theme.accent} />
                    {FAQ_ITEMS.length.toLocaleString(isFa ? "fa-IR" : "en-US")}
                    <span className={theme.textMuted}>
                      {isFa ? "پرسش متداول" : "common questions"}
                    </span>
                  </div>
                </div>

                <div
                  className="pointer-events-none absolute -bottom-16 -end-16 h-44 w-44 rounded-full opacity-[0.08] blur-3xl"
                  style={{ background: "var(--app-accent)" }}
                />
              </div>
            </div>

            {/* Material FAQ surface */}
            <div
              className={`overflow-hidden rounded-[28px] border shadow-sm ${theme.card} ${theme.border}`}
            >
              {FAQ_ITEMS.map((id, index) => (
                <FAQItem
                  key={id}
                  index={index}
                  question={content.faq.items[id].q}
                  answer={content.faq.items[id].a}
                  open={openFaqIndex === index}
                  onToggle={() =>
                    setOpenFaqIndex((current) =>
                      current === index ? null : index,
                    )
                  }
                  theme={theme}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  number,
  title,
  desc,
  theme,
}: FeatureCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.3 }}
      className={`group relative overflow-hidden rounded-[24px] border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${theme.card} ${theme.border}`}
    >
      <div className="mb-10 flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[18px] ${theme.secondary}`}
        >
          <Icon size={22} className={theme.accent} />
        </div>

        <span
          className={`font-mono text-xs font-bold tracking-[0.16em] ${theme.textMuted}`}
        >
          {number}
        </span>
      </div>

      <h3 className={`text-lg font-black ${theme.text}`}>{title}</h3>
      <p className={`mt-3 text-sm leading-7 ${theme.textMuted}`}>{desc}</p>

      <div
        className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-200 group-hover:scale-x-100"
        style={{ background: "var(--app-accent)" }}
      />
    </motion.article>
  );
}

function FAQItem({
  index,
  question,
  answer,
  open,
  onToggle,
  theme,
}: FAQItemProps) {
  const number = String(index + 1).padStart(2, "0");

  return (
    <div
      className={`relative transition-colors duration-200 ${index > 0 ? `border-t ${theme.border}` : ""
        }`}
      style={
        open
          ? {
            background:
              "color-mix(in srgb, var(--app-accent) 7%, transparent)",
          }
          : undefined
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`group flex w-full items-center gap-4 p-5 text-start outline-none transition-colors sm:gap-5 sm:p-6 ${theme.text}`}
      >
        <span
          className={`flex h-10 min-w-10 shrink-0 items-center justify-center rounded-[14px] font-mono text-xs font-black transition-colors ${open ? theme.primary : theme.secondary
            } ${open ? "text-white" : theme.textMuted}`}
        >
          {number}
        </span>

        <span className="min-w-0 flex-1">
          <span
            className={`block text-sm font-black leading-7 transition-colors sm:text-base ${open ? theme.accent : theme.text
              }`}
          >
            {question}
          </span>
        </span>

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${open ? theme.primary : theme.secondary
            }`}
        >
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${open ? "rotate-180 text-white" : theme.accent
              }`}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.18, ease: [.2, .7, .2, 1] },
              opacity: { duration: 0.18, ease: "easeOut" },
            }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 sm:px-6 sm:pb-7">
              <div className="flex gap-4 sm:gap-5">
                <div className="w-10 shrink-0" aria-hidden="true" />

                <div className="min-w-0 flex-1">
                  <div
                    className="relative rounded-[18px] border p-4 sm:p-5"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--app-accent) 20%, transparent)",
                      background:
                        "color-mix(in srgb, var(--app-accent) 5%, transparent)",
                    }}
                  >
                    <div
                      className="absolute inset-y-4 start-0 w-[3px] rounded-full"
                      style={{ background: "var(--app-accent)" }}
                    />
                    <p
                      className={`ps-3 text-sm leading-8 sm:text-[15px] ${theme.textMuted}`}
                    >
                      {answer}
                    </p>
                  </div>
                </div>

                <div className="hidden w-10 shrink-0 sm:block" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
