"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useMathToolsUIContent } from "../math-tools.content";
import { calculateBinary, type MathOperator } from "@/lib/safe-calculator";

export default function CalculatorTool() {
  const theme = useThemeColors();
  const content = useMathToolsUIContent();
  const [display, setDisplay] = useState("0");
  const [equation, setEquation] = useState("");
  const [isNewNumber, setIsNewNumber] = useState(true);

  const [pending, setPending] = useState<{ value: number; op: MathOperator } | null>(null);
  const MAX_DIGITS = 18;
  const format = (value: number) => String(value);
  const fail = () => {
    setDisplay("Error");
    setEquation("");
    setPending(null);
    setIsNewNumber(true);
  };

  const handleNumber = (num: string) => {
    if (isNewNumber || display === "Error") {
      setDisplay(num);
      setIsNewNumber(false);
    } else if (display.replace(/[^0-9]/g, "").length < MAX_DIGITS) {
      setDisplay(display === "0" ? num : display + num);
    }
  };

  const handleOperator = (op: MathOperator) => {
    const n = Number(display);
    if (!Number.isFinite(n)) return fail();
    let first = n;
    if (pending && !isNewNumber) {
      const intermediate = calculateBinary(pending.value, pending.op, n);
      if (intermediate === null) return fail();
      first = intermediate;
      setDisplay(format(first));
    } else if (pending) {
      first = pending.value;
    }
    setPending({ value: first, op });
    setEquation(`${first} ${op} `);
    setIsNewNumber(true);
  };

  const handleEqual = () => {
    if (!pending || isNewNumber) return;
    const result = calculateBinary(pending.value, pending.op, Number(display));
    if (result === null) return fail();
    setDisplay(format(result));
    setEquation("");
    setPending(null);
    setIsNewNumber(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setEquation("");
    setPending(null);
    setIsNewNumber(true);
  };

  const handleDecimal = () => {
    if (isNewNumber || display === "Error") {
      setDisplay("0.");
      setIsNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const handlePercent = () => {
    const value = Number(display) / 100;
    if (!Number.isFinite(value)) return fail();
    setDisplay(format(value));
  };

  const handlePlusMinus = () => {
    const value = -Number(display);
    if (!Number.isFinite(value)) return fail();
    setDisplay(format(value));
  };

  const Button = ({
    children,
    onClick,
    variant = "default",
    span = 1,
  }: {
    children: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "operator" | "special" | "equal";
    span?: number;
  }) => {
    const variants = {
      default: `${theme.bg} ${theme.text} hover:opacity-80`,
      operator: "bg-[var(--app-primary-bg)] text-white hover:bg-[var(--app-primary-hover)]",
      special:
        "bg-slate-300 dark:bg-slate-600 text-slate-800 dark:text-white hover:opacity-80",
      equal: "bg-green-500 text-white hover:bg-green-600",
    };

    return (
      <button
        onClick={onClick}
        className={`p-4 rounded-xl font-bold text-xl transition-all active:scale-95 ${
          variants[variant]
        } ${span === 2 ? "col-span-2" : ""}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="max-w-sm mx-auto">
      {/* Display */}
      <div className={`p-4 rounded-xl mb-4 ${theme.bg} border ${theme.border}`}>
        <p className={`text-sm h-6 ${theme.textMuted}`}>{equation}</p>
        <p className={`text-3xl font-bold text-left ${theme.text}`}>
          {display}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        <Button onClick={handleClear} variant="special">
          C
        </Button>
        <Button onClick={handlePlusMinus} variant="special">
          ±
        </Button>
        <Button onClick={handlePercent} variant="special">
          %
        </Button>
        <Button onClick={() => handleOperator("÷")} variant="operator">
          ÷
        </Button>

        <Button onClick={() => handleNumber("7")}>7</Button>
        <Button onClick={() => handleNumber("8")}>8</Button>
        <Button onClick={() => handleNumber("9")}>9</Button>
        <Button onClick={() => handleOperator("×")} variant="operator">
          ×
        </Button>

        <Button onClick={() => handleNumber("4")}>4</Button>
        <Button onClick={() => handleNumber("5")}>5</Button>
        <Button onClick={() => handleNumber("6")}>6</Button>
        <Button onClick={() => handleOperator("-")} variant="operator">
          −
        </Button>

        <Button onClick={() => handleNumber("1")}>1</Button>
        <Button onClick={() => handleNumber("2")}>2</Button>
        <Button onClick={() => handleNumber("3")}>3</Button>
        <Button onClick={() => handleOperator("+")} variant="operator">
          +
        </Button>

        <Button onClick={() => handleNumber("0")} span={2}>
          0
        </Button>
        <Button onClick={handleDecimal}>.</Button>
        <Button onClick={handleEqual} variant="equal">
          =
        </Button>
      </div>
    </div>
  );
}
