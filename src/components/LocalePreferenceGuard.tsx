"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { getSavedLocale } from "@/lib/locale-detection";
import { preferredLocaleTarget } from "@/lib/locale-preference";

export default function LocalePreferenceGuard() {
  const pathname = usePathname();
  const { locale } = useLanguage();
  useEffect(() => {
    const redirect = () => {
      const preference = getSavedLocale();
      if (!preference) return;
      const target = preferredLocaleTarget(window.location.href, preference);
      if (target) window.location.replace(target);
    };
    redirect();
    window.addEventListener("pageshow", redirect);
    return () => window.removeEventListener("pageshow", redirect);
  }, [pathname, locale]);
  return null;
}
