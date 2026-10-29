"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Download, FileCheck2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { downloadExport, onFileExport, type ExportRequest } from "@/lib/file-export";
import { normaliseOutputName } from "@/lib/output-name";
import { byteSize, startActivity } from "@/lib/transfer";

export default function ExportDialog() {
  const { locale } = useLanguage(), fa = locale === "fa", pathname = usePathname();
  const [queue, setQueue] = useState<ExportRequest[]>([]), [name, setName] = useState("");
  const requests = useRef(queue), id = useId();
  requests.current = queue;
  const request = queue[0];
  useEffect(() => onFileExport(item => {
    if (item.origin.path !== window.location.pathname) { item.resolve(false); return; }
    setQueue(previous => [...previous, item]);
  }), []);
  useEffect(() => {
    setQueue(previous => {
      return previous.filter(item => {
        const current = item.origin.path === window.location.pathname;
        if (!current) item.resolve(false);
        return current;
      });
    });
  }, [pathname]);
  useEffect(() => () => requests.current.forEach(item => item.resolve(false)), []);
  useLayoutEffect(() => {
    if (!request) return;
    setName(request.suggestedName.replace(/\.[a-z\d]{1,12}$/i, ""));
  }, [request]);
  useEffect(() => {
    if (!request) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [!!request]);
  const close = (saved = false) => {
    request?.resolve(saved);
    setQueue(previous => previous.slice(1));
  };
  if (!request) return null;
  const extension = request.suggestedName.match(/\.[a-z\d]{1,12}$/i)?.[0] ?? "";
  const filename = normaliseOutputName(name, request.suggestedName);
  return <div className="export-overlay" onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
    <section className="export-dialog" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3"><span className="export-file-icon"><FileCheck2 size={22} aria-hidden="true" /></span><div><h2 id={`${id}-title`} className="text-lg font-bold">{fa ? "ذخیره خروجی" : "Save your file"}</h2><p id={`${id}-description`} className="mt-1 text-sm text-[var(--app-text-muted)]">{request.error ? (fa ? "فایل آماده نشد؛ دوباره از ابزار تلاش کنید." : "The file could not be prepared. Try again from the tool.") : (fa ? "فایل آماده است. نام آن را انتخاب کنید." : "Your file is ready. Choose its name.")}</p></div></div>
        <button type="button" className="export-close" aria-label={fa ? "بستن" : "Close"} onClick={() => close()}><X size={18} aria-hidden="true" /></button>
      </div>
      {!request.error && <form className="mt-7" onSubmit={event => {
        event.preventDefault();
        const saved = downloadExport(request, name);
        if (!saved) return;
        const task = startActivity(saved, "save", request.blob?.size, undefined, request.origin);
        task.progress(request.blob?.size ?? 0, request.blob?.size); task.finish();
        close(true);
      }}>
        <label htmlFor={id} className="mb-2 block text-sm font-semibold">{fa ? "نام فایل" : "Filename"}</label>
        <div className="export-filename"><input data-autofocus id={id} value={name} onFocus={event => event.currentTarget.select()} onChange={event => setName(event.target.value)} autoComplete="off" maxLength={160} dir="auto" aria-describedby={`${id}-preview`} /><span dir="ltr">{extension}</span></div>
        <p id={`${id}-preview`} className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--app-text-muted)]"><bdi className="break-all">{filename}</bdi><span dir="ltr">{byteSize(request.blob?.size ?? 0)}</span></p>
        <div className="mt-7 flex justify-end gap-2"><button type="button" className="ai-button" onClick={() => close()}>{fa ? "انصراف" : "Cancel"}</button><button type="submit" className="ai-button ai-primary"><Download size={17} aria-hidden="true" />{fa ? "ذخیره فایل" : "Save file"}</button></div>
      </form>}
    </section>
  </div>;
}
