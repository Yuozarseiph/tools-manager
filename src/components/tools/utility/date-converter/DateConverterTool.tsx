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
import { gregorianToHijri, hijriToGregorian } from "@tabby_ai/hijri-converter";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useLanguage } from "@/context/LanguageContext";
import {
  useDateConverterContent,
  type DateConverterToolContent,
} from "./date-converter.content";
import CustomDropdown from "@/components/ui/CustomDropdown";

type ConversionType =
  | "shamsi-to-gregorian"
  | "gregorian-to-shamsi"
  | "shamsi-to-hijri"
  | "hijri-to-shamsi"
  | "gregorian-to-hijri"
  | "hijri-to-gregorian";

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

function isValidGregorianDate(y: number, m: number, d: number) {
  const dt = new Date(y, m - 1, d);
  return (
    dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
  );
}

function isValidHijriDate(y: number, m: number, d: number) {
  try {
    const gDate = hijriToGregorian({ year: y, month: m, day: d });
    return !!gDate;
  } catch {
    return false;
  }
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

  const [conversion, setConversion] = useState<ConversionType>(
    "shamsi-to-gregorian",
  );

  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");

  const [result, setResult] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const [dayError, setDayError] = useState<string>("");
  const [monthError, setMonthError] = useState<string>("");
  const [yearError, setYearError] = useState<string>("");

  const uiText = useMemo(() => {
    const isFa = locale === "fa";
    return {
      today: isFa ? "امروز" : "Today",
      swap: isFa ? "جابجایی" : "Swap",
      copy: isFa ? "کپی" : "Copy",
      copied: isFa ? "کپی شد" : "Copied",
      invalidDay: isFa ? "روز نامعتبر" : "Invalid day",
      invalidMonth: isFa ? "ماه نامعتبر" : "Invalid month",
      invalidYear: isFa ? "سال نامعتبر" : "Invalid year",
    };
  }, [locale]);

  const invalidText = content.ui.result.invalid;
  const isInvalid = result === invalidText;

  const sourceCalendar = conversion.split("-")[0] as
    | "shamsi"
    | "gregorian"
    | "hijri";
  const targetCalendar = conversion.split("-")[2] as
    | "shamsi"
    | "gregorian"
    | "hijri";

  const yearPlaceholder = (() => {
    if (sourceCalendar === "shamsi")
      return content.ui.inputs.placeholderShamsiYear;
    if (sourceCalendar === "gregorian")
      return content.ui.inputs.placeholderGregorianYear;
    return content.ui.inputs.placeholderHijriYear;
  })();

  const conversionOptions = useMemo(() => {
    const c = content.ui.conversions;
    return [
      { value: "shamsi-to-gregorian", label: c.shamsiToGregorian },
      { value: "gregorian-to-shamsi", label: c.gregorianToShamsi },
      { value: "shamsi-to-hijri", label: c.shamsiToHijri },
      { value: "hijri-to-shamsi", label: c.hijriToShamsi },
      { value: "gregorian-to-hijri", label: c.gregorianToHijri },
      { value: "hijri-to-gregorian", label: c.hijriToGregorian },
    ];
  }, [content]);

  const setTodayBySource = () => {
    const now = new Date();
    if (sourceCalendar === "gregorian") {
      setYear(String(now.getFullYear()));
      setMonth(String(now.getMonth() + 1));
      setDay(String(now.getDate()));
    } else if (sourceCalendar === "shamsi") {
      const j = jalaali.toJalaali(now);
      setYear(String(j.jy));
      setMonth(String(j.jm));
      setDay(String(j.jd));
    } else {
      const todayHijri = gregorianToHijri({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      });
      setYear(String(todayHijri.year));
      setMonth(String(todayHijri.month));
      setDay(String(todayHijri.day));
    }
    setDayError("");
    setMonthError("");
    setYearError("");
  };

  useEffect(() => {
    setTodayBySource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCalendar]);

  useEffect(() => {
    if (!day || !month || !year) {
      setDayError("");
      setMonthError("");
      setYearError("");
      setResult("");
      return;
    }

    const y = parseInt(normalizeDigits(year), 10);
    const m = parseInt(normalizeDigits(month), 10);
    const d = parseInt(normalizeDigits(day), 10);

    let newDayError = "";
    let newMonthError = "";
    let newYearError = "";

    if (d < 1 || d > 31) newDayError = uiText.invalidDay;
    if (m < 1 || m > 12) newMonthError = uiText.invalidMonth;
    if (y < 1000 || y > 2100) newYearError = uiText.invalidYear;

    if (newDayError || newMonthError || newYearError) {
      setDayError(newDayError);
      setMonthError(newMonthError);
      setYearError(newYearError);
      setResult("");
      return;
    }

    let calendarValid = true;

    if (sourceCalendar === "shamsi") {
      calendarValid = jalaali.isValidJalaaliDate(y, m, d);
    } else if (sourceCalendar === "gregorian") {
      calendarValid = isValidGregorianDate(y, m, d);
    } else {
      calendarValid = isValidHijriDate(y, m, d);
    }

    if (!calendarValid) {
      setDayError(uiText.invalidDay);
      setMonthError(uiText.invalidMonth);
      setYearError(uiText.invalidYear);
      setResult("");
      return;
    }

    setDayError("");
    setMonthError("");
    setYearError("");

    try {
      let gregorianDate: Date;

      if (sourceCalendar === "shamsi") {
        const g = jalaali.toGregorian(y, m, d);
        gregorianDate = new Date(g.gy, g.gm - 1, g.gd);
      } else if (sourceCalendar === "gregorian") {
        gregorianDate = new Date(y, m - 1, d);
      } else {
        const gDate = hijriToGregorian({ year: y, month: m, day: d });
        gregorianDate = new Date(gDate.year, gDate.month - 1, gDate.day);
      }

      if (targetCalendar === "gregorian") {
        setResult(
          `${gregorianDate.getFullYear()}-${String(gregorianDate.getMonth() + 1).padStart(2, "0")}-${String(gregorianDate.getDate()).padStart(2, "0")}`,
        );
      } else if (targetCalendar === "shamsi") {
        const j = jalaali.toJalaali(gregorianDate);
        setResult(
          `${j.jy}/${String(j.jm).padStart(2, "0")}/${String(j.jd).padStart(2, "0")}`,
        );
      } else {
        const hijriDate = gregorianToHijri({
          year: gregorianDate.getFullYear(),
          month: gregorianDate.getMonth() + 1,
          day: gregorianDate.getDate(),
        });
        setResult(
          `${hijriDate.year}/${String(hijriDate.month).padStart(2, "0")}/${String(hijriDate.day).padStart(2, "0")}`,
        );
      }
    } catch {
      setResult(invalidText);
    }
  }, [day, month, year, sourceCalendar, targetCalendar, invalidText, uiText]);

  const handleCopy = async () => {
    if (!result || isInvalid) return;
    const ok = await safeWriteClipboard(result);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    const reverseMap: Record<ConversionType, ConversionType> = {
      "shamsi-to-gregorian": "gregorian-to-shamsi",
      "gregorian-to-shamsi": "shamsi-to-gregorian",
      "shamsi-to-hijri": "hijri-to-shamsi",
      "hijri-to-shamsi": "shamsi-to-hijri",
      "gregorian-to-hijri": "hijri-to-gregorian",
      "hijri-to-gregorian": "gregorian-to-hijri",
    };
    setConversion(reverseMap[conversion]);

    if (result && !isInvalid) {
      const parts = result.split(/[-\/]/).map((p) => parseInt(p, 10));
      if (parts.length === 3) {
        setYear(String(parts[0]));
        setMonth(String(parts[1]));
        setDay(String(parts[2]));
      }
    }
  };

  return (
    <div
      className={`max-w-2xl mx-auto rounded-3xl border p-5 sm:p-8 shadow-xl ${theme.card} ${theme.border}`}
    >
      <div className="mb-6">
        <label className={`block text-sm font-bold mb-2 ${theme.textMuted}`}>
          {content.ui.labels.conversionType}
        </label>
        <CustomDropdown
          options={conversionOptions}
          value={conversion}
          onChange={(val) => setConversion(val as ConversionType)}
          className="w-full"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <button
          type="button"
          onClick={setTodayBySource}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
        >
          <CalendarDays size={18} className={theme.textMuted} />
          <span className="text-sm font-bold">{uiText.today}</span>
        </button>

        <button
          type="button"
          onClick={handleSwap}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
        >
          <ArrowLeftRight size={18} className={theme.textMuted} />
          <span className="text-sm font-bold">{uiText.swap}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
        <InputGroup
          label={content.ui.inputs.dayLabel}
          value={day}
          setValue={setDay}
          placeholder="01"
          theme={theme}
          maxLen={2}
          error={dayError}
          onBlurPad2
        />
        <InputGroup
          label={content.ui.inputs.monthLabel}
          value={month}
          setValue={setMonth}
          placeholder="01"
          theme={theme}
          maxLen={2}
          error={monthError}
          onBlurPad2
        />
        <InputGroup
          label={content.ui.inputs.yearLabel}
          value={year}
          setValue={setYear}
          placeholder={yearPlaceholder}
          theme={theme}
          maxLen={4}
          error={yearError}
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
  error,
  onBlurPad2,
}: {
  label: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  placeholder: string;
  theme: any;
  maxLen: number;
  error?: string;
  onBlurPad2?: boolean;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    let clean = normalizeDigits(raw);
    clean = clean.slice(0, maxLen);
    setValue(clean);
  };

  const handleBlur = () => {
    if (!value) return;
    let num = parseInt(value, 10);
    if (isNaN(num)) return;

    let newVal = String(num);
    if (onBlurPad2) {
      newVal = newVal.padStart(2, "0");
    }
    setValue(newVal);
  };

  return (
    <div className="space-y-1">
      <label className={`text-xs font-bold ${theme.textMuted}`}>{label}</label>
      <input
        inputMode="numeric"
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={[
          "w-full p-4 text-center text-xl font-bold rounded-2xl border outline-none focus:ring-2 transition-colors",
          theme.bg,
          error ? "border-red-500 focus:ring-red-500" : theme.border,
          theme.text,
          theme.ring,
        ].join(" ")}
      />
      {error && <p className="text-xs text-red-500 mt-1 text-right">{error}</p>}
    </div>
  );
}
