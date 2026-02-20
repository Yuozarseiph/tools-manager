// components/tools/security/security-tools/SecurityToolsMain.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QrCode,
  Barcode,
  Lock,
  FileText,
  Code2,
  Radio,
  Binary,
  Hash,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useSecurityToolsUIContent } from "./security-tools.content";

// Import all tools
import QRScanner from "./tools/QRScanner";
import BarcodeGenerator from "./tools/BarcodeGenerator";
import AESEncryption from "./tools/AESEncryption";
import OneTimeNote from "./tools/OneTimeNote";
import HTMLToText from "./tools/HTMLToText";
import TextToMorse from "./tools/TextToMorse";
import TextToBinary from "./tools/TextToBinary";
import TextToHex from "./tools/TextToHex";

type ToolId =
  | "qrScanner"
  | "barcodeGenerator"
  | "aesEncryption"
  | "oneTimeNote"
  | "htmlToText"
  | "textToMorse"
  | "textToBinary"
  | "textToHex";

const toolIcons: Record<ToolId, React.ReactNode> = {
  qrScanner: <QrCode size={20} />,
  barcodeGenerator: <Barcode size={20} />,
  aesEncryption: <Lock size={20} />,
  oneTimeNote: <FileText size={20} />,
  htmlToText: <Code2 size={20} />,
  textToMorse: <Radio size={20} />,
  textToBinary: <Binary size={20} />,
  textToHex: <Hash size={20} />,
};

const toolComponents: Record<ToolId, React.FC> = {
  qrScanner: QRScanner,
  barcodeGenerator: BarcodeGenerator,
  aesEncryption: AESEncryption,
  oneTimeNote: OneTimeNote,
  htmlToText: HTMLToText,
  textToMorse: TextToMorse,
  textToBinary: TextToBinary,
  textToHex: TextToHex,
};

const toolIds: ToolId[] = [
  "qrScanner",
  "barcodeGenerator",
  "aesEncryption",
  "oneTimeNote",
  "htmlToText",
  "textToMorse",
  "textToBinary",
  "textToHex",
];

export default function SecurityToolsMain() {
  const theme = useThemeColors();
  const content = useSecurityToolsUIContent();
  const [activeTool, setActiveTool] = useState<ToolId>("qrScanner");

  const ActiveComponent = toolComponents[activeTool];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div
        className={`lg:col-span-1 p-4 rounded-2xl border ${theme.card} ${theme.border}`}
      >
        <h3 className={`font-bold mb-4 ${theme.text}`}>
          {content.common.selectTool}
        </h3>
        <div className="space-y-1">
          {toolIds.map((id) => (
            <button
              key={id}
              onClick={() => setActiveTool(id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-right transition-all ${
                activeTool === id
                  ? `${theme.primary} text-white`
                  : `${theme.bg} ${theme.text} hover:opacity-80`
              }`}
            >
              {toolIcons[id]}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {content.tools[id].name}
                </p>
                <p
                  className={`text-xs truncate ${
                    activeTool === id ? "text-white/70" : theme.textMuted
                  }`}
                >
                  {content.tools[id].desc}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Tool Area */}
      <div
        className={`lg:col-span-3 p-6 rounded-2xl border ${theme.card} ${theme.border}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h2
              className={`text-xl font-bold mb-6 flex items-center gap-3 ${theme.text}`}
            >
              {toolIcons[activeTool]}
              {content.tools[activeTool].name}
            </h2>
            <ActiveComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
