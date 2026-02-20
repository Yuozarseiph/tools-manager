"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "../security-tools.content";
import { Binary, Type, Copy, Check } from "lucide-react";

export default function TextToBinary() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();

  const [textInput, setTextInput] = useState("");
  const [binaryOutput, setBinaryOutput] = useState("");
  const [mode, setMode] = useState<"toBinary" | "toText">("toBinary");
  const [separator, setSeparator] = useState("space");
  const [copied, setCopied] = useState(false);

  const getSeparator = () => {
    switch (separator) {
      case "space":
        return " ";
      case "comma":
        return ",";
      case "none":
        return "";
      default:
        return " ";
    }
  };

  const textToBinary = (text: string) => {
    const sep = getSeparator();
    return text
      .split("")
      .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
      .join(sep);
  };

  const binaryToText = (binary: string) => {
    // Remove all separators
    const cleaned = binary.replace(/[,\s]/g, "");

    // Split into 8-bit chunks
    const chunks = cleaned.match(/.{1,8}/g) || [];

    return chunks
      .map((chunk) => String.fromCharCode(parseInt(chunk, 2)))
      .join("");
  };

  const handleConvert = () => {
    if (mode === "toBinary") {
      setBinaryOutput(textToBinary(textInput));
    } else {
      setTextInput(binaryToText(binaryOutput));
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
          onClick={() => setMode("toBinary")}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
            mode === "toBinary"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          <Binary size={20} />
          {content.textToBinary.toBinary}
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
          {content.textToBinary.toText}
        </button>
      </div>

      {/* Separator Selection */}
      {mode === "toBinary" && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.textToBinary.separator}
          </label>
          <div className="flex gap-2">
            {(["space", "comma", "none"] as const).map((sep) => (
              <button
                key={sep}
                onClick={() => setSeparator(sep)}
                className={`flex-1 py-2 rounded-xl font-medium ${
                  separator === sep
                    ? `${theme.primary} text-white`
                    : `${theme.bg} ${theme.text} border ${theme.border}`
                }`}
              >
                {content.textToBinary.separators[sep]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.textToBinary.textInput}
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

      {/* Binary Output */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.textToBinary.binaryOutput}
        </label>
        <div className="relative">
          <textarea
            value={binaryOutput}
            onChange={(e) => setBinaryOutput(e.target.value)}
            rows={4}
            placeholder="01001000 01100101 01101100 01101100 01101111"
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text} font-mono text-sm`}
          />
          {binaryOutput && (
            <button
              onClick={() => copyToClipboard(binaryOutput)}
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
          (mode === "toBinary" && !textInput) ||
          (mode === "toText" && !binaryOutput)
        }
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white disabled:opacity-50`}
      >
        {content.common.convert}
      </button>
    </div>
  );
}
