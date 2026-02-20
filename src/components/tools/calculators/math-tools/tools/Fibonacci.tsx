"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";
import { Copy, Check } from "lucide-react";

export default function Fibonacci() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [mode, setMode] = useState<"sequence" | "nthTerm" | "check">(
    "sequence"
  );
  const [count, setCount] = useState("10");
  const [nthTerm, setNthTerm] = useState("");
  const [checkNum, setCheckNum] = useState("");
  const [result, setResult] = useState<string | number[] | null>(null);
  const [copied, setCopied] = useState(false);

  const generateSequence = (n: number): number[] => {
    if (n <= 0) return [];
    if (n === 1) return [0];
    if (n === 2) return [0, 1];

    const seq = [0, 1];
    for (let i = 2; i < n; i++) {
      seq.push(seq[i - 1] + seq[i - 2]);
    }
    return seq;
  };

  const getNthFibonacci = (n: number): number => {
    if (n <= 0) return 0;
    if (n === 1) return 0;
    if (n === 2) return 1;

    let a = 0,
      b = 1;
    for (let i = 3; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  };

  const isFibonacci = (n: number): boolean => {
    const isPerfectSquare = (x: number) => {
      const s = Math.sqrt(x);
      return s * s === x;
    };
    return isPerfectSquare(5 * n * n + 4) || isPerfectSquare(5 * n * n - 4);
  };

  const calculate = () => {
    switch (mode) {
      case "sequence":
        const c = parseInt(count);
        if (isNaN(c) || c < 1 || c > 50) {
          setResult(content.fibonacci.results.countRange);
          return;
        }
        setResult(generateSequence(c));
        break;

      case "nthTerm":
        const n = parseInt(nthTerm);
        if (isNaN(n) || n < 1) {
          setResult(content.fibonacci.errors.invalid);
          return;
        }
        const fib = getNthFibonacci(n);
        setResult(
          content.fibonacci.results.nthTerm
            .replace("{n}", n.toString())
            .replace("{result}", fib.toString())
        );
        break;

      case "check":
        const num = parseInt(checkNum);
        if (isNaN(num) || num < 0) {
          setResult(content.fibonacci.errors.invalid);
          return;
        }
        const isFib = isFibonacci(num);
        setResult(
          isFib
            ? content.fibonacci.results.isFibonacci.replace(
                "{number}",
                num.toString()
              )
            : content.fibonacci.results.isNotFibonacci.replace(
                "{number}",
                num.toString()
              )
        );
        break;
    }
  };

  const copySequence = () => {
    if (Array.isArray(result)) {
      navigator.clipboard.writeText(result.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const modes = [
    { id: "sequence", label: content.fibonacci.modes.sequence },
    { id: "nthTerm", label: content.fibonacci.modes.nthTerm },
    { id: "check", label: content.fibonacci.modes.check },
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
      {mode === "sequence" && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.fibonacci.labels.count}
          </label>
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            min={1}
            max={50}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
      )}

      {mode === "nthTerm" && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.fibonacci.labels.nthTerm}
          </label>
          <input
            type="number"
            value={nthTerm}
            onChange={(e) => setNthTerm(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="10"
          />
        </div>
      )}

      {mode === "check" && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.fibonacci.labels.checkNumber}
          </label>
          <input
            type="number"
            value={checkNum}
            onChange={(e) => setCheckNum(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="21"
          />
        </div>
      )}

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.common.calculate}
      </button>

      {/* Results */}
      {result && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          {Array.isArray(result) ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <p className={`text-sm ${theme.textMuted}`}>
                  {content.fibonacci.labels.sequence.replace(
                    "{count}",
                    result.length.toString()
                  )}
                </p>
                <button
                  onClick={copySequence}
                  className={`flex items-center gap-1 text-sm ${theme.textMuted} hover:opacity-70`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? content.common.copied : content.common.copy}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.map((n, i) => (
                  <span
                    key={i}
                    className={`px-3 py-1 rounded-lg ${theme.secondary} ${theme.text} text-sm font-mono`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <p className={`text-lg font-bold text-center ${theme.text}`}>
              {result}
            </p>
          )}
        </div>
      )}

      {/* Formula */}
      <div className={`p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
        <p className={`text-sm ${theme.textMuted} mb-2`}>
          {content.fibonacci.labels.formula}
        </p>
        <p className={`font-mono ${theme.text}`}>F(n) = F(n-1) + F(n-2)</p>
        <p className={`text-sm ${theme.textMuted} mt-2`}>F(0) = 0, F(1) = 1</p>
      </div>
    </div>
  );
}
