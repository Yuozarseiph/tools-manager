"use client";

import { useState, useRef, useEffect } from "react";
import { usePanelPresence } from "@/hooks/usePanelPresence";

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

export default function ThemeSwitcher({ buttonClassName = "h-11 w-11" }: { buttonClassName?: string }) {
  const { changeTheme, themeName } = useTheme();
  const theme = useThemeColors();
  const { locale } = useLanguage();

  //  انتخاب محتوا بر اساس زبان
  const content = themeContent[locale];

  const [isOpen, setIsOpen] = useState(false);
  const presence = usePanelPresence(isOpen);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  //  تعریف گزینه‌ها با لیبل دو زبانه
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

  useEffect(() => {
    if (!isOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [isOpen]);

  // برای تعیین جهت منو (RTL / LTR)
  const isRTL = locale === "fa";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* دکمه اصلی */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`
          ${buttonClassName} ui-control rounded-lg p-0 flex items-center justify-center
          border
          duration-300 transition-all
          backdrop-blur-sm cursor-pointer
          hover:opacity-90
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
      <>
        {presence.present && (
          <div {...presence.attributes}
            className={`
              absolute top-full mt-2 
              ${isRTL ? "left-0 origin-top-left" : "right-0 origin-top-right"}
              w-[170px] max-w-[calc(100vw-2rem)] rounded-xl border ${theme.border} bg-[var(--app-menu)] shadow-xl
              p-1.5 z-50 flex flex-col gap-1
            `}
            role="menu"
          >
            {options.map((opt) => {
              const Icon = opt.icon;
              const active = themeName === opt.id;
              const label = opt.label[locale]; //  انتخاب لیبل بر اساس زبان

              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    changeTheme(opt.id);
                    setIsOpen(false);
                    buttonRef.current?.focus();
                  }}
                  role="menuitemradio"
                  aria-checked={active}
                  className={`
                    min-h-11 w-full flex items-center gap-3 p-2
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
                    <Check size={14} className={`ms-auto ${theme.accent}`} />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </>
    </div>
  );
}
