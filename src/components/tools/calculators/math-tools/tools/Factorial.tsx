"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";
import { Copy, Check } from "lucide-react";

export default function Factorial() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [num, setNum] = useState("");
  const [result, setResult] = useState<{
    factorial: string;
    digits: number;
    steps: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const calculateFactorial = (n: number): bigint => {
    if (n < 0) return BigInt(-1);
    if (n === 0 || n === 1) return BigInt(1);

    let result = BigInt(1);
    for (let i = 2; i <= n; i++) {
      result *= BigInt(i);
    }
    return result;
  };

  const calculate = () => {
    const n = parseInt(num);

    if (isNaN(n)) {
      setResult({
        factorial: content.factorial.errors.invalid,
        digits: 0,
        steps: "",
      });
      return;
    }

    if (n < 0) {
      setResult({
        factorial: content.factorial.errors.negative,
        digits: 0,
        steps: "",
      });
      return;
    }

    if (n > 170) {
      setResult({
        factorial: content.factorial.errors.tooLarge,
        digits: 0,
        steps: "",
      });
      return;
    }

    const factorial = calculateFactorial(n);
    const factorialStr = factorial.toString();

    let steps = "";
    if (n <= 10) {
      const stepsArr = [];
      for (let i = n; i >= 1; i--) {
        stepsArr.push(i);
      }
      steps = `${n}! = ${stepsArr.join(" × ")} = ${factorialStr}`;
    } else {
      steps = `${n}! = ${n} × ${n - 1} × ... × 2 × 1`;
    }

    setResult({
      factorial: factorialStr,
      digits: factorialStr.length,
      steps,
    });
  };

  const copyResult = () => {
    if (result?.factorial) {
      navigator.clipboard.writeText(result.factorial);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const commonFactorials = [
    { n: 0, f: "1" },
    { n: 1, f: "1" },
    { n: 5, f: "120" },
    { n: 10, f: "3,628,800" },
    { n: 15, f: "1,307,674,368,000" },
    { n: 20, f: "2,432,902,008,176,640,000" },
  ];

  return (
    <div className="space-y-6">
      {/* Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.factorial.labels.input}
        </label>
        <input
          type="number"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          min={0}
          max={170}
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          placeholder="5"
        />
      </div>

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.factorial.button}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`p-4 rounded-xl border ${theme.border} ${theme.bg} space-y-4`}
        >
          {/* Steps */}
          {result.steps && (
            <div>
              <p className={`text-sm ${theme.textMuted} mb-1`}>
                {content.factorial.labels.steps}
              </p>
              <p className={`font-mono text-sm ${theme.text}`}>
                {result.steps}
              </p>
            </div>
          )}

          {/* Factorial Result */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className={`text-sm ${theme.textMuted}`}>
                {content.factorial.labels.result}
              </p>
              {result.digits > 0 && (
                <button
                  onClick={copyResult}
                  className={`flex items-center gap-1 text-sm ${theme.textMuted} hover:opacity-70`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? content.common.copied : content.common.copy}
                </button>
              )}
            </div>
            <div
              className={`p-3 rounded-lg ${theme.secondary} overflow-x-auto`}
            >
              <p
                className={`font-mono text-lg font-bold break-all ${theme.text}`}
              >
                {result.factorial}
              </p>
            </div>
          </div>

          {/* Digits count */}
          {result.digits > 0 && (
            <p className={`text-sm ${theme.textMuted}`}>
              {content.factorial.labels.digits.replace(
                "{count}",
                result.digits.toLocaleString()
              )}
            </p>
          )}
        </div>
      )}

      {/* Common Factorials */}
      <div className={`p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
        <p className={`text-sm ${theme.textMuted} mb-3`}>
          {content.factorial.labels.commonFactorials}
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {commonFactorials.map((item) => (
            <div
              key={item.n}
              className={`p-3 rounded-lg ${theme.secondary} text-center`}
            >
              <p className={`font-bold ${theme.text}`}>{item.n}!</p>
              <p className={`text-xs ${theme.textMuted} font-mono`}>{item.f}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formula */}
      <div className={`p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
        <p className={`text-sm ${theme.textMuted} mb-2`}>
          {content.factorial.labels.definition}
        </p>
        <p className={`font-mono ${theme.text}`}>
          n! = n × (n-1) × (n-2) × ... × 2 × 1
        </p>
        <p className={`text-sm ${theme.textMuted} mt-2`}>
          {content.factorial.labels.convention}
        </p>
      </div>
    </div>
  );
}
