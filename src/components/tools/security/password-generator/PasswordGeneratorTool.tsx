// components/tools/security/password-generator/PasswordGeneratorTool.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Copy,
  RefreshCw,
  Check,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  usePasswordGeneratorContent,
  type PasswordGeneratorToolContent,
} from "./password-generator.content";

export default function PasswordGeneratorTool() {
  const theme = useThemeColors();
  const content: PasswordGeneratorToolContent = usePasswordGeneratorContent();

  const [mode, setMode] = useState<"generate" | "analyze">("generate");

  // Generate State
  const [password, setPassword] = useState("");
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  // Analyze State
  const [userPass, setUserPass] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Generator Logic
  const generate = () => {
    const sets = {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
    };

    let chars = "";
    if (options.uppercase) chars += sets.uppercase;
    if (options.lowercase) chars += sets.lowercase;
    if (options.numbers) chars += sets.numbers;
    if (options.symbols) chars += sets.symbols;

    if (!chars) {
      setPassword("");
      return;
    }

    let pass = "";
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setCopied(false);
  };

  useEffect(() => {
    if (mode === "generate") generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, options, mode]);

  const calculateStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 8) score += 1;
    if (pass.length > 12) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(score, 5);
  };

  const currentStrength =
    mode === "generate"
      ? calculateStrength(password)
      : calculateStrength(userPass);

  const getStrengthColor = (s: number) => {
    if (s <= 2) return "bg-red-500";
    if (s <= 4) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthLabel = (s: number) => {
    if (s <= 2) return content.ui.generate.strength.weak;
    if (s <= 4) return content.ui.generate.strength.medium;
    return content.ui.generate.strength.strong;
  };

  const analyzeMessage =
    currentStrength <= 2
      ? content.ui.analyze.messages.weak
      : currentStrength <= 4
      ? content.ui.analyze.messages.medium
      : content.ui.analyze.messages.strong;

  return (
    <div
      className={`max-w-2xl mx-auto rounded-3xl border p-6 md:p-8 shadow-xl ${theme.card} ${theme.border}`}
    >
      {/* Tabs */}
      <div className="flex p-1 mb-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        <button
          onClick={() => setMode("generate")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            mode === "generate"
              ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600"
              : "text-zinc-400"
          }`}
        >
          {content.ui.tabs.generate}
        </button>
        <button
          onClick={() => setMode("analyze")}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            mode === "analyze"
              ? "bg-white dark:bg-zinc-700 shadow-sm text-blue-600"
              : "text-zinc-400"
          }`}
        >
          {content.ui.tabs.analyze}
        </button>
      </div>

      {mode === "generate" ? (
        <>
          {/* Generate UI */}
          <div
            className={`relative flex items-center justify-between p-6 rounded-2xl border-2 mb-8 transition-all ${
              theme.bg
            } ${copied ? "border-green-500" : theme.border}`}
          >
            <span className="font-mono text-2xl md:text-3xl break-all font-bold tracking-wider">
              {password}
            </span>

            <div className="flex gap-2 ml-4 shrink-0">
              <button
                onClick={generate}
                className="p-3 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title={content.ui.generate.regenerateTitle}
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={() => {
                  if (!password) return;
                  navigator.clipboard.writeText(password);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`p-3 rounded-xl text-white transition-all active:scale-95 ${
                  copied ? "bg-green-500" : theme.primary
                }`}
                title={content.ui.generate.copyTitle}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <div
              className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${getStrengthColor(
                currentStrength
              )}`}
              style={{
                width: `${(currentStrength / 5) * 100}%`,
              }}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="font-bold">
                  {content.ui.generate.lengthLabel}
                </label>
                <span
                  className={`px-3 py-1 rounded-lg font-mono font-bold ${theme.secondary}`}
                >
                  {length}
                </span>
              </div>
              <input
                type="range"
                min="4"
                max="64"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  key: "uppercase",
                  label: content.ui.generate.options.uppercase,
                },
                {
                  key: "lowercase",
                  label: content.ui.generate.options.lowercase,
                },
                {
                  key: "numbers",
                  label: content.ui.generate.options.numbers,
                },
                {
                  key: "symbols",
                  label: content.ui.generate.options.symbols,
                },
              ].map((opt) => (
                <label
                  key={opt.key}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-400 ${theme.bg} ${theme.border}`}
                >
                  <input
                    type="checkbox"
                    checked={options[opt.key as keyof typeof options]}
                    onChange={() =>
                      setOptions((prev) => ({
                        ...prev,
                        [opt.key]: !prev[opt.key as keyof typeof options],
                      }))
                    }
                    className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Analyze UI */}
          <div className="space-y-6">
            <div
              className={`relative p-1 rounded-2xl border-2 transition-all focus-within:border-blue-500 ${theme.bg} ${theme.border}`}
            >
              <input
                type={showPass ? "text" : "password"}
                value={userPass}
                onChange={(e) => setUserPass(e.target.value)}
                placeholder={content.ui.analyze.inputPlaceholder}
                className={`w-full p-5 text-xl font-mono bg-transparent outline-none ${theme.text}`}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-blue-500"
                title={
                  showPass
                    ? content.ui.analyze.hideTitle
                    : content.ui.analyze.showTitle
                }
              >
                {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {userPass && (
              <div
                className={`p-6 rounded-2xl border text-center ${theme.card} ${theme.border}`}
              >
                <div className="flex justify-center mb-4">
                  {currentStrength <= 2 ? (
                    <ShieldAlert size={48} className="text-red-500" />
                  ) : (
                    <ShieldCheck
                      size={48}
                      className={
                        currentStrength >= 5
                          ? "text-green-500"
                          : "text-yellow-500"
                      }
                    />
                  )}
                </div>
                <h3
                  className={`text-2xl font-black mb-2 ${getStrengthColor(
                    currentStrength
                  ).replace("bg-", "text-")}`}
                >
                  {getStrengthLabel(currentStrength)}
                </h3>
                <p className={theme.textMuted}>{analyzeMessage}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
