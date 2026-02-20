"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

export default function FactorCalc() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [num, setNum] = useState("");
  const [factors, setFactors] = useState<number[]>([]);
  const [primeFactors, setPrimeFactors] = useState<string>("");

  const calculate = () => {
    const n = parseInt(num);
    if (isNaN(n) || n < 1) return;

    // All factors
    const allFactors: number[] = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        allFactors.push(i);
        if (i !== n / i) allFactors.push(n / i);
      }
    }
    setFactors(allFactors.sort((a, b) => a - b));

    // Prime factorization
    let temp = n;
    const primes: string[] = [];
    for (let i = 2; i <= temp; i++) {
      let count = 0;
      while (temp % i === 0) {
        count++;
        temp /= i;
      }
      if (count > 0) {
        primes.push(count > 1 ? `${i}^${count}` : `${i}`);
      }
    }
    setPrimeFactors(primes.join(" × "));
  };

  return (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.common.enterNumber}
        </label>
        <input
          type="number"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          placeholder="120"
        />
      </div>

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.common.calculate}
      </button>

      {factors.length > 0 && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-2`}>
              {content.factor.labels.factors} (
              {content.factor.labels.count.replace(
                "{count}",
                factors.length.toString()
              )}
              )
            </p>
            <div className="flex flex-wrap gap-2">
              {factors.map((f) => (
                <span
                  key={f}
                  className={`px-3 py-1 rounded-lg ${theme.secondary} ${theme.text} text-sm`}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-2`}>
              {content.factor.labels.primeFactors}
            </p>
            <p className={`text-lg font-bold ${theme.text}`}>{primeFactors}</p>
          </div>
        </div>
      )}
    </div>
  );
}
