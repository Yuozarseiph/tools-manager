"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

export default function LogarithmCalc() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [mode, setMode] = useState<"log" | "ln" | "custom">("log");
  const [num, setNum] = useState("");
  const [base, setBase] = useState("10");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const n = parseFloat(num);
    const b = parseFloat(base);

    if (isNaN(n) || n <= 0) {
      setResult(content.logarithm.errors.positiveNumber);
      return;
    }

    let res: number;
    let formula: string;

    switch (mode) {
      case "log":
        res = Math.log10(n);
        formula = `log₁₀(${n})`;
        break;
      case "ln":
        res = Math.log(n);
        formula = `ln(${n})`;
        break;
      case "custom":
        if (isNaN(b) || b <= 0 || b === 1) {
          setResult(content.logarithm.errors.validBase);
          return;
        }
        res = Math.log(n) / Math.log(b);
        formula = `log${b}(${n})`;
        break;
      default:
        return;
    }

    setResult(`${formula} = ${res.toFixed(8)}`);
  };

  const modes = [
    { id: "log", label: content.logarithm.modes.log10 },
    { id: "ln", label: content.logarithm.modes.ln },
    { id: "custom", label: content.logarithm.modes.custom },
  ];

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex flex-wrap gap-2">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setMode(m.id as typeof mode);
              setResult(null);
            }}
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
      <div
        className={`grid gap-4 ${
          mode === "custom" ? "grid-cols-2" : "grid-cols-1"
        }`}
      >
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.logarithm.labels.number}
          </label>
          <input
            type="number"
            value={num}
            onChange={(e) => setNum(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="100"
          />
        </div>
        {mode === "custom" && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              {content.logarithm.labels.base}
            </label>
            <input
              type="number"
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
              placeholder="2"
            />
          </div>
        )}
      </div>

      {/* Quick Values */}
      <div className={`p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
        <p className={`text-sm ${theme.textMuted} mb-2`}>
          {content.logarithm.labels.importantValues}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className={theme.text}>e ≈ 2.71828</div>
          <div className={theme.text}>ln(e) = 1</div>
          <div className={theme.text}>log₁₀(10) = 1</div>
          <div className={theme.text}>log₂(8) = 3</div>
        </div>
      </div>

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.common.calculate}
      </button>

      {result && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <p className={`text-xl font-bold text-center ${theme.text}`}>
            {result}
          </p>
        </div>
      )}
    </div>
  );
}
