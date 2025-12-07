"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check, Moon, Sun } from "lucide-react";

import { useTheme, ThemeName } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";

type ThemeOption = {
  id: ThemeName;
  icon: typeof Sun;
  labelFallback: string;
  labelKey: string; // برای t(...)
};

export default function ThemeSwitcher() {
  const { changeTheme, themeName } = useTheme();
  const theme = useThemeColors();
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: ThemeOption[] = [
    {
      id: "royal-blue-light",
      icon: Sun,
      labelFallback: "روشن",
      labelKey: "theme.light"
    },
    {
      id: "royal-blue-dark",
      icon: Moon,
      labelFallback: "تاریک",
      labelKey: "theme.dark"
    }
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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchTitle =
    t("theme.switchTitle") ?? "تغییر حالت روشن / تاریک";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* دکمه اصلی – معلق و هماهنگ با تم */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={`
          rounded-full p-2 flex items-center justify-center
          border ${theme.border} ${theme.card}
          shadow-md shadow-black/10
          transition-transform transition-opacity
          hover:opacity-90 active:scale-95
        `}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={switchTitle}
        title={switchTitle}
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
              absolute top-full mt-2 right-0
              min-w-[150px]
              rounded-xl border ${theme.border} ${theme.card}
              shadow-xl shadow-black/20
              p-1.5 z-50 flex flex-col gap-1
            `}
            role="menu"
          >
            {options.map((opt) => {
              const Icon = opt.icon;
              const active = themeName === opt.id;
              const label =
                t(opt.labelKey) ?? opt.labelFallback;

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
                    border ${theme.border}
                    transition-colors
                    ${
                      active
                        ? theme.secondary
                        : `${theme.card} hover:opacity-90`
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={
                      active
                        ? theme.accent
                        : theme.textMuted
                    }
                  />
                  <span className={theme.text}>{label}</span>

                  {active && (
                    <Check
                      size={14}
                      className={`mr-auto ${theme.accent}`}
                    />
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
