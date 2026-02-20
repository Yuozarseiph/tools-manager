"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  PiggyBank,
  ShoppingCart,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useBankToolsUIContent } from "./bank-tools.content";

// Import all tools
import LoanCalculator from "./tools/LoanCalculator";
import DepositCalculator from "./tools/DepositCalculator";
import InstallmentCalculator from "./tools/InstallmentCalculator";
import SavingCalculator from "./tools/SavingCalculator";
import ExpenseManager from "./tools/ExpenseManager";

type ToolId = "loan" | "deposit" | "installment" | "saving" | "expense";

const toolIcons: Record<ToolId, React.ReactNode> = {
  loan: <Calculator size={20} />,
  deposit: <PiggyBank size={20} />,
  installment: <ShoppingCart size={20} />,
  saving: <TrendingUp size={20} />,
  expense: <Wallet size={20} />,
};

const toolComponents: Record<ToolId, React.FC> = {
  loan: LoanCalculator,
  deposit: DepositCalculator,
  installment: InstallmentCalculator,
  saving: SavingCalculator,
  expense: ExpenseManager,
};

const toolIds: ToolId[] = [
  "loan",
  "deposit",
  "installment",
  "saving",
  "expense",
];

export default function BankToolsMain() {
  const theme = useThemeColors();
  const content = useBankToolsUIContent();
  const [activeTool, setActiveTool] = useState<ToolId>("loan");

  const ActiveComponent = toolComponents[activeTool];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Tool Selection */}
      <div
        className={`lg:col-span-1 p-4 rounded-2xl border ${theme.card} ${theme.border}`}
      >
        <h3 className={`font-bold mb-4 ${theme.text}`}>
          {content.common.selectTool}
        </h3>
        <div className="space-y-1 max-h-[600px] overflow-y-auto">
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
