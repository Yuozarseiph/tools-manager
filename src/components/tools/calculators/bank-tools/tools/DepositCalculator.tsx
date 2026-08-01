"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBankToolsUIContent } from "../bank-tools.content";

export default function DepositCalculator() {
  const theme = useThemeColors();
  const content = useBankToolsUIContent();

  const [principal, setPrincipal] = useState("50000000");
  const [rate, setRate] = useState("15");
  const [duration, setDuration] = useState("12");
  const [durationType, setDurationType] = useState<"days" | "months" | "years">(
    "months"
  );
  const [compoundFrequency, setCompoundFrequency] = useState<
    "daily" | "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [result, setResult] = useState<{
    finalAmount: number;
    earnedInterest: number;
    effectiveRate: number;
  } | null>(null);

  const calculate = () => {
    const p = parseFloat(principal);
    const r = parseFloat(rate) / 100;
    const d = parseFloat(duration);

    if (isNaN(p) || isNaN(r) || isNaN(d)) return;

    // تبدیل به سال
    let years = d;
    if (durationType === "months") years = d / 12;
    else if (durationType === "days") years = d / 365;

    // تعداد دفعات تجمیع در سال
    const n =
      compoundFrequency === "daily"
        ? 365
        : compoundFrequency === "monthly"
        ? 12
        : compoundFrequency === "quarterly"
        ? 4
        : 1;

    // فرمول سود مرکب: A = P(1 + r/n)^(nt)
    const finalAmount = p * Math.pow(1 + r / n, n * years);
    const earnedInterest = finalAmount - p;
    const effectiveRate = (Math.pow(1 + r / n, n) - 1) * 100;

    setResult({ finalAmount, earnedInterest, effectiveRate });
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.deposit.labels.principal}
          </label>
          <input
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.deposit.labels.rate}
          </label>
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
      </div>

      {/* Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.deposit.labels.duration}
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            &nbsp;
          </label>
          <select
            value={durationType}
            onChange={(e) =>
              setDurationType(e.target.value as typeof durationType)
            }
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          >
            <option value="days">{content.deposit.durations.days}</option>
            <option value="months">{content.deposit.durations.months}</option>
            <option value="years">{content.deposit.durations.years}</option>
          </select>
        </div>
      </div>

      {/* Compound Frequency */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.deposit.labels.compoundFrequency}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {(["daily", "monthly", "quarterly", "yearly"] as const).map(
            (freq) => (
              <button
                key={freq}
                onClick={() => setCompoundFrequency(freq)}
                className={`py-2 rounded-xl font-medium transition-all ${
                  compoundFrequency === freq
                    ? `${theme.primary} text-white`
                    : `${theme.bg} ${theme.text} border ${theme.border}`
                }`}
              >
                {content.deposit.periods[freq]}
              </button>
            )
          )}
        </div>
      </div>

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.common.calculate}
      </button>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.deposit.labels.finalAmount}
            </p>
            <p className={`text-2xl font-bold ${theme.text}`}>
              {result.finalAmount.toLocaleString()} {content.common.currency}
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.deposit.labels.earnedInterest}
            </p>
            <p className={`text-2xl font-bold text-[var(--app-success-text)]`}>
              {result.earnedInterest.toLocaleString()} {content.common.currency}
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.deposit.labels.effectiveRate}
            </p>
            <p className={`text-2xl font-bold ${theme.text}`}>
              {result.effectiveRate.toFixed(2)}%
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
