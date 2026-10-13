"use client";
import { useEffect } from "react";
import { localizedPath } from "@/lib/localized-path";
export default function LegacyRedirect({ path }: { path: string }) {
  useEffect(() => {
    const url = new URL(window.location.href);
    const locale = url.searchParams.get("lang") === "en" ? "en" : "fa";
    url.pathname = localizedPath(path, locale);
    url.searchParams.delete("lang");
    window.location.replace(url);
  }, [path]);
  return <div className="p-8"><p>QodeForge</p><a href={localizedPath(path, "fa")} lang="fa">نسخه فارسی</a> · <a href={localizedPath(path, "en")} lang="en">English version</a></div>;
}
