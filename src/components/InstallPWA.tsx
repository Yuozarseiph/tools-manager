// components/InstallPWA.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Download } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function InstallPWA() {
  const theme = useThemeColors();
  const { t, locale } = useLanguage();

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

  const label = installing
    ? t("pwa.install.installing") ||
      (locale === "fa" ? "در حال نصب..." : "Installing...")
    : t("pwa.install.cta") ||
      (locale === "fa" ? "نصب اپلیکیشن" : "Install app");

  const helper =
    t("pwa.install.helper") ||
    (locale === "fa"
      ? "برای دسترسی سریع‌تر، اپ را روی دستگاه خود نصب کنید."
      : "Install the app for faster access from your device.");

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
