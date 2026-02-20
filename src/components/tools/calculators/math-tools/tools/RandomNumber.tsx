"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";
import { Shuffle, Copy, Check } from "lucide-react";

export default function RandomNumber() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [count, setCount] = useState("1");
  const [unique, setUnique] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const minVal = parseInt(min);
    const maxVal = parseInt(max);
    const countVal = parseInt(count);

    if (isNaN(minVal) || isNaN(maxVal) || isNaN(countVal)) return;
    if (minVal >= maxVal) return;

    const nums: number[] = [];

    if (unique) {
      const range = maxVal - minVal + 1;
      if (countVal > range) {
        alert(content.random.error);
        return;
      }
      const pool = Array.from({ length: range }, (_, i) => minVal + i);
      for (let i = 0; i < countVal; i++) {
        const idx = Math.floor(Math.random() * pool.length);
        nums.push(pool.splice(idx, 1)[0]);
      }
    } else {
      for (let i = 0; i < countVal; i++) {
        nums.push(Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal);
      }
    }

    setResults(nums);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(results.join(", "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.random.labels.min}
          </label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.random.labels.max}
          </label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.random.labels.count}
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={unique}
          onChange={(e) => setUnique(e.target.checked)}
          className="w-5 h-5 rounded"
        />
        <span className={theme.text}>{content.random.labels.unique}</span>
      </label>

      <button
        onClick={generate}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${theme.primary} text-white`}
      >
        <Shuffle size={20} />
        {content.random.button}
      </button>

      {results.length > 0 && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <div className="flex justify-between items-center mb-3">
            <p className={`text-sm ${theme.textMuted}`}>
              {content.random.labels.results}
            </p>
            <button
              onClick={copyToClipboard}
              className={`flex items-center gap-1 text-sm ${theme.textMuted} hover:opacity-70`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? content.common.copied : content.common.copy}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {results.map((n, i) => (
              <span
                key={i}
                className={`px-4 py-2 rounded-xl ${theme.primary} text-white font-bold`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
