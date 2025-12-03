'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[] | string[]; // هم آرایه رشته قبول کنه هم آرایه آبجکت
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function CustomDropdown({ 
  options, 
  value, 
  onChange, 
  label, 
  placeholder = "انتخاب کنید...",
  className = ""
}: CustomDropdownProps) {
  const theme = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // نرمال‌سازی آپشن‌ها به فرمت {value, label}
  const normalizedOptions: Option[] = options.map(opt => 
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedOption = normalizedOptions.find(opt => opt.value === value);

  // بستن دراپ‌داون وقتی بیرونش کلیک میشه
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
          {label}
        </label>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-200
          ${theme.bg} ${theme.text} 
          ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : `${theme.border} hover:border-gray-400 dark:hover:border-gray-600`}
        `}
      >
        <span className={`truncate ${!selectedOption ? 'opacity-50' : ''}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={18} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-500' : 'opacity-50'}`} 
        />
      </button>

      {/* Dropdown Menu */}
      <div className={`
        absolute z-50 w-full mt-2 py-1 rounded-xl border shadow-xl backdrop-blur-xl
        origin-top transition-all duration-200 ease-out
        ${theme.card} ${theme.border}
        ${isOpen ? 'opacity-100 scale-100 translate-y-0 visible' : 'opacity-0 scale-95 -translate-y-2 invisible'}
      `}>
        <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-1">
          {normalizedOptions.length > 0 ? (
            normalizedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                  ${value === option.value 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium' 
                    : `hover:bg-black/5 dark:hover:bg-white/5 ${theme.text}`}
                `}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check size={16} />}
              </button>
            ))
          ) : (
            <div className={`px-4 py-3 text-sm text-center opacity-50 ${theme.text}`}>
              موردی یافت نشد
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
