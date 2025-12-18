// components/tools/calendar/date-converter/DateConverterTool.tsx
"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  Copy,
  Check,
  CalendarDays,
  ArrowLeftRight,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const jalaali: any = require("jalaali-js");

import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import {
  useDateConverterContent,
  type DateConverterToolContent,
} from "./date-converter.content";

type Mode = "shamsi-to-gregorian" | "gregorian-to-shamsi";

function normalizeDigits(input: string) {
  let s = String(input ?? "");

  const persianMap: Record<string, string> = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };
  s = s.replace(/[۰-۹]/g, (d) => persianMap[d] ?? d);

  const arabicIndicMap: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  s = s.replace(/[٠-٩]/g, (d) => arabicIndicMap[d] ?? d);

  s = s.replace(/[^0-9]/g, "");
  return s;
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function isValidGregorianDate(y: number, m: number, d: number) {
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

function pad2(s: string) {
  const v = normalizeDigits(s);
  if (!v) return "";
  return v.padStart(2, "0").slice(-2);
}

function safeWriteClipboard(text: string) {
  if (!text) return Promise.resolve(false);

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return Promise.resolve(!!ok);
  } catch {
    return Promise.resolve(false);
  }
}

export default function DateConverterTool() {
  const theme = useThemeColors();
  const { locale } = useLanguage();
  const content: DateConverterToolContent = useDateConverterContent();

  const [mode, setMode] = useState<Mode>("shamsi-to-gregorian");

  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const uiText = useMemo(() => {
    const isFa = locale === "fa";
    return {
      today: isFa ? "امروز" : "Today",
      swap: isFa ? "جابجایی" : "Swap",
      copy: isFa ? "کپی" : "Copy",
      copied: isFa ? "کپی شد" : "Copied",
    };
  }, [locale]);

  const invalidText = content.ui.result.invalid;
  const isInvalid = result === invalidText;

  const yearPlaceholder =
    mode === "shamsi-to-gregorian"
      ? content.ui.inputs.placeholderShamsiYear
      : content.ui.inputs.placeholderGregorianYear;

  const setTodayByMode = () => {
    const now = new Date();
    if (mode === "gregorian-to-shamsi") {
      setYear(String(now.getFullYear()));
      setMonth(String(now.getMonth() + 1));
      setDay(String(now.getDate()));
    } else {
      const j = jalaali.toJalaali(now);
      setYear(String(j.jy));
      setMonth(String(j.jm));
      setDay(String(j.jd));
    }
  };

  useEffect(() => {
    setTodayByMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    const y = parseInt(normalizeDigits(year), 10);
    const m = parseInt(normalizeDigits(month), 10);
    const d = parseInt(normalizeDigits(day), 10);

    if (!y || !m || !d) {
      setResult("");
      return;
    }

    try {
      if (mode === "shamsi-to-gregorian") {
        if (!jalaali.isValidJalaaliDate(y, m, d)) {
          setResult(invalidText);
          return;
        }
        const g = jalaali.toGregorian(y, m, d);
        setResult(
          `${g.gy}-${String(g.gm).padStart(2, "0")}-${String(g.gd).padStart(
            2,
            "0"
          )}`
        );
        return;
      }

      if (!isValidGregorianDate(y, m, d)) {
        setResult(invalidText);
        return;
      }

      const j = jalaali.toJalaali(y, m, d);
      setResult(
        `${j.jy}/${String(j.jm).padStart(2, "0")}/${String(j.jd).padStart(
          2,
          "0"
        )}`
      );
    } catch {
      setResult(invalidText);
    }
  }, [day, month, year, mode, invalidText]);

  const handleCopy = async () => {
    if (!result || isInvalid) return;

    const ok = await safeWriteClipboard(result);
    if (!ok) return;

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwapModeKeepDate = () => {
    const y = parseInt(normalizeDigits(year), 10);
    const m = parseInt(normalizeDigits(month), 10);
    const d = parseInt(normalizeDigits(day), 10);

    if (!y || !m || !d) {
      setMode((p) =>
        p === "shamsi-to-gregorian"
          ? "gregorian-to-shamsi"
          : "shamsi-to-gregorian"
      );
      return;
    }

    try {
      if (mode === "shamsi-to-gregorian") {
        if (!jalaali.isValidJalaaliDate(y, m, d)) {
          setMode("gregorian-to-shamsi");
          return;
        }
        const g = jalaali.toGregorian(y, m, d);
        setMode("gregorian-to-shamsi");
        setYear(String(g.gy));
        setMonth(String(g.gm));
        setDay(String(g.gd));
        return;
      }

      if (!isValidGregorianDate(y, m, d)) {
        setMode("shamsi-to-gregorian");
        return;
      }

      const j = jalaali.toJalaali(y, m, d);
      setMode("shamsi-to-gregorian");
      setYear(String(j.jy));
      setMonth(String(j.jm));
      setDay(String(j.jd));
    } catch {
      setMode((p) =>
        p === "shamsi-to-gregorian"
          ? "gregorian-to-shamsi"
          : "shamsi-to-gregorian"
      );
    }
  };

  const modeButtonBase =
    "py-3 rounded-xl text-sm font-bold transition-all duration-200 w-full";
  const activeModeClass = `${theme.primary}`;
  const inactiveModeClass = `border ${theme.border} ${theme.text} opacity-70 hover:opacity-90`;

  return (
    <div
      className={`max-w-2xl mx-auto rounded-3xl border p-5 sm:p-8 shadow-xl ${theme.card} ${theme.border}`}
    >
      <div className="flex flex-col gap-3 mb-6 sm:mb-8">
        <div
          className={`grid grid-cols-2 p-1 rounded-2xl ${theme.bg} border ${theme.border}`}
        >
          <button
            type="button"
            onClick={() => setMode("shamsi-to-gregorian")}
            className={`${modeButtonBase} ${
              mode === "shamsi-to-gregorian"
                ? activeModeClass
                : inactiveModeClass
            }`}
          >
            {content.ui.modes.shamsiToGregorian}
          </button>

          <button
            type="button"
            onClick={() => setMode("gregorian-to-shamsi")}
            className={`${modeButtonBase} ${
              mode === "gregorian-to-shamsi"
                ? activeModeClass
                : inactiveModeClass
            }`}
          >
            {content.ui.modes.gregorianToShamsi}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={setTodayByMode}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
          >
            <CalendarDays size={18} className={theme.textMuted} />
            <span className="text-sm font-bold">{uiText.today}</span>
          </button>

          <button
            type="button"
            onClick={handleSwapModeKeepDate}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
          >
            <ArrowLeftRight size={18} className={theme.textMuted} />
            <span className="text-sm font-bold">{uiText.swap}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <InputGroup
          label={content.ui.inputs.dayLabel}
          value={day}
          setValue={setDay}
          placeholder="01"
          theme={theme}
          maxLen={2}
          onBlurPad2
        />
        <InputGroup
          label={content.ui.inputs.monthLabel}
          value={month}
          setValue={setMonth}
          placeholder="01"
          theme={theme}
          maxLen={2}
          onBlurPad2
        />
        <InputGroup
          label={content.ui.inputs.yearLabel}
          value={year}
          setValue={setYear}
          placeholder={yearPlaceholder}
          theme={theme}
          maxLen={4}
        />
      </div>

      <div className="flex justify-center mb-5 sm:mb-6">
        <div
          className={`p-3 rounded-full border ${theme.border} ${theme.secondary}`}
        >
          <ArrowDown size={24} className={theme.accent} />
        </div>
      </div>

      <div
        className={[
          "relative p-5 sm:p-6 rounded-2xl border-2 text-center transition-colors",
          theme.bg,
          theme.border,
          isInvalid
            ? `${theme.note.errorBorder} ${theme.note.errorBg}`
            : `${theme.border}`,
        ].join(" ")}
      >
        <span
          className={`text-xs font-bold absolute top-4 right-4 ${theme.textMuted}`}
        >
          {content.ui.result.title}
        </span>

        <div
          className={`text-2xl sm:text-3xl font-black tracking-widest break-all ${
            isInvalid ? theme.note.errorText : theme.text
          }`}
        >
          {result || "..."}
        </div>

        {result && !isInvalid && (
          <button
            type="button"
            onClick={handleCopy}
            className={`absolute bottom-4 left-4 p-2 rounded-lg border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
            title={copied ? uiText.copied : uiText.copy}
          >
            {copied ? (
              <Check size={18} className={theme.accent} />
            ) : (
              <Copy size={18} className={theme.textMuted} />
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
  maxLen,
  onBlurPad2,
}: {
  label: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  placeholder: string;
  theme: any;
  maxLen: number;
  onBlurPad2?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className={`text-xs font-bold ${theme.textMuted}`}>{label}</label>

      <input
        inputMode="numeric"
        type="text"
        value={value}
        onChange={(e) => {
          const raw = e.target.value;
          const clean = normalizeDigits(raw);
          setValue(clean.slice(0, maxLen));
        }}
        onBlur={() => {
          if (!onBlurPad2) return;
          setValue((prev) => pad2(prev));
        }}
        placeholder={placeholder}
        className={[
          "w-full p-4 text-center text-xl font-bold rounded-2xl border outline-none focus:ring-2 transition-colors",
          theme.bg,
          theme.border,
          theme.text,
          theme.ring,
        ].join(" ")}
      />
    </div>
  );
}
