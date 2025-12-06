// components/layout/AboutPage.tsx یا app/about/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Heart,
  Gift,
  Layers,
  Fingerprint,
  HelpCircle,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";

const FEATURE_ITEMS = [
  { id: "free", icon: Gift, color: "bg-green-500" },
  { id: "privacy", icon: ShieldCheck, color: "bg-blue-500" },
  { id: "fast", icon: Zap, color: "bg-amber-500" },
  { id: "product", icon: Layers, color: "bg-purple-500" }
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

export default function AboutPage() {
  const theme = useThemeColors();
  const { t } = useLanguage();

  return (
    <div className={`min-h-screen ${theme.bg}`}>
      <div className="max-w-5xl mx-auto px-6 py-16">
        <Link
          href="/"
          className={`inline-flex items-center text-sm font-medium mb-8 hover:opacity-70 transition-opacity ${theme.textMuted}`}
        >
          <ArrowRight size={16} className="ml-1" />
          {t("about.back")}
        </Link>

        {/* --- Hero Section --- */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6 bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShieldCheck size={16} />
            <span>{t("about.hero.badge")}</span>
          </div>
          <h1 className={`text-4xl md:text-6xl font-black mb-6 ${theme.text}`}>
            {t("about.hero.titlePrefix")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Tools Manager
            </span>
          </h1>
          <p
            className={`text-lg md:text-xl leading-loose max-w-3xl mx-auto ${theme.textMuted}`}
          >
            {t("about.hero.description")}
          </p>
        </div>

        {/* --- Philosophy Grid --- */}
        <div className="grid md:grid-cols-2 gap-6 mb-24">
          {FEATURE_ITEMS.map((item) => (
            <FeatureCard
              key={item.id}
              icon={item.icon}
              title={t(`about.features.${item.id}.title`)}
              desc={t(`about.features.${item.id}.desc`)}
              theme={theme}
              color={item.color}
            />
          ))}
        </div>

        {/* --- Story Section --- */}
        <div
          className={`relative overflow-hidden rounded-3xl p-8 md:p-12 mb-24 border ${theme.border} bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/10`}
        >
          <div className="relative z-10">
            <h2 className={`text-3xl font-black mb-6 ${theme.text}`}>
              {t("about.story.title")}
            </h2>
            <div
              className={`space-y-6 text-lg leading-loose ${theme.textMuted}`}
            >
              <p>{t("about.story.p1")}</p>
              <p>{t("about.story.p2")}</p>
            </div>

            <div
              className={`mt-8 p-6 rounded-2xl border ${theme.border} bg-white/50 dark:bg-black/20 backdrop-blur-sm`}
            >
              <h3
                className={`font-bold text-xl mb-2 flex items-center gap-2 ${theme.text}`}
              >
                <Heart className="text-red-500 fill-red-500 animate-pulse" />
                {t("about.story.support.title")}
              </h3>
              <p className={`text-base ${theme.textMuted}`}>
                {t("about.story.support.description")}
              </p>
              <a
                href="https://reymit.ir/yuozarseiph"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition-all shadow-lg shadow-red-500/30"
              >
                {t("about.story.support.button")}
              </a>
            </div>
          </div>

          <Fingerprint className="absolute -right-10 -bottom-10 w-64 h-64 text-gray-200 dark:text-white/5 opacity-50 rotate-12" />
        </div>

        {/* --- FAQ Section --- */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <HelpCircle size={24} />
            </div>
            <h2 className={`text-3xl font-black ${theme.text}`}>
              {t("about.faq.title")}
            </h2>
            <p className={`mt-2 ${theme.textMuted}`}>
              {t("about.faq.subtitle")}
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((id) => (
              <FAQItem
                key={id}
                question={t(`about.faq.items.${id}.q`)}
                answer={t(`about.faq.items.${id}.a`)}
                theme={theme}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Sub Components ---

function FeatureCard({ icon: Icon, title, desc, theme, color }: any) {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${theme.card} ${theme.border} group`}
    >
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-10 text-opacity-100`}
      >
        <Icon size={24} className={color.replace("bg-", "text-")} />
      </div>
      <h3 className={`text-xl font-bold mb-3 ${theme.text}`}>{title}</h3>
      <p className={`text-sm leading-relaxed opacity-80 ${theme.textMuted}`}>
        {desc}
      </p>
    </div>
  );
}

function FAQItem({ question, answer, theme }: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border overflow-hidden transition-all ${
        isOpen ? "shadow-md" : ""
      } ${theme.card} ${theme.border}`}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-5 text-right font-bold text-lg transition-colors ${
          isOpen ? "text-blue-600" : theme.text
        }`}
      >
        {question}
        <ChevronDown
          size={20}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180 text-blue-600" : theme.textMuted
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className={`p-5 pt-0 leading-loose text-sm border-t ${theme.border} ${theme.textMuted}`}
            >
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
