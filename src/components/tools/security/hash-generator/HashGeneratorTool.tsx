"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useHashGeneratorContent,
  type HashGeneratorToolContent,
} from "./hash-generator.content";

export default function HashGeneratorTool() {
  const theme = useThemeColors();
  const content: HashGeneratorToolContent = useHashGeneratorContent();

  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState({
    sha1: "",
    sha256: "",
    sha384: "",
    sha512: "",
  });
  const [copied, setCopied] = useState<string | null>(null);

  const generateHash = async (text: string, algorithm: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest(algorithm, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  useEffect(() => {
    if (!input) {
      setHashes({
        sha1: "",
        sha256: "",
        sha384: "",
        sha512: "",
      });
      return;
    }

    const updateHashes = async () => {
      const [sha1, sha256, sha384, sha512] = await Promise.all([
        generateHash(input, "SHA-1"),
        generateHash(input, "SHA-256"),
        generateHash(input, "SHA-384"),
        generateHash(input, "SHA-512"),
      ]);
      setHashes({ sha1, sha256, sha384, sha512 });
    };

    updateHashes();
  }, [input]);

  const copyToClipboard = (text: string, type: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid gap-8">
      <div
        className={`p-6 rounded-3xl border shadow-sm ${theme.card} ${theme.border}`}
      >
        <label className={`block text-sm font-bold mb-4 ${theme.textMuted}`}>
          {content.ui.input.label}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={content.ui.input.placeholder}
          className={`w-full p-4 h-32 rounded-2xl resize-none outline-none border focus:ring-2 ring-blue-500/20 transition-all ${theme.bg} ${theme.border} ${theme.text}`}
        />
      </div>

      <div className="grid gap-4">
        <HashRow
          label={content.ui.algorithms.sha1}
          value={hashes.sha1}
          onCopy={() => copyToClipboard(hashes.sha1, "sha1")}
          isCopied={copied === "sha1"}
          theme={theme}
          emptyText={content.ui.hashRow.empty}
        />
        <HashRow
          label={content.ui.algorithms.sha256}
          value={hashes.sha256}
          onCopy={() => copyToClipboard(hashes.sha256, "sha256")}
          isCopied={copied === "sha256"}
          theme={theme}
          emptyText={content.ui.hashRow.empty}
        />
        <HashRow
          label={content.ui.algorithms.sha384}
          value={hashes.sha384}
          onCopy={() => copyToClipboard(hashes.sha384, "sha384")}
          isCopied={copied === "sha384"}
          theme={theme}
          emptyText={content.ui.hashRow.empty}
        />
        <HashRow
          label={content.ui.algorithms.sha512}
          value={hashes.sha512}
          onCopy={() => copyToClipboard(hashes.sha512, "sha512")}
          isCopied={copied === "sha512"}
          theme={theme}
          emptyText={content.ui.hashRow.empty}
        />
      </div>
    </div>
  );
}

function HashRow({
  label,
  value,
  onCopy,
  isCopied,
  theme,
  emptyText,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
  theme: any;
  emptyText: string;
}) {
  return (
    <div
      className={`relative p-4 rounded-2xl border flex flex-col gap-2 group transition-all ${
        value ? theme.bg : "opacity-50"
      } ${theme.border}`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-bold px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 ${theme.textMuted}`}
        >
          {label}
        </span>
        {value && (
          <button
            onClick={onCopy}
            className={`p-2 rounded-lg transition-colors ${
              isCopied
                ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            {isCopied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}
      </div>
      <code className={`font-mono text-sm break-all pr-1 ${theme.text}`}>
        {value || emptyText}
      </code>
    </div>
  );
}
