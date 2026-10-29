"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Check, Download, FileUp, AlertCircle, Loader2, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { captureActivityOrigin, clearActivityOrigin } from "@/lib/activity-origin";
import { activityEvent, observeFileReads, byteSize, type Activity } from "@/lib/transfer";

function activityArea(source?: HTMLElement, parents?: HTMLElement[]) {
  if (!source?.isConnected) {
    const survivingArea = parents?.find(parent => parent.isConnected);
    if (survivingArea) return survivingArea;
  }
  if (source?.isConnected) {
    const explicit = source.closest<HTMLElement>("[data-activity-area]");
    if (explicit) return explicit;
    const control = source.closest<HTMLElement>("label, [role='button'], button") ?? source;
    if (control.matches("[role='button'], [class~='border-dashed']")) return control;
    return control.parentElement ?? control;
  }
  return document.querySelector<HTMLElement>("main .tool-layout-shell [data-activity-area], main .tool-layout-shell h1")?.parentElement;
}

function InlineActivities({ tasks, now, locale }: { tasks: Activity[]; now: number; locale: string }) {
  const [host, setHost] = useState<HTMLDivElement | null>(null), fa = locale === "fa";
  const source = tasks[0]?.origin?.element;
  const parents = tasks[0]?.origin?.parents;
  useLayoutEffect(() => {
    const slot = document.createElement("div");
    slot.className = "inline-activity-slot";
    const place = () => {
      const area = activityArea(source, parents);
      if (area?.isConnected && (!slot.isConnected || slot.parentElement !== area.parentElement)) area.after(slot);
    };
    place(); setHost(slot);
    const observer = new MutationObserver(place);
    observer.observe(document.querySelector("main") ?? document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); slot.remove(); };
  }, [source, parents]);
  if (!host) return null;
  const transfers = tasks.filter(task => task.kind !== "process").slice(-4);
  const process = tasks.filter(task => task.kind === "process").at(-1);
  return createPortal(<div onClick={event => event.stopPropagation()}>
    {transfers.map(task => {
      const elapsed = Math.max(.1, ((task.status === "running" ? now : task.updated) - task.started) / 1000);
      const percent = task.status === "done" ? 100 : task.total ? Math.min(99, Math.round(task.done / task.total * 100)) : undefined;
      const Icon = task.status === "done" ? Check : task.status === "error" ? AlertCircle : task.kind === "read" ? FileUp : Download;
      const status = task.status === "done" ? (task.kind === "save" ? (fa ? "ارسال به مرورگر برای ذخیره" : "Sent to your browser to save") : (fa ? "آماده شد" : "Ready"))
        : task.status === "error" ? (fa ? "انتقال ناموفق بود؛ دوباره تلاش کنید." : "Transfer failed. Please retry.")
        : task.status === "cancelled" ? (fa ? "لغو شد" : "Cancelled")
        : task.kind === "read" ? (fa ? "خواندن فایل در مرورگر" : "Reading file locally") : (fa ? "دریافت فایل" : "Downloading file");
      return <div className="inline-transfer" key={task.id} data-status={task.status} role={task.status === "error" ? "alert" : "status"}>
        <div className="flex min-w-0 items-center gap-2"><Icon size={17} aria-hidden="true" className="shrink-0 text-[var(--app-accent)]" /><bdi className="min-w-0 flex-1 truncate font-medium" title={task.name}>{task.name}</bdi>{task.cancel && task.status === "running" && <button type="button" onClick={task.cancel} className="inline-activity-cancel" aria-label={fa ? "لغو انتقال" : "Cancel transfer"}><X size={16} /></button>}</div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--app-text-muted)]"><span>{status}</span><span dir="ltr">{task.status === "running" ? `${byteSize(task.done)}${task.total ? ` / ${byteSize(task.total)}` : ""}` : byteSize(task.total ?? task.done)}{task.status === "running" && task.done > 0 && ` · ${byteSize(task.done / elapsed)}/s`}</span></div>
        {task.status === "running" && <progress className="task-progress mt-2" max={100} value={percent} aria-label={task.name} />}
      </div>;
    })}
    {process && <div className="inline-process-status" data-status={process.status} role={process.status === "error" ? "alert" : "status"}>
      {process.status === "running" ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : process.status === "error" ? <AlertCircle size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
      <span>{process.status === "running" ? `${process.name}…` : process.status === "done" ? (fa ? "پردازش کامل شد." : "Processing complete.") : process.status === "cancelled" ? (fa ? "پردازش لغو شد." : "Processing cancelled.") : (fa ? "پردازش انجام نشد؛ پیام ابزار را بررسی کنید." : "Processing failed. Check the tool message.")}</span>
    </div>}
  </div>, host);
}

/** Route each operation to its own controls; there is no floating activity history. */
export default function ActivityCenter() {
  const { locale } = useLanguage(), pathname = usePathname();
  const [tasks, setTasks] = useState<Activity[]>([]), [now, setNow] = useState(0);
  const origins = useRef(new WeakMap<HTMLElement, number>()), nextOrigin = useRef(0);
  useEffect(() => {
    const capture = (event: Event) => captureActivityOrigin(event.target);
    for (const event of ["click", "change", "drop"]) document.addEventListener(event, capture, true);
    const receive = (event: Event) => {
      const task = (event as CustomEvent<Activity>).detail;
      if (task.origin?.path && task.origin.path !== window.location.pathname) return;
      setNow(Date.now());
      setTasks(previous => previous.some(item => item.id === task.id) ? previous.map(item => item.id === task.id ? task : item) : [...previous, task]);
    };
    window.addEventListener(activityEvent, receive);
    const release = observeFileReads(locale === "fa" ? "خواندن فایل" : "Reading file");
    const timer = setInterval(() => {
      setNow(Date.now());
      setTasks(previous => previous.filter(task => task.status === "running" || Date.now() - task.updated < (task.status === "error" ? 12_000 : 6000)));
    }, 500);
    return () => {
      clearInterval(timer); release(); window.removeEventListener(activityEvent, receive);
      for (const event of ["click", "change", "drop"]) document.removeEventListener(event, capture, true);
    };
  }, [locale]);
  useEffect(() => { clearActivityOrigin(); setTasks([]); }, [pathname]);
  const groups = new Map<number, Activity[]>();
  for (const task of tasks) {
    const element = task.origin?.element;
    if (element && !origins.current.has(element)) origins.current.set(element, ++nextOrigin.current);
    const key = element ? origins.current.get(element)! : 0;
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }
  return <>{[...groups].map(([key, group]) => <InlineActivities key={key} tasks={group} now={now} locale={locale} />)}</>;
}
