"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "../security-tools.content";
import { Radio, Type, Copy, Check, Volume2 } from "lucide-react";

const MORSE_CODE: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  " ": "/",
};

export default function TextToMorse() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();

  const [textInput, setTextInput] = useState("");
  const [morseOutput, setMorseOutput] = useState("");
  const [mode, setMode] = useState<"toMorse" | "toText">("toMorse");
  const [copied, setCopied] = useState(false);

  const textToMorse = (text: string) => {
    return text
      .toUpperCase()
      .split("")
      .map((char) => MORSE_CODE[char] || char)
      .join(" ");
  };

  const morseToText = (morse: string) => {
    const reverseMorse = Object.fromEntries(
      Object.entries(MORSE_CODE).map(([k, v]) => [v, k])
    );
    return morse
      .split(" ")
      .map((code) => reverseMorse[code] || code)
      .join("");
  };

  const handleConvert = () => {
    if (mode === "toMorse") {
      setMorseOutput(textToMorse(textInput));
    } else {
      setTextInput(morseToText(morseOutput));
    }
  };

  const playMorseSound = () => {
    const audioContext = new AudioContext();
    const morse = mode === "toMorse" ? morseOutput : textToMorse(textInput);
    let time = audioContext.currentTime;

    morse.split("").forEach((char) => {
      if (char === ".") {
        playBeep(audioContext, time, 0.1);
        time += 0.15;
      } else if (char === "-") {
        playBeep(audioContext, time, 0.3);
        time += 0.35;
      } else if (char === " ") {
        time += 0.1;
      } else if (char === "/") {
        time += 0.3;
      }
    });
  };

  const playBeep = (
    audioContext: AudioContext,
    time: number,
    duration: number
  ) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 600;
    gainNode.gain.value = 0.3;

    oscillator.start(time);
    oscillator.stop(time + duration);
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
          onClick={() => setMode("toMorse")}
          className={`flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
            mode === "toMorse"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          <Radio size={20} />
          {content.textToMorse.toMorse}
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
          {content.textToMorse.toText}
        </button>
      </div>

      {/* Text Input */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.textToMorse.textInput}
        </label>
        <div className="relative">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={4}
            placeholder="Hello World"
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

      {/* Morse Output */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
          {content.textToMorse.morseOutput}
        </label>
        <div className="relative">
          <textarea
            value={morseOutput}
            onChange={(e) => setMorseOutput(e.target.value)}
            rows={4}
            placeholder=".... . .-.. .-.. --- / .-- --- .-. .-.. -.."
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text} font-mono`}
          />
          {morseOutput && (
            <button
              onClick={() => copyToClipboard(morseOutput)}
              className={`absolute top-2 left-2 p-2 rounded-lg ${theme.secondary} ${theme.text}`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleConvert}
          className={`py-3 rounded-xl font-bold ${theme.primary} text-white`}
        >
          {content.common.convert}
        </button>
        <button
          onClick={playMorseSound}
          disabled={!morseOutput && !textInput}
          className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${theme.secondary} ${theme.text} disabled:opacity-50`}
        >
          <Volume2 size={20} />
          {content.textToMorse.playSound}
        </button>
      </div>
    </div>
  );
}
