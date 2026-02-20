"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

export default function PercentageCalc() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();

  const [mode, setMode] = useState<
    "whatPercent" | "percentOf" | "increase" | "decrease"
  >("percentOf");
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const a = parseFloat(num1);
    const b = parseFloat(num2);

    if (isNaN(a) || isNaN(b)) {
      setResult(content.common.error);
      return;
    }

    let res: number;
    switch (mode) {
      case "whatPercent":
        res = (a / b) * 100;
        setResult(
          content.percentage.results.whatPercent
            .replace("{num1}", a.toString())
            .replace("{num2}", b.toString())
            .replace("{result}", res.toFixed(2))
        );
        break;
      case "percentOf":
        res = (a / 100) * b;
        setResult(
          content.percentage.results.percentOf
            .replace("{percent}", a.toString())
            .replace("{number}", b.toString())
            .replace("{result}", res.toFixed(2))
        );
        break;
      case "increase":
        res = b + (b * a) / 100;
        setResult(
          content.percentage.results.increase
            .replace("{number}", b.toString())
            .replace("{percent}", a.toString())
            .replace("{result}", res.toFixed(2))
        );
        break;
      case "decrease":
        res = b - (b * a) / 100;
        setResult(
          content.percentage.results.decrease
            .replace("{number}", b.toString())
            .replace("{percent}", a.toString())
            .replace("{result}", res.toFixed(2))
        );
        break;
    }
  };

  const modes = [
    { id: "percentOf", label: content.percentage.modes.percentOf },
    { id: "whatPercent", label: content.percentage.modes.whatPercent },
    { id: "increase", label: content.percentage.modes.increase },
    { id: "decrease", label: content.percentage.modes.decrease },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id as typeof mode)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              mode === m.id
                ? `${theme.primary} text-white`
                : `${theme.bg} ${theme.text} border ${theme.border}`
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {mode === "percentOf" || mode === "increase" || mode === "decrease"
              ? content.percentage.labels.percent
              : content.percentage.labels.firstNumber}
          </label>
          <input
            type="number"
            value={num1}
            onChange={(e) => setNum1(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="25"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {mode === "whatPercent"
              ? content.percentage.labels.secondNumber
              : content.percentage.labels.number}
          </label>
          <input
            type="number"
            value={num2}
            onChange={(e) => setNum2(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="200"
          />
        </div>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.common.calculate}
      </button>

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <p className={`text-lg font-bold ${theme.text}`}>{result}</p>
        </div>
      )}
    </div>
  );
}
