"use client";
import Link from "next/link";
import type { ComponentProps } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { localizedPath } from "@/lib/localized-path";

export default function LocalizedLink({ href, ...props }: ComponentProps<typeof Link>) {
  const { locale } = useLanguage();
  const localized = typeof href === "string" ? localizedPath(href, locale) : {
    ...href, pathname: href.pathname ? localizedPath(href.pathname, locale) : href.pathname,
  };
  return <Link prefetch={typeof href === "string" && href.includes("/tools/") ? false : undefined} href={localized} {...props} />;
}
