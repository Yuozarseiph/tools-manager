// components/InstallPWA.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Download } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import { pwaContent } from "@/data/pwa.content";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPWA() {
  const theme = useThemeColors();
  const { locale } = useLanguage();

  // 🔥 انتخاب محتوا بر اساس زبان
  const content = pwaContent[locale];

  const [supportsPWA, setSupportsPWA] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      const evt = e as BeforeInstallPromptEvent;
      evt.preventDefault();
      setSupportsPWA(true);
      setDeferredPrompt(evt);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = useCallback(
    async (evt: React.MouseEvent<HTMLButtonElement>) => {
      evt.preventDefault();
      if (!deferredPrompt) return;

      try {
        setInstalling(true);
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setSupportsPWA(false);
      } finally {
        setInstalling(false);
      }
    },
    [deferredPrompt]
  );

  if (!supportsPWA || !deferredPrompt) return null;

  // 🔥 استفاده مستقیم از content
  const label = installing ? content.install.installing : content.install.cta;
  const helper = content.install.helper;

  return (
    <button
      onClick={handleInstallClick}
      className={`
        fixed z-40
        right-4 left-auto
        bottom-24 md:bottom-6
        w-11 h-11 md:w-12 md:h-12
        rounded-full
        border ${theme.border}
        ${theme.primary}
        shadow-lg shadow-black/25
        flex items-center justify-center
        text-xs font-bold
        backdrop-blur-md
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-2xl
        active:translate-y-0
      `}
      aria-label={label}
      title={`${label} • ${helper}`}
    >
      <Download size={18} className="shrink-0" />
    </button>
  );
}
