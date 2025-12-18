"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Moon, Sun } from "lucide-react";

import { useTheme, ThemeName } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import { themeContent } from "@/data/theme.content";

type ThemeOption = {
  id: ThemeName;
  icon: typeof Sun;
  label: {
    fa: string;
    en: string;
  };
};

export default function ThemeSwitcher() {
  const { changeTheme, themeName } = useTheme();
  const theme = useThemeColors();
  const { locale } = useLanguage();

  // 🔥 انتخاب محتوا بر اساس زبان
  const content = themeContent[locale];

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔥 تعریف گزینه‌ها با لیبل دو زبانه
  const options: ThemeOption[] = [
    {
      id: "royal-blue-light",
      icon: Sun,
      label: {
        fa: themeContent.fa.light,
        en: themeContent.en.light,
      },
    },
    {
      id: "royal-blue-dark",
      icon: Moon,
      label: {
        fa: themeContent.fa.dark,
        en: themeContent.en.dark,
      },
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // برای تعیین جهت منو (RTL / LTR)
  const isRTL = locale === "fa";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* دکمه اصلی */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`
          rounded-full p-3 flex items-center justify-center
          border ${theme.border}
          duration-300 transition-all
          backdrop-blur-sm cursor-pointer
          hover:scale-105 active:scale-95
        `}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={content.switchTitle}
        title={content.switchTitle}
      >
        <Palette
          size={18}
          className={isOpen ? theme.accent : theme.textMuted}
        />
      </button>

      {/* منوی انتخاب تم */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full mt-2 
              ${isRTL ? "left-0 origin-top-left" : "right-0 origin-top-right"}
              min-w-[170px]
              p-1.5 z-50 flex flex-col gap-1
            `}
            role="menu"
          >
            {options.map((opt) => {
              const Icon = opt.icon;
              const active = themeName === opt.id;
              const label = opt.label[locale]; // 🔥 انتخاب لیبل بر اساس زبان

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    changeTheme(opt.id);
                    setIsOpen(false);
                  }}
                  role="menuitem"
                  className={`
                    w-full flex items-center gap-3 p-2
                    rounded-lg text-sm font-medium
                    backdrop-blur-sm
                    border ${theme.border}
                    transition-colors
                    ${active ? theme.secondary : `hover:opacity-90`}
                  `}
                >
                  <Icon
                    size={16}
                    className={active ? theme.accent : theme.textMuted}
                  />
                  <span className={theme.text}>{label}</span>

                  {active && (
                    <Check size={14} className={`mr-auto ${theme.accent}`} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
