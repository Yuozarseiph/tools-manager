"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "../security-tools.content";
import { Hash, Type, Copy, Check } from "lucide-react";

export default function TextToHex() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();

  const [textInput, setTextInput] = useState("");
  const [hexOutput, setHexOutput] = useState("");
  const [mode, setMode] = useState<"toHex" | "toText">("toHex");
  const [uppercase, setUppercase] = useState(false);
  const [prefix, setPrefix] = useState(false);
  const [copied, setCopied] = useState(false);

  const textToHex = (text: string) => {
    let hex = text
      .split("")
      .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ");

    if (uppercase) hex = hex.toUpperCase();
    if (prefix)
      hex = hex
        .split(" ")
        .map((h) => `0x${h}`)
        .join(" ");

    return hex;
  };

  const hexToText = (hex: string) => {
    // Remove 0x prefix and spaces
    const cleaned = hex.replace(/0x/g, "").replace(/\s/g, "");

    // Split into 2-character chunks
    const chunks = cleaned.match(/.{1,2}/g) || [];

    return chunks
      .map((chunk) => String.fromCharCode(parseInt(chunk, 16)))
      .join("");
  };

  const handleConvert = () => {
    if (mode === "toHex") {
      setHexOutput(textToHex(textInput));
    } else {
      setTextInput(hexToText(hexOutput));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("toHex")}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
            mode === "toHex"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          <Hash size={20} />
          {content.textToHex.toHex}
        </button>
        <button
          onClick={() => setMode("toText")}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
            mode === "toText"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          <Type size={20} />
          {content.textToHex.toText}
        </button>
      </div>

      {/* Options */}
      {mode === "toHex" && (
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-5 h-5"
            />
            <span className={theme.text}>{content.textToHex.uppercase}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={prefix}
              onChange={(e) => setPrefix(e.target.checked)}
              className="w-5 h-5"
            />
            <span className={theme.text}>{content.textToHex.prefix}</span>
          </label>
        </div>
      )}

      {/* Text Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.textToHex.textInput}
        </label>
        <div className="relative">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={4}
            placeholder="Hello"
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
          {textInput && (
            <button
              onClick={() => copyToClipboard(textInput)}
              className={`absolute top-2 left-2 p-2 rounded-lg ${theme.secondary} ${theme.text}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Hex Output */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.textToHex.hexOutput}
        </label>
        <div className="relative">
          <textarea
            value={hexOutput}
            onChange={(e) => setHexOutput(e.target.value)}
            rows={4}
            placeholder="48 65 6c 6c 6f"
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text} font-mono text-sm`}
          />
          {hexOutput && (
            <button
              onClick={() => copyToClipboard(hexOutput)}
              className={`absolute top-2 left-2 p-2 rounded-lg ${theme.secondary} ${theme.text}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Convert Button */}
      <button
        onClick={handleConvert}
        disabled={
          (mode === "toHex" && !textInput) || (mode === "toText" && !hexOutput)
        }
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white disabled:opacity-50`}
      >
        {content.common.convert}
      </button>
    </div>
  );
}
