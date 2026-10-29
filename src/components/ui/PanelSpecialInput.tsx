"use client";
import { usePanelPresence } from "@/hooks/usePanelPresence";


import { useEffect, useId, useImperativeHandle, useRef, useState, type ComponentProps, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Check, ChevronLeft, ChevronRight, Palette, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { calendarDays, calendarParts, calendarMonth, dateValue, normaliseHex, parseDate, rgbChannels, rgbHex } from "@/lib/panel-controls";
import { usePanelPopover } from "./usePanelPopover";

type Props = ComponentProps<"input">;
function useNativeInput(props: Props) {
  const native = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(String(props.defaultValue ?? (props.type === "color" ? "#000000" : "")));
  const value = props.value === undefined ? localValue : String(props.value);
  const change = (value: string) => {
    if (!native.current || native.current.matches(":disabled") || props.readOnly) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    setter.call(native.current, value);
    setLocalValue(value);
    native.current.dispatchEvent(new Event("input", { bubbles: true }));
    native.current.dispatchEvent(new Event("change", { bubbles: true }));
  };
  useImperativeHandle(props.ref, () => native.current!);
  const bind = (element: HTMLInputElement | null) => { native.current = element; };
  return { native, bind, value, change };
}

export default function PanelSpecialInput(props: Props) {
  return props.type === "color" ? <PanelColorInput {...props} /> : <PanelDateInput {...props} />;
}

function PanelColorInput(props: Props) {
  const { locale } = useLanguage(), fa = locale === "fa", autoId = useId(), id = props.id ?? autoId;
  const { bind, value, change } = useNativeInput(props);
  const [open, setOpen] = useState(false), [draft, setDraft] = useState(value);
  const presence = usePanelPresence(open);
  const trigger = useRef<HTMLButtonElement>(null);
  const { panel, position } = usePanelPopover(open, () => setOpen(false), trigger, { width: 280, maxHeight: 460 });
  useEffect(() => { if (open) panel.current?.querySelector<HTMLInputElement>('input[type="text"]')?.focus(); }, [open, panel]);
  const hex = normaliseHex(value) ?? "#000000", channels = rgbChannels(hex);
  const compact = /\bw-(?:8|10|12)\b/.test(props.className ?? "");
  const presets = ["#000000", "#ffffff", "#475569", "#2563eb", "#0ea5e9", "#14b8a6", "#16a34a", "#eab308", "#f97316", "#dc2626", "#db2777", "#9333ea"];
  const apply = (hex: string) => { change(hex); setDraft(hex); };
  return <>
    <input {...props} ref={bind} id={`${id}-native`} className="panel-native-select" tabIndex={-1} aria-hidden="true" />
    <button type="button" ref={trigger} id={id} className={`panel-color-trigger ${compact ? "panel-color-compact" : ""} ${props.className ?? ""}`} style={props.style} disabled={props.disabled || props.readOnly} aria-label={props["aria-label"] ?? (fa ? "انتخاب رنگ" : "Choose color")} aria-labelledby={props["aria-labelledby"]} aria-describedby={props["aria-describedby"]} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setDraft(hex); setOpen(!open); }}><span className="panel-color-swatch" style={{ background: hex }} aria-hidden="true" />{!compact && <><bdi>{hex.toUpperCase()}</bdi><Palette size={16} aria-hidden="true" /></>}</button>
    {presence.present && createPortal(<div {...presence.attributes} ref={panel} role="dialog" aria-label={fa ? "تنظیم رنگ" : "Color settings"} className="panel-popover panel-color-popover" style={position} dir={fa ? "rtl" : "ltr"}>
      <div className="panel-picker-heading"><span>{fa ? "انتخاب رنگ" : "Choose color"}</span><button type="button" aria-label={fa ? "بستن انتخاب رنگ" : "Close color picker"} onClick={() => { setOpen(false); trigger.current?.focus(); }}><X size={16} /></button></div>
      <div className="panel-color-presets">{presets.map(preset => <button key={preset} type="button" aria-label={preset} aria-pressed={hex === preset} style={{ background: preset }} onClick={() => apply(preset)}>{hex === preset && <Check size={16} color={rgbChannels(preset).reduce((a, b) => a + b) > 420 ? "#000" : "#fff"} aria-hidden="true" />}</button>)}</div>
      <label className="panel-picker-field"><span>{fa ? "کد رنگ HEX" : "HEX color"}</span><input type="text" dir="ltr" maxLength={7} value={draft} aria-invalid={!normaliseHex(draft)} onChange={event => { setDraft(event.target.value); const valid = normaliseHex(event.target.value); if (valid && event.target.value.replace(/^#/, "").length === 6) change(valid); }} onBlur={() => { const valid = normaliseHex(draft); if (valid) apply(valid); }} onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); const valid = normaliseHex(draft); if (valid) apply(valid); } }} /></label>
      {channels.map((channel, index) => <label key={index} className="panel-color-channel" dir="ltr"><span>{["R", "G", "B"][index]}</span><input type="range" min={0} max={255} value={channel} aria-label={["Red", "Green", "Blue"][index]} onChange={event => apply(rgbHex(channels.map((value, i) => i === index ? Number(event.target.value) : value)))} /><output>{channel}</output></label>)}
      {!normaliseHex(draft) && <p role="status" className="panel-picker-error">{fa ? "کد سه یا شش رقمی HEX وارد کنید." : "Enter a 3- or 6-digit HEX color."}</p>}
    </div>, document.body)}
  </>;
}

function PanelDateInput(props: Props) {
  const { locale } = useLanguage(), fa = locale === "fa", autoId = useId(), id = props.id ?? autoId;
  const { bind, value, change } = useNativeInput(props);
  const [open, setOpen] = useState(false), [month, setMonth] = useState(() => parseDate(value) ?? new Date());
  const [today] = useState(() => new Date());
  const [focusedDate, setFocusedDate] = useState(() => value || dateValue(new Date()));
  const presence = usePanelPresence(open);
  const trigger = useRef<HTMLButtonElement>(null);
  const { panel, position } = usePanelPopover(open, () => setOpen(false), trigger, { width: 360, maxHeight: 480 });
  useEffect(() => { if (open) panel.current?.querySelector<HTMLButtonElement>(`[data-date="${focusedDate}"]`)?.focus(); }, [open, focusedDate, panel]);
  const selected = parseDate(value), weekStart = fa ? 6 : 0;
  const calendar = fa ? "persian" : "gregory";
  const dateLocale = `${locale}-u-ca-${calendar}`;
  const formatter = new Intl.DateTimeFormat(dateLocale, { year: "numeric", month: "long", day: "numeric" });
  const allowed = (date: string) => (!props.min || date >= String(props.min)) && (!props.max || date <= String(props.max));
  const choose = (date: string) => { if (date && !allowed(date)) return; change(date); setOpen(false); trigger.current?.focus(); };
  const moveMonth = (delta: number) => { const next = calendarMonth(month, delta, calendar); setMonth(next); setFocusedDate(dateValue(next)); };
  const calendarKey = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const delta = event.key === "ArrowRight" ? (fa ? -1 : 1) : event.key === "ArrowLeft" ? (fa ? 1 : -1) : event.key === "ArrowDown" ? 7 : event.key === "ArrowUp" ? -7 : event.key === "Home" ? -(date.getDay() - weekStart + 7) % 7 : event.key === "End" ? 6 - (date.getDay() - weekStart + 7) % 7 : null;
    if (delta === null && !["PageUp", "PageDown"].includes(event.key)) return;
    event.preventDefault();
    const next = delta === null ? calendarMonth(date, event.key === "PageUp" ? -1 : 1, calendar) : new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta, 12);
    if (!allowed(dateValue(next))) return;
    setMonth(next); setFocusedDate(dateValue(next));
  };
  return <>
    <input {...props} ref={bind} id={`${id}-native`} className="panel-native-select" tabIndex={-1} aria-hidden="true" onInvalid={event => { props.onInvalid?.(event); event.preventDefault(); trigger.current?.focus(); }} />
    <button id={id} ref={trigger} type="button" className={`panel-date-trigger ${props.className ?? ""}`} style={props.style} disabled={props.disabled || props.readOnly} aria-label={props["aria-label"] ?? (fa ? "انتخاب تاریخ شمسی" : "Choose Gregorian date")} aria-labelledby={props["aria-labelledby"]} aria-describedby={props["aria-describedby"]} aria-haspopup="dialog" aria-expanded={open} onClick={() => { setMonth(selected ?? today); setFocusedDate(value || dateValue(today)); setOpen(!open); }}><span>{selected ? formatter.format(selected) : fa ? "انتخاب تاریخ" : "Choose date"}</span><CalendarDays size={18} aria-hidden="true" /></button>
    {presence.present && createPortal(<div {...presence.attributes} ref={panel} role="dialog" aria-label={fa ? "انتخاب تاریخ شمسی" : "Choose Gregorian date"} className="panel-popover panel-date-popover" style={position} dir={fa ? "rtl" : "ltr"}>
      <div className="panel-picker-heading"><button type="button" aria-label={fa ? "ماه قبل" : "Previous month"} onClick={() => moveMonth(-1)}><ChevronLeft size={17} className={fa ? "rotate-180" : ""} /></button><span aria-live="polite">{new Intl.DateTimeFormat(dateLocale, { month: "long", year: "numeric" }).format(month)}</span><button type="button" aria-label={fa ? "ماه بعد" : "Next month"} onClick={() => moveMonth(1)}><ChevronRight size={17} className={fa ? "rotate-180" : ""} /></button></div>
      <div className="panel-calendar"><div className="panel-calendar-week">{Array.from({ length: 7 }, (_, index) => <span key={index}>{new Intl.DateTimeFormat(`${locale}-u-ca-gregory`, { weekday: "short" }).format(new Date(2023, 0, 1 + (weekStart + index) % 7))}</span>)}</div><div key={new Intl.DateTimeFormat(dateLocale, { month: "numeric", year: "numeric" }).format(month)} className="panel-calendar-days">{calendarDays(month, weekStart, calendar).map(date => { const iso = dateValue(date); return <button key={iso} type="button" aria-label={formatter.format(date)} aria-pressed={value === iso} aria-current={iso === dateValue(today) ? "date" : undefined} tabIndex={focusedDate === iso ? 0 : -1} data-date={iso} data-outside={calendarParts(date, calendar).month !== calendarParts(month, calendar).month} disabled={!allowed(iso)} onKeyDown={event => calendarKey(event, date)} onClick={() => choose(iso)}>{calendarParts(date, calendar).day.toLocaleString(locale)}</button>; })}</div></div>
      <div className="panel-calendar-actions"><button type="button" disabled={!allowed(dateValue(today))} onClick={() => choose(dateValue(today))}>{fa ? "امروز" : "Today"}</button><button type="button" disabled={props.required} onClick={() => choose("")}>{fa ? "پاک کردن" : "Clear"}</button><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); }}>{fa ? "بستن" : "Close"}</button></div>
    </div>, document.body)}
  </>;
}
