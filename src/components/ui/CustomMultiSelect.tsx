"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { useThemeColors } from "@/hooks/useThemeColors";

interface CustomMultiSelectProps {
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  label?: string;
  placeholder?: string;
}

export default function CustomMultiSelect({
  options,
  selectedValues,
  onChange,
  label,
  placeholder = "انتخاب کنید...",
}: CustomMultiSelectProps) {
  const theme = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== option));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className={`text-xs font-bold mb-2 block ${theme.textMuted}`}>
          {label}
        </label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[42px] w-full px-3 py-2 rounded-xl border cursor-pointer flex items-center justify-between flex-wrap gap-2 transition-all ${
          theme.bg
        } ${theme.text} ${
          isOpen ? "border-blue-500 ring-4 ring-blue-500/10" : theme.border
        }`}
      >
        <div className="flex flex-wrap gap-2">
          {selectedValues.length > 0 ? (
            selectedValues.map((val) => (
              <span
                key={val}
                className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-xs px-2 py-1 rounded-md flex items-center gap-1"
              >
                {val}
                <X
                  size={12}
                  className="cursor-pointer hover:text-red-500"
                  onClick={(e) => removeOption(val, e)}
                />
              </span>
            ))
          ) : (
            <span className="opacity-50 text-sm">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform ${
            isOpen ? "rotate-180" : ""
          } opacity-50`}
        />
      </div>

      {/* Dropdown List */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full mt-2 p-1 rounded-xl border shadow-xl max-h-60 overflow-y-auto ${theme.card} ${theme.border}`}
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                selectedValues.includes(option)
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                  : `hover:bg-gray-100 dark:hover:bg-white/5 ${theme.text}`
              }`}
            >
              <span>{option}</span>
              {selectedValues.includes(option) && <Check size={16} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
