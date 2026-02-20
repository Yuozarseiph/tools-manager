"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";
import { Check, X } from "lucide-react";

export default function PrimeChecker() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [num, setNum] = useState("");
  const [result, setResult] = useState<{
    isPrime: boolean;
    message: string;
    nearPrimes?: number[];
  } | null>(null);

  const isPrime = (n: number): boolean => {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (let i = 3; i <= Math.sqrt(n); i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  };

  const findNearPrimes = (n: number): number[] => {
    const primes: number[] = [];
    let lower = n - 1;
    let upper = n + 1;

    while (primes.length < 2 && lower > 1) {
      if (isPrime(lower)) primes.unshift(lower);
      lower--;
    }

    while (primes.length < 4) {
      if (isPrime(upper)) primes.push(upper);
      upper++;
    }

    return primes;
  };

  const check = () => {
    const n = parseInt(num);
    if (isNaN(n)) return;

    const prime = isPrime(n);
    setResult({
      isPrime: prime,
      message: prime
        ? content.prime.results.isPrime.replace("{number}", n.toString())
        : content.prime.results.isNotPrime.replace("{number}", n.toString()),
      nearPrimes: prime ? undefined : findNearPrimes(n),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.prime.labels.enterNumber}
        </label>
        <input
          type="number"
          value={num}
          onChange={(e) => setNum(e.target.value)}
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          placeholder="17"
        />
      </div>

      <button
        onClick={check}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.prime.labels.check}
      </button>

      {result && (
        <div
          className={`p-6 rounded-xl border-2 text-center ${
            result.isPrime
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-red-500 bg-red-50 dark:bg-red-950/20"
          }`}
        >
          <div
            className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              result.isPrime ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {result.isPrime ? (
              <Check size={32} className="text-white" />
            ) : (
              <X size={32} className="text-white" />
            )}
          </div>
          <p
            className={`text-xl font-bold ${
              result.isPrime
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {result.message}
          </p>

          {result.nearPrimes && (
            <div className="mt-4">
              <p className={`text-sm ${theme.textMuted} mb-2`}>
                {content.prime.labels.nearPrimes}
              </p>
              <div className="flex justify-center gap-2">
                {result.nearPrimes.map((p) => (
                  <span
                    key={p}
                    className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
