"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

export default function DecimalFraction() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [mode, setMode] = useState<"toFraction" | "toDecimal">("toFraction");
  const [decimal, setDecimal] = useState("");
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const gcd = (a: number, b: number): number => {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      const t = b;
      b = a % b;
      a = t;
    }
    return a;
  };

  const decimalToFraction = (dec: number): { num: number; den: number } => {
    const precision = 1000000000;
    let num = Math.round(dec * precision);
    let den = precision;
    const g = gcd(num, den);
    return { num: num / g, den: den / g };
  };

  const calculate = () => {
    if (mode === "toFraction") {
      const dec = parseFloat(decimal);
      if (isNaN(dec)) {
        setResult(content.decimalFraction.errors.invalid);
        return;
      }

      const { num, den } = decimalToFraction(dec);
      const sign = num < 0 ? "-" : "";
      setResult(`${sign}${Math.abs(num)}/${den}`);
    } else {
      const num = parseFloat(numerator);
      const den = parseFloat(denominator);

      if (isNaN(num) || isNaN(den) || den === 0) {
        setResult(content.decimalFraction.errors.invalidValues);
        return;
      }

      const decResult = num / den;
      setResult(decResult.toFixed(10).replace(/\.?0+$/, ""));
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setMode("toFraction");
            setResult(null);
          }}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            mode === "toFraction"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          {content.decimalFraction.modes.toFraction}
        </button>
        <button
          onClick={() => {
            setMode("toDecimal");
            setResult(null);
          }}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            mode === "toDecimal"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          {content.decimalFraction.modes.toDecimal}
        </button>
      </div>

      {/* Inputs */}
      {mode === "toFraction" ? (
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.decimalFraction.labels.decimal}
          </label>
          <input
            type="number"
            step="any"
            value={decimal}
            onChange={(e) => setDecimal(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="0.75"
          />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              {content.decimalFraction.labels.numerator}
            </label>
            <input
              type="number"
              value={numerator}
              onChange={(e) => setNumerator(e.target.value)}
              className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
              placeholder="3"
            />
          </div>
          <div className={`text-3xl font-bold ${theme.text} mt-6`}>/</div>
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              {content.decimalFraction.labels.denominator}
            </label>
            <input
              type="number"
              value={denominator}
              onChange={(e) => setDenominator(e.target.value)}
              className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
              placeholder="4"
            />
          </div>
        </div>
      )}

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.decimalFraction.button}
      </button>

      {result && (
        <div
          className={`p-6 rounded-xl border ${theme.border} ${theme.bg} text-center`}
        >
          <p className={`text-sm ${theme.textMuted} mb-2`}>
            {content.common.result}:
          </p>
          <p className={`text-3xl font-bold ${theme.text}`}>{result}</p>
        </div>
      )}

      {/* Common Fractions */}
      <div className={`p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
        <p className={`text-sm ${theme.textMuted} mb-3`}>
          {content.decimalFraction.labels.commonFractions}
        </p>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 text-center text-sm">
          {[
            { f: "1/2", d: "0.5" },
            { f: "1/3", d: "0.333" },
            { f: "1/4", d: "0.25" },
            { f: "1/5", d: "0.2" },
            { f: "2/3", d: "0.667" },
            { f: "3/4", d: "0.75" },
            { f: "1/8", d: "0.125" },
            { f: "3/8", d: "0.375" },
          ].map((item) => (
            <div key={item.f} className={`p-2 rounded-lg ${theme.secondary}`}>
              <div className={`font-bold ${theme.text}`}>{item.f}</div>
              <div className={`text-xs ${theme.textMuted}`}>{item.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
