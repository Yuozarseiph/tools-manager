"use client";
import { usePanelPresence } from "@/hooks/usePanelPresence";


import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePanelPopover } from "./usePanelPopover";

export type PanelOption = { value: string; label: string; disabled?: boolean; group?: string };
type Props = {
  options: PanelOption[]; value: string | string[]; onChange: (value: string) => void;
  id?: string; label?: string; labelledBy?: string; describedBy?: string; invalid?: boolean;
  placeholder?: string; disabled?: boolean; searchable?: boolean; searchPlaceholder?: string;
  className?: string; style?: React.CSSProperties; labelContent?: ReactNode; multiple?: boolean;
  onBlur?: () => void;
};

export default function PanelDropdown({ options, value, onChange, id: explicitId, label, labelledBy, describedBy, invalid, placeholder, disabled, searchable = false, searchPlaceholder, className = "", style, labelContent, multiple, onBlur }: Props) {
  const autoId = useId(), id = explicitId ?? `panel-select-${autoId}`, listId = `${id}-list`;
  const { locale } = useLanguage(), fa = locale === "fa";
  const [open, setOpen] = useState(false), [search, setSearch] = useState(""), [active, setActive] = useState("");
  const presence = usePanelPresence(open && !disabled);
  const trigger = useRef<HTMLButtonElement>(null), searchInput = useRef<HTMLInputElement>(null);
  const typeahead = useRef({ value: "", at: 0 });
  const { panel, position } = usePanelPopover(open && !disabled, () => setOpen(false), trigger);
  const filtered = useMemo(() => options.filter(option => option.label.toLocaleLowerCase(locale).includes(search.toLocaleLowerCase(locale))), [options, search, locale]);
  const enabled = filtered.filter(option => !option.disabled);
  const values = Array.isArray(value) ? value : [value];
  const selected = options.filter(option => values.includes(option.value));
  const activeIndex = filtered.findIndex(option => option.value === active);
  const fallback = placeholder ?? (fa ? "انتخاب کنید" : "Select an option");
  const name = label ?? fallback;
  const show = (last = false) => {
    if (disabled || trigger.current?.matches(":disabled")) return;
    setSearch("");
    setActive(last ? options.filter(option => !option.disabled).at(-1)?.value ?? "" : selected.find(option => !option.disabled)?.value ?? options.find(option => !option.disabled)?.value ?? "");
    setOpen(true);
  };
  const choose = (option: PanelOption) => {
    if (disabled || option.disabled || trigger.current?.matches(":disabled")) return;
    onChange(option.value);
    if (!multiple) { setOpen(false); trigger.current?.focus(); }
  };
  const keyboard = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Tab") { setOpen(false); if (event.target !== trigger.current) trigger.current?.focus(); return; }
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); return; }
    const searching = event.target === searchInput.current;
    if (["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(event.key) && !(searching && ["Home", "End"].includes(event.key))) {
      event.preventDefault();
      if (!open) { show(event.key === "ArrowUp" || event.key === "End"); return; }
      const index = enabled.findIndex(option => option.value === active), delta = event.key === "ArrowUp" ? -1 : event.key === "PageUp" ? -5 : event.key === "PageDown" ? 5 : 1;
      const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1 : Math.max(0, Math.min(enabled.length - 1, index + delta));
      setActive(enabled[next]?.value ?? "");
    } else if (event.key === "Enter" || (event.key === " " && !searching)) {
      event.preventDefault();
      if (!open) show(); else { const option = enabled.find(option => option.value === active); if (option) choose(option); }
    } else if (!searching && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = event.timeStamp;
      typeahead.current = { value: (now - typeahead.current.at < 600 ? typeahead.current.value : "") + event.key.toLocaleLowerCase(locale), at: now };
      const match = options.find(option => !option.disabled && option.label.toLocaleLowerCase(locale).startsWith(typeahead.current.value));
      if (match) { if (!open) show(); setActive(match.value); }
    }
  };
  useEffect(() => {
    if (!open) return;
    // Only one panel selector should remain open, even when two share a scroll container.
    const event = new CustomEvent("qodeforge-select-open", { detail: id });
    window.dispatchEvent(event);
    const closeOther = (event: Event) => { if ((event as CustomEvent).detail !== id) setOpen(false); };
    window.addEventListener("qodeforge-select-open", closeOther);
    if (searchable) searchInput.current?.focus();
    return () => window.removeEventListener("qodeforge-select-open", closeOther);
  }, [open, searchable, id]);
  useEffect(() => {
    if (open) panel.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active, panel]);

  return <>
    {labelContent}
    <button id={id} ref={trigger} type="button" role="combobox" aria-label={labelledBy ? undefined : label ?? (selected.map(option => option.label).join(", ") || fallback)} aria-labelledby={labelledBy} aria-describedby={describedBy} aria-invalid={invalid || undefined} aria-haspopup="listbox" aria-controls={open && !disabled ? listId : undefined} aria-expanded={open && !disabled} aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined} disabled={disabled} onBlur={onBlur} onKeyDown={keyboard} onClick={() => open ? setOpen(false) : show()} className={`panel-select-trigger ${className}`} style={style}>
      <span className="panel-select-value">{selected.length ? selected.map(option => option.label).join(fa ? "، " : ", ") : fallback}</span><ChevronDown className="panel-select-chevron" aria-hidden="true" />
    </button>
    {presence.present && createPortal(<div {...presence.attributes} ref={panel} className="panel-popover panel-select-popover" style={position} dir={fa ? "rtl" : "ltr"} onKeyDown={keyboard}>
      {searchable && <div className="panel-select-search"><Search size={16} aria-hidden="true" /><input ref={searchInput} type="search" autoComplete="off" aria-label={searchPlaceholder ?? (fa ? "جستجوی گزینه‌ها" : "Search options")} value={search} onChange={event => { const query = event.target.value; setSearch(query); setActive(options.find(option => !option.disabled && option.label.toLocaleLowerCase(locale).includes(query.toLocaleLowerCase(locale)))?.value ?? ""); }} placeholder={searchPlaceholder ?? (fa ? "جستجوی گزینه‌ها…" : "Search options…")} aria-controls={listId} aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined} />{search && <button type="button" aria-label={fa ? "پاک کردن جستجو" : "Clear search"} onClick={() => { setSearch(""); searchInput.current?.focus(); }}><X size={15} /></button>}</div>}
      <div id={listId} role="listbox" aria-label={name} aria-multiselectable={multiple || undefined} className="panel-select-options">
        {filtered.map((option, index) => <div key={`${option.value}-${index}`}>
          {option.group && (index === 0 || filtered[index - 1].group !== option.group) && <div className="panel-select-group">{option.group}</div>}
          <div id={`${listId}-${index}`} role="option" aria-selected={values.includes(option.value)} aria-disabled={option.disabled || undefined} data-active={active === option.value} className="panel-select-option" onPointerMove={() => { if (!option.disabled) setActive(option.value); }} onMouseDown={event => event.preventDefault()} onClick={() => choose(option)}><span>{option.label}</span>{values.includes(option.value) && <Check size={16} aria-hidden="true" />}</div>
        </div>)}
        {!filtered.length && <p className="panel-select-empty">{fa ? "گزینه‌ای پیدا نشد" : "No options found"}</p>}
      </div>
    </div>, document.body)}
  </>;
}
