"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
interface Props { options: string[]; selectedValues: string[]; onChange: (values: string[]) => void; label?: string; placeholder?: string }
export default function CustomMultiSelect({ options, selectedValues, onChange, label, placeholder = "انتخاب کنید..." }: Props) {
  const theme = useThemeColors(); const { locale } = useLanguage(); const listId = useId();
  const [isOpen, setIsOpen] = useState(false); const root = useRef<HTMLDivElement>(null); const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const outside = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setIsOpen(false); };
    document.addEventListener("mousedown", outside); return () => document.removeEventListener("mousedown", outside);
  }, []);
  const toggle = (value: string) => onChange(selectedValues.includes(value) ? selectedValues.filter(item => item !== value) : [...selectedValues, value]);
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); setIsOpen(false); trigger.current?.focus(); }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault(); if (!isOpen) { setIsOpen(true); return; }
      const items = [...(root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])];
      const current = items.indexOf(document.activeElement as HTMLButtonElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowDown" ? (current + 1) % items.length : (current <= 0 ? items.length - 1 : current - 1);
      items[next]?.focus();
    }
  };
  return <div className="relative" ref={root} onKeyDown={key} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false); }}>
    {label && <label htmlFor={`${listId}-trigger`} className={`mb-2 block text-xs font-bold ${theme.textMuted}`}>{label}</label>}
    <div className={`flex min-h-[44px] w-full flex-wrap items-center justify-between gap-2 rounded-xl border px-3 py-2 ${theme.bg} ${theme.text} ${isOpen ? "border-[var(--app-accent)] ring-4 ring-[var(--app-accent)]/10" : theme.border}`}>
      <div className="flex flex-wrap gap-2">{selectedValues.map(value => <span key={value} className="flex items-center gap-1 rounded-md bg-[var(--app-secondary-bg)] px-2 py-1 text-xs text-[var(--app-accent)]">
        {value}<button type="button" className="inline-flex items-center justify-center" aria-label={locale === "fa" ? `حذف ${value}` : `Remove ${value}`} onClick={() => toggle(value)}><X size={12} aria-hidden="true" /></button>
      </span>)}</div>
      <button id={`${listId}-trigger`} ref={trigger} type="button" aria-label={label ?? placeholder} aria-expanded={isOpen} aria-haspopup="listbox" aria-controls={listId}
        className="flex min-h-11 flex-1 items-center justify-between gap-2 text-start" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-sm">{selectedValues.length === 0 ? placeholder : label}</span><ChevronDown size={16} aria-hidden="true" className={isOpen ? "rotate-180" : ""} />
      </button>
    </div>
    {isOpen && <div id={listId} role="listbox" aria-multiselectable="true" aria-label={label ?? placeholder} className={`absolute z-50 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border p-1 shadow-xl ${theme.card} ${theme.border}`}>
      {options.map(option => <button key={option} type="button" role="option" aria-selected={selectedValues.includes(option)} onClick={() => toggle(option)}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${selectedValues.includes(option) ? "bg-[var(--app-secondary-bg)] text-[var(--app-accent)]" : theme.text}`}>
        <span>{option}</span>{selectedValues.includes(option) && <Check size={16} aria-hidden="true" />}
      </button>)}
    </div>}
  </div>;
}
