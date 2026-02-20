"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

export default function PowerRoot() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();

  const [mode, setMode] = useState<"power" | "root">("power");
  const [base, setBase] = useState("");
  const [exponent, setExponent] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const calculate = () => {
    const b = parseFloat(base);
    const e = parseFloat(exponent);

    if (isNaN(b) || isNaN(e)) {
      setResult(content.common.error);
      return;
    }

    if (mode === "power") {
      const res = Math.pow(b, e);
      setResult(
        content.powerRoot.results.power
          .replace("{base}", b.toString())
          .replace("{exp}", e.toString())
          .replace("{result}", res.toString())
      );
    } else {
      const rootResult = Math.pow(b, 1 / e);
      setResult(
        content.powerRoot.results.root
          .replace("{degree}", e.toString())
          .replace("{number}", b.toString())
          .replace("{result}", rootResult.toFixed(6))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("power")}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            mode === "power"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          {content.powerRoot.modes.power}
        </button>
        <button
          onClick={() => setMode("root")}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            mode === "root"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          {content.powerRoot.modes.root}
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {mode === "power"
              ? content.powerRoot.labels.base
              : content.powerRoot.labels.number}
          </label>
          <input
            type="number"
            value={base}
            onChange={(e) => setBase(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="2"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {mode === "power"
              ? content.powerRoot.labels.exponent
              : content.powerRoot.labels.degree}
          </label>
          <input
            type="number"
            value={exponent}
            onChange={(e) => setExponent(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="3"
          />
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
