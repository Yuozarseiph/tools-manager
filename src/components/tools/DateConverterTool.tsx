"use client";

import { useState, useEffect } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { ArrowDown, CalendarDays, Copy, Check } from "lucide-react";
const jalaali = require("jalaali-js");

import {
  useToolContent,
  type DateConverterToolContent,
} from "@/hooks/useToolContent";

export default function DateConverterTool() {
  const theme = useThemeColors();
  const content = useToolContent<DateConverterToolContent>("date-converter");

  const [mode, setMode] = useState<
    "shamsi-to-gregorian" | "gregorian-to-shamsi"
  >("shamsi-to-gregorian");

  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const now = new Date();
    if (mode === "gregorian-to-shamsi") {
      setYear(now.getFullYear().toString());
      setMonth((now.getMonth() + 1).toString());
      setDay(now.getDate().toString());
    } else {
      const j = jalaali.toJalaali(now);
      setYear(j.jy.toString());
      setMonth(j.jm.toString());
      setDay(j.jd.toString());
    }
  }, [mode]);

  useEffect(() => {
    const y = parseInt(year);
    const m = parseInt(month);
    const d = parseInt(day);

    if (!y || !m || !d) {
      setResult("");
      return;
    }

    try {
      if (mode === "shamsi-to-gregorian") {
        if (!jalaali.isValidJalaaliDate(y, m, d)) {
          setResult(content.ui.result.invalid);
          return;
        }
        const g = jalaali.toGregorian(y, m, d);
        setResult(
          `${g.gy}-${String(g.gm).padStart(2, "0")}-${String(g.gd).padStart(
            2,
            "0"
          )}`
        );
      } else {
        const j = jalaali.toJalaali(y, m, d);
        setResult(
          `${j.jy}/${String(j.jm).padStart(2, "0")}/${String(j.jd).padStart(
            2,
            "0"
          )}`
        );
      }
    } catch {
      setResult(content.ui.result.invalid);
    }
  }, [day, month, year, mode, content.ui.result.invalid]);

  const invalidText = content.ui.result.invalid;
  const isInvalid = result === invalidText;

  const handleCopy = () => {
    if (!result || isInvalid) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const yearPlaceholder =
    mode === "shamsi-to-gregorian"
      ? content.ui.inputs.placeholderShamsiYear
      : content.ui.inputs.placeholderGregorianYear;

  return (
    <div
      className={`max-w-2xl mx-auto rounded-3xl border p-8 shadow-xl ${theme.card} ${theme.border}`}
    >
      <div
        className={`grid grid-cols-2 p-1 rounded-2xl mb-8 ${theme.bg} border ${theme.border}`}
      >
        <button
          onClick={() => setMode("shamsi-to-gregorian")}
          className={`py-3 rounded-xl text-sm font-bold transition-all ${
            mode === "shamsi-to-gregorian"
              ? "bg-white shadow-md text-blue-600 dark:bg-zinc-800 dark:text-blue-400"
              : "opacity-60"
          }`}
        >
          {content.ui.modes.shamsiToGregorian}
        </button>
        <button
          onClick={() => setMode("gregorian-to-shamsi")}
          className={`py-3 rounded-xl text-sm font-bold transition-all ${
            mode === "gregorian-to-shamsi"
              ? "bg-white shadow-md text-blue-600 dark:bg-zinc-800 dark:text-blue-400"
              : "opacity-60"
          }`}
        >
          {content.ui.modes.gregorianToShamsi}
        </button>
      </div>

      {/* ورودی‌ها */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <InputGroup
          label={content.ui.inputs.dayLabel}
          value={day}
          setValue={setDay}
          placeholder="01"
          theme={theme}
        />
        <InputGroup
          label={content.ui.inputs.monthLabel}
          value={month}
          setValue={setMonth}
          placeholder="01"
          theme={theme}
        />
        <InputGroup
          label={content.ui.inputs.yearLabel}
          value={year}
          setValue={setYear}
          placeholder={yearPlaceholder}
          theme={theme}
        />
      </div>

      <div className="flex justify-center mb-6">
        <div className={`p-3 rounded-full ${theme.secondary}`}>
          <ArrowDown size={24} className={theme.accent} />
        </div>
      </div>

      {/* خروجی */}
      <div
        className={`relative p-6 rounded-2xl border-2 text-center transition-colors ${theme.bg} ${theme.border} ${
          isInvalid
            ? "border-red-500 bg-red-50 dark:bg-red-900/20"
            : "border-blue-500/30"
        }`}
      >
        <span className="text-xs font-bold text-zinc-400 absolute top-4 right-4">
          {content.ui.result.title}
        </span>
        <div
          className={`text-3xl font-black tracking-widest ${
            isInvalid ? "text-red-500" : theme.text
          }`}
        >
          {result || "..."}
        </div>

        {result && !isInvalid && (
          <button
            onClick={handleCopy}
            className="absolute bottom-4 left-4 p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {copied ? (
              <Check size={18} className="text-green-500" />
            ) : (
              <Copy size={18} className="text-zinc-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function InputGroup({
  label,
  value,
  setValue,
  placeholder,
  theme,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  placeholder: string;
  theme: any;
}) {
  return (
    <div className="space-y-2">
      <label
        className={`text-xs font-bold ${theme.textMuted}`}
      >
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const val = e.target.value;
          if (val.length <= 4) setValue(val);
        }}
        placeholder={placeholder}
        className={`w-full p-4 text-center text-xl font-bold rounded-2xl border focus:ring-2 ring-blue-500/50 outline-none ${theme.bg} ${theme.border} ${theme.text}`}
      />
    </div>
  );
}
