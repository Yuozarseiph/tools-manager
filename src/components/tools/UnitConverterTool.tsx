"use client";

import { useState, useEffect } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ArrowLeftRight, Ruler, Weight, Thermometer } from "lucide-react";
import {
  useToolContent,
  type UnitConverterToolContent,
} from "@/hooks/useToolContent";

const baseCategories = {
  length: {
    icon: Ruler,
    units: {
      m: { factor: 1 },
      km: { factor: 1000 },
      cm: { factor: 0.01 },
      mm: { factor: 0.001 },
      in: { factor: 0.0254 },
      ft: { factor: 0.3048 },
      yd: { factor: 0.9144 },
      mi: { factor: 1609.34 },
    },
  },
  mass: {
    icon: Weight,
    units: {
      kg: { factor: 1 },
      g: { factor: 0.001 },
      mg: { factor: 0.000001 },
      lb: { factor: 0.453592 },
      oz: { factor: 0.0283495 },
    },
  },
  temperature: {
    icon: Thermometer,
    units: {
      c: { factor: 1 },
      f: { factor: 1 },
      k: { factor: 1 },
    },
  },
} as const;

// کلید کتگوری
type CategoryKey = keyof typeof baseCategories;

// واحدهای هر کتگوری
type LengthUnit = keyof typeof baseCategories.length.units;
type MassUnit = keyof typeof baseCategories.mass.units;
type TemperatureUnit = keyof typeof baseCategories.temperature.units;

// واحدهای برای state (یونیون)
type AnyUnitKey = LengthUnit | MassUnit | TemperatureUnit;

// واحدهای کتگوری‌ای که factor دارند
type FactorUnit = LengthUnit | MassUnit;

export default function UnitConverterTool() {
  const theme = useThemeColors();
  const content = useToolContent<UnitConverterToolContent>("unit-converter");

  const [category, setCategory] = useState<CategoryKey>("length");
  const [amount, setAmount] = useState<string>("1");
  const [fromUnit, setFromUnit] = useState<AnyUnitKey>("m");
  const [toUnit, setToUnit] = useState<AnyUnitKey>("km");
  const [result, setResult] = useState<string>("");

  // وقتی کتگوری عوض می‌شود، واحدهای پیش‌فرض را از همان کتگوری تنظیم کن
  useEffect(() => {
    const units = Object.keys(baseCategories[category].units) as AnyUnitKey[];
    setFromUnit(units[0]);
    setToUnit(units[1] ?? units[0]);
  }, [category]);

  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) {
      setResult("");
      return;
    }

    let converted = 0;

    if (category === "temperature") {
      // تبدیل دما با فرمول
      const f = fromUnit as TemperatureUnit;
      const t = toUnit as TemperatureUnit;

      if (f === t) converted = val;
      else if (f === "c" && t === "f") converted = (val * 9) / 5 + 32;
      else if (f === "c" && t === "k") converted = val + 273.15;
      else if (f === "f" && t === "c") converted = ((val - 32) * 5) / 9;
      else if (f === "f" && t === "k")
        converted = ((val - 32) * 5) / 9 + 273.15;
      else if (f === "k" && t === "c") converted = val - 273.15;
      else if (f === "k" && t === "f")
        converted = ((val - 273.15) * 9) / 5 + 32;
    } else {
      // کتگوری طول یا جرم با factor
      const units = baseCategories[category].units;

      const f = fromUnit as FactorUnit;
      const t = toUnit as FactorUnit;

      const fromFactor = (units as any)[f]?.factor as number | undefined;
      const toFactor = (units as any)[t]?.factor as number | undefined;

      if (!fromFactor || !toFactor) {
        setResult("");
        return;
      }

      converted = (val * fromFactor) / toFactor;
    }

    const finalStr = Number.isInteger(converted)
      ? converted.toString()
      : converted.toFixed(4).replace(/\.?0+$/, "");

    setResult(finalStr);
  }, [amount, fromUnit, toUnit, category]);

  const catContent = content.ui.categories;

  const unitKeysForCategory = (cat: CategoryKey): AnyUnitKey[] =>
    Object.keys(baseCategories[cat].units) as AnyUnitKey[];

  return (
    <div
      className={`max-w-3xl mx-auto rounded-3xl border p-6 md:p-10 shadow-xl ${theme.card} ${theme.border}`}
    >
      {/* دسته‌بندی‌ها */}
      <div className="flex gap-2 overflow-x-auto pb-6 mb-6 border-b border-dashed custom-scrollbar">
        {(Object.keys(baseCategories) as CategoryKey[]).map((key) => {
          const Icon = baseCategories[key].icon;
          const label = catContent[key].label;
          const isActive = category === key;
          return (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? `${theme.primary} shadow-lg`
                  : `${theme.bg} ${theme.text} border ${theme.border} hover:brightness-95`
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          );
        })}
      </div>

      {/* ورودی/خروجی */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        {/* ورودی */}
        <div className="space-y-3">
          <label className={`text-sm font-bold ${theme.textMuted}`}>
            {content.ui.input.amountLabel}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`w-full p-4 text-xl font-bold rounded-2xl border focus:ring-2 ring-blue-500/50 outline-none ${theme.bg} ${theme.border} ${theme.text}`}
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value as AnyUnitKey)}
            className={`w-full p-3 rounded-xl border cursor-pointer ${theme.bg} ${theme.border} ${theme.text}`}
          >
            {unitKeysForCategory(category).map((key) => (
              <option key={key} value={key}>
                {catContent[category].units[key]}
              </option>
            ))}
          </select>
        </div>

        {/* آیکن وسط */}
        <div
          className={`flex justify-center p-3 rounded-full ${theme.secondary}`}
        >
          <ArrowLeftRight size={24} className={theme.accent} />
        </div>

        {/* خروجی */}
        <div className="space-y-3">
          <label className={`text-sm font-bold ${theme.textMuted}`}>
            {content.ui.input.resultLabel}
          </label>
          <div
            className={`w-full p-4 text-xl font-black rounded-2xl border flex items-center bg-zinc-50 dark:bg-zinc-900/50 ${theme.border} ${theme.text}`}
          >
            {result || "..."}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value as AnyUnitKey)}
            className={`w-full p-3 rounded-xl border cursor-pointer ${theme.bg} ${theme.border} ${theme.text}`}
          >
            {unitKeysForCategory(category).map((key) => (
              <option key={key} value={key}>
                {catContent[category].units[key]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
