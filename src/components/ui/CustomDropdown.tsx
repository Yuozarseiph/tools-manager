"use client";
import { AccessibleInput } from "@/components/ui/AccessibleControls";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[] | string[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = "انتخاب کنید...",
  className = "",
  disabled = false,
  searchable = true,
  searchPlaceholder = "جستجو...",
}: CustomDropdownProps) {
  const theme = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const listId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const normalizedOptions: Option[] = useMemo(
    () =>
      options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt,
      ),
    [options],
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const query = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) =>
      opt.label.toLowerCase().includes(query),
    );
  }, [normalizedOptions, searchQuery]);

  const selectedOption = useMemo(
    () => normalizedOptions.find((opt) => opt.value === value),
    [normalizedOptions, value],
  );

  const handleKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { event.preventDefault(); setIsOpen(false); triggerRef.current?.focus(); }
    if (event.key === "Tab") setIsOpen(false);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      if (!isOpen) { setIsOpen(true); return; }
      const options = [...(dropdownRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])];
      const current = options.indexOf(document.activeElement as HTMLButtonElement);
      const index = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : event.key === "ArrowDown" ? (current + 1) % options.length : (current <= 0 ? options.length - 1 : current - 1);
      options[index]?.focus();
    }
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isOpen && searchable && searchInputRef.current) {
      timer = setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      timer = setTimeout(() => setSearchQuery(""), 0);
    }
    return () => clearTimeout(timer);
  }, [isOpen, searchable]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside, {
      passive: true,
    });
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => { if (disabled) setIsOpen(false); });
    return () => cancelAnimationFrame(frame);
  }, [disabled]);

  return (
    <div ref={dropdownRef} onKeyDown={handleKeyboard} className={`relative ${className}`}>
      {label && (
        <label htmlFor={`${listId}-trigger`} className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
          {label}
        </label>
      )}
      <button
        id={`${listId}-trigger`}
        ref={triggerRef}
        aria-label={label ?? placeholder}
        aria-haspopup="listbox"
        aria-controls={listId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200 outline-none focus:ring-2 ${theme.bg} ${theme.text} ${theme.border} ${theme.ring} ${disabled ? "cursor-not-allowed border-dashed" : "cursor-pointer hover:opacity-90"}`}
        aria-expanded={isOpen}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""} ${theme.textMuted}`}
        />
      </button>
      <div
        className={`absolute z-[70] w-full mt-2 rounded-xl border shadow-xl origin-top transition-all duration-200 ease-out ${theme.card} ${theme.border} ${isOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 -translate-y-2 invisible pointer-events-none"}`}
      >
        {searchable && (
          <div className={`p-2 border-b ${theme.border}`}>
            <div className="relative">
              <Search
                size={14}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
              />
              <AccessibleInput
                aria-label={searchPlaceholder}
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={`w-full pl-9 pr-8 py-2 text-sm rounded-lg border ${theme.border} ${theme.bg} ${theme.text} outline-none focus:ring-1 ${theme.ring}`}
                onClick={(e) => e.stopPropagation()}
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label={searchPlaceholder}
                  onClick={() => setSearchQuery("")}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full ${theme.textMuted} hover:${theme.text}`}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>
        )}
        <div id={listId} role="listbox" aria-label={label ?? placeholder} className="max-h-60 overflow-y-auto p-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const active = value === option.value;
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  tabIndex={isOpen ? 0 : -1}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${active ? `${theme.secondary} font-medium` : `${theme.text} hover:bg-gray-100 dark:hover:bg-white/10`}`}
                >
                  <span className="truncate">{option.label}</span>
                  {active && <Check size={16} className={theme.accent} />}
                </button>
              );
            })
          ) : (
            <div
              className={`px-4 py-3 text-sm text-center ${theme.text}`}
            >
              موردی یافت نشد
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
