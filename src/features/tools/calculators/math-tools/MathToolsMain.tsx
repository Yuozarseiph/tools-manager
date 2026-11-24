"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Percent,
  BarChart3,
  Superscript,
  Square,
  Box,
  Grid3X3,
  Shuffle,
  Hash,
  Variable,
  Binary,
  Divide,
  ArrowLeftRight,
  Waves,
  Sigma,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "./math-tools.content";

// Import all tools
import CalculatorTool from "./tools/Calculator";
import PercentageCalc from "./tools/PercentageCalc";
import StatisticsCalc from "./tools/StatisticsCalc";
import PowerRoot from "./tools/PowerRoot";
import Geometry2D from "./tools/Geometry2D";
import Geometry3D from "./tools/Geometry3D";
import FactorCalc from "./tools/FactorCalc";
import RandomNumber from "./tools/RandomNumber";
import PrimeChecker from "./tools/PrimeChecker";
import EquationSolver from "./tools/EquationSolver";
import LogarithmCalc from "./tools/LogarithmCalc";
import DecimalFraction from "./tools/DecimalFraction";
import BaseConverter from "./tools/BaseConverter";
import Fibonacci from "./tools/Fibonacci";
import Factorial from "./tools/Factorial";

type ToolId =
  | "calculator"
  | "percentage"
  | "statistics"
  | "powerRoot"
  | "geometry2d"
  | "geometry3d"
  | "factor"
  | "random"
  | "prime"
  | "equation"
  | "logarithm"
  | "decimalFraction"
  | "baseConverter"
  | "fibonacci"
  | "factorial";

const toolIcons: Record<ToolId, React.ReactNode> = {
  calculator: <Calculator size={20} />,
  percentage: <Percent size={20} />,
  statistics: <BarChart3 size={20} />,
  powerRoot: <Superscript size={20} />,
  geometry2d: <Square size={20} />,
  geometry3d: <Box size={20} />,
  factor: <Grid3X3 size={20} />,
  random: <Shuffle size={20} />,
  prime: <Hash size={20} />,
  equation: <Variable size={20} />,
  logarithm: <Binary size={20} />,
  decimalFraction: <Divide size={20} />,
  baseConverter: <ArrowLeftRight size={20} />,
  fibonacci: <Waves size={20} />,
  factorial: <Sigma size={20} />,
};

const toolComponents: Record<ToolId, React.FC> = {
  calculator: CalculatorTool,
  percentage: PercentageCalc,
  statistics: StatisticsCalc,
  powerRoot: PowerRoot,
  geometry2d: Geometry2D,
  geometry3d: Geometry3D,
  factor: FactorCalc,
  random: RandomNumber,
  prime: PrimeChecker,
  equation: EquationSolver,
  logarithm: LogarithmCalc,
  decimalFraction: DecimalFraction,
  baseConverter: BaseConverter,
  fibonacci: Fibonacci,
  factorial: Factorial,
};

const toolIds: ToolId[] = [
  "calculator",
  "percentage",
  "statistics",
  "powerRoot",
  "geometry2d",
  "geometry3d",
  "factor",
  "random",
  "prime",
  "equation",
  "logarithm",
  "decimalFraction",
  "baseConverter",
  "fibonacci",
  "factorial",
];

export default function MathToolsMain() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [activeTool, setActiveTool] = useState<ToolId>("calculator");

  const ActiveComponent = toolComponents[activeTool];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Tool Selection */}
      <div
        className={`lg:col-span-1 p-4 rounded-2xl border ${theme.card} ${theme.border}`}
      >
        <h3 className={`font-bold mb-4 ${theme.text}`}>انتخاب ابزار</h3>
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
