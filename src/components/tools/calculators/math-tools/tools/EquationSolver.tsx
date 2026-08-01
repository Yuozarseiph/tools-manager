"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";

export default function EquationSolver() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [degree, setDegree] = useState<1 | 2>(1);
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [c, setC] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const solve = () => {
    const aVal = parseFloat(a);
    const bVal = parseFloat(b);
    const cVal = parseFloat(c);

    if (degree === 1) {
      if (aVal === 0) {
        setResult(content.equation.results.invalid);
        return;
      }
      const x = -bVal / aVal;
      setResult(`x = ${x.toFixed(4)}`);
    } else {
      if (aVal === 0) {
        setResult(content.equation.results.linearToQuadratic);
        return;
      }

      const delta = bVal * bVal - 4 * aVal * cVal;

      if (delta < 0) {
        const realPart = (-bVal / (2 * aVal)).toFixed(4);
        const imagPart = (Math.sqrt(-delta) / (2 * aVal)).toFixed(4);
        setResult(
          `${content.equation.results.delta} = ${delta.toFixed(4)} ${
            content.equation.results.negative
          }\n` +
            `x₁ = ${realPart} + ${imagPart}i\n` +
            `x₂ = ${realPart} - ${imagPart}i`
        );
      } else if (delta === 0) {
        const x = -bVal / (2 * aVal);
        setResult(
          `${content.equation.results.delta} = 0\n` +
            `x = ${x.toFixed(4)} ${content.equation.results.doubleRoot}`
        );
      } else {
        const x1 = (-bVal + Math.sqrt(delta)) / (2 * aVal);
        const x2 = (-bVal - Math.sqrt(delta)) / (2 * aVal);
        setResult(
          `${content.equation.results.delta} = ${delta.toFixed(4)}\n` +
            `x₁ = ${x1.toFixed(4)}\n` +
            `x₂ = ${x2.toFixed(4)}`
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Degree Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setDegree(1);
            setResult(null);
          }}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            degree === 1
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          {content.equation.degrees.linear}
        </button>
        <button
          onClick={() => {
            setDegree(2);
            setResult(null);
          }}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            degree === 2
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          {content.equation.degrees.quadratic}
        </button>
      </div>

      {/* Equation Display */}
      <div
        className={`p-4 rounded-xl ${theme.bg} border ${theme.border} text-center`}
      >
        <p className={`text-xl font-mono ${theme.text}`}>
          {degree === 1 ? (
            <>
              <span className="text-[var(--app-accent)]">{a || "a"}</span>x +{" "}
              <span className="text-[var(--app-success-text)]">{b || "b"}</span> = 0
            </>
          ) : (
            <>
              <span className="text-[var(--app-accent)]">{a || "a"}</span>x² +{" "}
              <span className="text-[var(--app-success-text)]">{b || "b"}</span>x +{" "}
              <span className="text-orange-500">{c || "c"}</span> = 0
            </>
          )}
        </p>
      </div>

      {/* Inputs */}
      <div
        className={`grid gap-4 ${degree === 1 ? "grid-cols-2" : "grid-cols-3"}`}
      >
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.equation.labels.coefficientA.replace(
              "{var}",
              degree === 2 ? "x²" : "x"
            )}
          </label>
          <input
            type="number"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="2"
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.equation.labels.coefficientB.replace(
              "{type}",
              degree === 2
                ? content.equation.labels.coefficientX
                : content.equation.labels.constant
            )}
          </label>
          <input
            type="number"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
            placeholder="-5"
          />
        </div>
        {degree === 2 && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
              {content.equation.labels.coefficientC}
            </label>
            <input
              type="number"
              value={c}
              onChange={(e) => setC(e.target.value)}
              className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
              placeholder="6"
            />
          </div>
        )}
      </div>

      <button
        onClick={solve}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.equation.button}
      </button>

      {result && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <p className={`text-sm ${theme.textMuted} mb-2`}>
            {content.common.result}:
          </p>
          <pre
            className={`text-lg font-bold whitespace-pre-line ${theme.text}`}
          >
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
