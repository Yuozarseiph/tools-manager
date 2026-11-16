"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { clearRuntimeCache, hasRuntimeCache, runtimeCacheEvent, type RuntimeGroup } from "@/lib/transfer";

export default function RuntimeCacheControl({ group, busy, onClear }: {
  group: RuntimeGroup; busy: boolean; onClear?: () => void;
}) {
  const { locale } = useLanguage();
  const fa = locale === "fa";
  const [available, setAvailable] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    const refresh = () => void hasRuntimeCache(group).then(value => { if (active) setAvailable(value); }).catch(() => {});
    refresh();
    window.addEventListener(runtimeCacheEvent, refresh);
    return () => { active = false; window.removeEventListener(runtimeCacheEvent, refresh); };
  }, [busy, group]);
  return <div className="space-y-2">
    {available && <button type="button" className="ai-button" disabled={busy || clearing} onClick={async () => {
      setMessage("");
      setClearing(true);
      try {
        await clearRuntimeCache(group);
        setAvailable(false);
        onClear?.();
        setMessage(fa ? "فایل‌های ذخیره‌شدهٔ ابزار حذف شدند." : "Saved tool files were removed.");
      } catch { setMessage(fa ? "حذف فایل‌های ذخیره‌شده ممکن نشد." : "Could not remove the saved files."); }
      finally { setClearing(false); }
    }}>{fa ? "حذف فایل‌های ذخیره‌شده" : "Remove saved tool files"}</button>}
    {message && <p role="status" className="guide-copy text-sm">{message}</p>}
  </div>;
}
