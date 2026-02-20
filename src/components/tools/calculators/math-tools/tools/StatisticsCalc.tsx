"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

export default function StatisticsCalc() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();

  const [input, setInput] = useState("");
  const [results, setResults] = useState<Record<string, number> | null>(null);

  const calculate = () => {
    const numbers = input
      .split(/[,،\s]+/)
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) return;

    const n = numbers.length;
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const sorted = [...numbers].sort((a, b) => a - b);
    const median =
      n % 2 === 0
        ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
        : sorted[Math.floor(n / 2)];

    const variance =
      numbers.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const range = max - min;

    // Mode
    const freq: Record<number, number> = {};
    numbers.forEach((n) => (freq[n] = (freq[n] || 0) + 1));
    const maxFreq = Math.max(...Object.values(freq));
    const modes = Object.keys(freq)
      .filter((k) => freq[Number(k)] === maxFreq)
      .map(Number);

    setResults({
      count: n,
      sum: parseFloat(sum.toFixed(4)),
      mean: parseFloat(mean.toFixed(4)),
      median: parseFloat(median.toFixed(4)),
      mode: modes[0],
      variance: parseFloat(variance.toFixed(4)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      min,
      max,
      range,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.common.enterNumbers}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          placeholder="5, 10, 15, 20, 25"
        />
      </div>

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.common.calculate}
      </button>

      {results && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(results).map(([key, value]) => (
            <div
              key={key}
              className={`p-3 rounded-xl border ${theme.border} ${theme.bg} text-center`}
            >
              <p className={`text-xs ${theme.textMuted}`}>
                {
                  content.statistics.labels[
                    key as keyof typeof content.statistics.labels
                  ]
                }
              </p>
              <p className={`text-lg font-bold ${theme.text}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
