"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeftRight, Copy, Check, Search } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import CustomDropdown from "@/components/ui/CustomDropdown";
import {
  useUnitConverterContent,
  type UnitConverterToolContent,
} from "./unit-converter.content";
import { CATEGORIES, convert, formatResult, type CategoryKey } from "./units.data";

export default function UnitConverterTool() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const isRTL = locale === "fa";
  const content: UnitConverterToolContent = useUnitConverterContent();
  const catContent = content.ui.categories;
  const ui = content.ui.input;

  const [category, setCategory] = useState<CategoryKey>("length");
  const [amount, setAmount] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<string>("m");
  const [toUnit, setToUnit] = useState<string>("km");
  const [copied, setCopied] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  const unitKeys = useMemo(
    () => Object.keys(CATEGORIES[category].units),
    [category],
  );

  // When the category changes, reset the units to sensible defaults.
  useEffect(() => {
    const keys = Object.keys(CATEGORIES[category].units);
    setFromUnit(keys[0]);
    setToUnit(keys[1] ?? keys[0]);
  }, [category]);

  const result = useMemo(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) return "";
    const out = convert(val, category, fromUnit, toUnit);
    if (out === null) return "";
    return formatResult(out);
  }, [amount, category, fromUnit, toUnit]);

  const handleSwap = useCallback(() => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }, [fromUnit, toUnit]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [result]);

  const categoryKeys = Object.keys(CATEGORIES) as CategoryKey[];
  const filteredCategories = useMemo(() => {
    const q = catSearch.trim().toLowerCase();
    if (!q) return categoryKeys;
    return categoryKeys.filter((k) =>
      catContent[k].label.toLowerCase().includes(q),
    );
  }, [catSearch, catContent, categoryKeys]);

  const unitLabel = (cat: CategoryKey, key: string) =>
    (catContent[cat].units as Record<string, string>)[key] ?? key;

  const unitOptions = useMemo(
    () =>
      unitKeys.map((key) => ({ value: key, label: unitLabel(category, key) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [unitKeys, category, catContent],
  );

  return (
    <div
      className={`max-w-3xl mx-auto rounded-3xl border p-5 md:p-10 shadow-xl ${theme.card} ${theme.border}`}
    >
      {/* Category search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? "right-3" : "left-3"} ${theme.textMuted}`}
        />
        <input
          type="text"
          value={catSearch}
          onChange={(e) => setCatSearch(e.target.value)}
          placeholder={ui.search}
          className={`w-full py-2.5 ${isRTL ? "pr-10 pl-3" : "pl-10 pr-3"} rounded-xl border text-sm outline-none focus:ring-2 ring-blue-500/40 ${theme.bg} ${theme.border} ${theme.text}`}
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap pb-6 mb-6 border-b border-dashed max-h-40 overflow-y-auto custom-scrollbar">
        {filteredCategories.length === 0 && (
          <span className={`text-sm ${theme.textMuted}`}>{ui.noResult}</span>
        )}
        {filteredCategories.map((key) => {
          const Icon = CATEGORIES[key].icon;
          const label = catContent[key].label;
          const isActive = category === key;
          return (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? `${theme.primary} shadow-lg`
                  : `${theme.bg} ${theme.text} border ${theme.border} hover:brightness-95`
              }`}
            >
              <Icon size={16} /> {label}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-center">
        {/* From */}
        <div className="space-y-3">
          <label className={`text-sm font-bold ${theme.textMuted}`}>
            {ui.amountLabel}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full p-4 text-xl font-bold rounded-2xl border focus:ring-2 ring-blue-500/50 outline-none ${theme.bg} ${theme.border} ${theme.text}`}
            dir="ltr"
          />
          <CustomDropdown
            options={unitOptions}
            value={fromUnit}
            onChange={setFromUnit}
            searchPlaceholder={ui.search}
          />
        </div>

        {/* Swap */}
        <button
          onClick={handleSwap}
          title={ui.swap}
          className={`mx-auto flex justify-center p-3 rounded-full transition-transform hover:rotate-180 duration-300 ${theme.secondary}`}
        >
          <ArrowLeftRight size={22} className={theme.accent} />
        </button>

        {/* To */}
        <div className="space-y-3">
          <label className={`text-sm font-bold ${theme.textMuted}`}>
            {ui.resultLabel}
          </label>
          <div
            className={`relative w-full p-4 text-xl font-black rounded-2xl border flex items-center bg-zinc-50 dark:bg-zinc-900/50 ${theme.border} ${theme.text}`}
            dir="ltr"
          >
            <span className="truncate flex-1">{result || "..."}</span>
            {result && (
              <button
                onClick={handleCopy}
                title={copied ? ui.copied : ui.copy}
                className={`shrink-0 p-1.5 rounded-lg transition-colors ${theme.textMuted} hover:bg-black/5 dark:hover:bg-white/10`}
              >
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            )}
          </div>
          <CustomDropdown
            options={unitOptions}
            value={toUnit}
            onChange={setToUnit}
            searchPlaceholder={ui.search}
          />
        </div>
      </div>
    </div>
  );
}
