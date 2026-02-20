"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";
import { Copy, Check } from "lucide-react";

export default function BaseConverter() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState(10);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const bases = [
    { value: 2, label: content.baseConverter.bases.binary },
    { value: 8, label: content.baseConverter.bases.octal },
    { value: 10, label: content.baseConverter.bases.decimal },
    { value: 16, label: content.baseConverter.bases.hexadecimal },
  ];

  const convert = () => {
    try {
      const decimal = parseInt(input, fromBase);

      if (isNaN(decimal)) {
        setResults({ error: content.baseConverter.errors.invalid });
        return;
      }

      setResults({
        [content.baseConverter.bases.binary]: decimal.toString(2),
        [content.baseConverter.bases.octal]: decimal.toString(8),
        [content.baseConverter.bases.decimal]: decimal.toString(10),
        [content.baseConverter.bases.hexadecimal]: decimal
          .toString(16)
          .toUpperCase(),
      });
    } catch {
      setResults({ error: content.baseConverter.errors.conversion });
    }
  };

  const copyToClipboard = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* From Base Selection */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.baseConverter.labels.inputBase}
        </label>
        <div className="flex flex-wrap gap-2">
          {bases.map((b) => (
            <button
              key={b.value}
              onClick={() => setFromBase(b.value)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                fromBase === b.value
                  ? `${theme.primary} text-white`
                  : `${theme.bg} ${theme.text} border ${theme.border}`
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.baseConverter.labels.numberInBase.replace(
            "{base}",
            fromBase.toString()
          )}
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text} font-mono`}
          placeholder={
            fromBase === 2
              ? "1010"
              : fromBase === 8
              ? "12"
              : fromBase === 16
              ? "A5"
              : "10"
          }
        />
        <p className={`text-xs mt-1 ${theme.textMuted}`}>
          {fromBase === 16 && content.baseConverter.hints.hex}
          {fromBase === 2 && content.baseConverter.hints.binary}
          {fromBase === 8 && content.baseConverter.hints.octal}
        </p>
      </div>

      <button
        onClick={convert}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.baseConverter.button}
      </button>

      {/* Results */}
      {results && !results.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(results).map(([key, value]) => (
            <div
              key={key}
              className={`p-4 rounded-xl border ${theme.border} ${theme.bg} flex justify-between items-center`}
            >
              <div>
                <p className={`text-sm ${theme.textMuted}`}>{key}</p>
                <p className={`text-lg font-mono font-bold ${theme.text}`}>
                  {value}
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(key, value)}
                className={`p-2 rounded-lg hover:opacity-70 ${theme.secondary}`}
              >
                {copied === key ? (
                  <Check size={18} className="text-green-500" />
                ) : (
                  <Copy size={18} className={theme.textMuted} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {results?.error && (
        <div className="p-4 rounded-xl border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <p className="text-red-600 dark:text-red-400">{results.error}</p>
        </div>
      )}

      {/* Reference Table */}
      <div className={`p-4 rounded-xl ${theme.bg} border ${theme.border}`}>
        <p className={`text-sm ${theme.textMuted} mb-3`}>
          {content.baseConverter.labels.referenceTable}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={theme.textMuted}>
                <th className="p-2 text-right">
                  {content.baseConverter.bases.decimal}
                </th>
                <th className="p-2 text-right">
                  {content.baseConverter.bases.binary}
                </th>
                <th className="p-2 text-right">
                  {content.baseConverter.bases.octal}
                </th>
                <th className="p-2 text-right">
                  {content.baseConverter.bases.hexadecimal}
                </th>
              </tr>
            </thead>
            <tbody className={theme.text}>
              {[0, 1, 2, 8, 10, 15, 16, 255].map((n) => (
                <tr
                  key={n}
                  className="border-t border-slate-200 dark:border-slate-700"
                >
                  <td className="p-2">{n}</td>
                  <td className="p-2 font-mono">{n.toString(2)}</td>
                  <td className="p-2 font-mono">{n.toString(8)}</td>
                  <td className="p-2 font-mono">
                    {n.toString(16).toUpperCase()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
