'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';

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
}

export default function CustomDropdown({
  options,
  value,
  onChange,
  label,
  placeholder = 'انتخاب کنید...',
  className = '',
  disabled = false,
}: CustomDropdownProps) {
  const theme = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const normalizedOptions: Option[] = useMemo(
    () => options.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt)),
    [options]
  );

  const selectedOption = useMemo(
    () => normalizedOptions.find((opt) => opt.value === value),
    [normalizedOptions, value]
  );

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside, { passive: true });
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // If disabled, keep it closed
  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {label && <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>{label}</label>}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((p) => !p)}
        className={[
          'w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200',
          'outline-none focus:ring-2',
          theme.bg,
          theme.text,
          theme.border,
          theme.ring,
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-90',
        ].join(' ')}
        aria-expanded={isOpen}
      >
        <span className={`truncate ${!selectedOption ? 'opacity-60' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          size={18}
          className={[
            'transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
            theme.textMuted,
          ].join(' ')}
        />
      </button>

      {/* Menu */}
      <div
        className={[
          'absolute z-[70] w-full mt-2 rounded-xl border shadow-xl',
          'origin-top transition-all duration-200 ease-out',
          theme.card,
          theme.border,
          isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible pointer-events-none',
        ].join(' ')}
      >
        <div className="max-h-60 overflow-y-auto p-1">
          {normalizedOptions.length > 0 ? (
            normalizedOptions.map((option) => {
              const active = value === option.value;
              return (
                <button
                  key={`${option.value}-${option.label}`}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={[
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                    active ? `${theme.secondary} font-medium` : `${theme.text} hover:opacity-90`,
                  ].join(' ')}
                >
                  <span className="truncate">{option.label}</span>
                  {active && <Check size={16} className={theme.accent} />}
                </button>
              );
            })
          ) : (
            <div className={`px-4 py-3 text-sm text-center opacity-60 ${theme.text}`}>موردی یافت نشد</div>
          )}
        </div>
      </div>
    </div>
  );
}
