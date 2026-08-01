"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "../security-tools.content";
import { Lock, Unlock, Copy, Check } from "lucide-react";
import CryptoJS from "crypto-js";

export default function AESEncryption() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();

  const [plainText, setPlainText] = useState("");
  const [encryptedText, setEncryptedText] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleEncrypt = () => {
    setError("");
    if (!plainText || !secretKey) {
      setError("لطفاً متن و کلید را وارد کنید");
      return;
    }

    if (secretKey.length < 16) {
      setError(content.aesEncryption.keyHint);
      return;
    }

    try {
      const encrypted = CryptoJS.AES.encrypt(plainText, secretKey).toString();
      setEncryptedText(encrypted);
    } catch (err) {
      setError("خطا در رمزنگاری");
    }
  };

  const handleDecrypt = () => {
    setError("");
    if (!encryptedText || !secretKey) {
      setError("لطفاً متن رمزشده و کلید را وارد کنید");
      return;
    }

    if (secretKey.length < 16) {
      setError(content.aesEncryption.keyHint);
      return;
    }

    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedText, secretKey).toString(
        CryptoJS.enc.Utf8
      );
      if (!decrypted) {
        setError("کلید اشتباه است یا متن رمزشده معتبر نیست");
        return;
      }
      setPlainText(decrypted);
    } catch (err) {
      setError("خطا در رمزگشایی - کلید اشتباه است");
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
          onClick={() => setMode("encrypt")}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
            mode === "encrypt"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          <Lock size={20} />
          {content.aesEncryption.encrypt}
        </button>
        <button
          onClick={() => setMode("decrypt")}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
            mode === "decrypt"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          <Unlock size={20} />
          {content.aesEncryption.decrypt}
        </button>
      </div>

      {/* Secret Key */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.aesEncryption.secretKey}
        </label>
        <input
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder={content.aesEncryption.keyHint}
          className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
        />
      </div>

      {/* Plain Text */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.aesEncryption.plainText}
        </label>
        <div className="relative">
          <textarea
            value={plainText}
            onChange={(e) => setPlainText(e.target.value)}
            rows={6}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
          {plainText && (
            <button
              onClick={() => copyToClipboard(plainText)}
              className={`absolute top-2 left-2 p-2 rounded-lg ${theme.secondary} ${theme.text}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Encrypted Text */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.aesEncryption.encryptedText}
        </label>
        <div className="relative">
          <textarea
            value={encryptedText}
            onChange={(e) => setEncryptedText(e.target.value)}
            rows={6}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
          {encryptedText && (
            <button
              onClick={() => copyToClipboard(encryptedText)}
              className={`absolute top-2 left-2 p-2 rounded-lg ${theme.secondary} ${theme.text}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={mode === "encrypt" ? handleEncrypt : handleDecrypt}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${theme.primary} text-white`}
      >
        {mode === "encrypt" ? <Lock size={20} /> : <Unlock size={20} />}
        {mode === "encrypt"
          ? content.aesEncryption.encrypt
          : content.aesEncryption.decrypt}
      </button>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-[var(--app-error-bg)] border border-[var(--app-error-border)]">
          <p className="text-[var(--app-error-text)] text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
