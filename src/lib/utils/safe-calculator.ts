export type MathOperator = "+" | "−" | "×" | "÷";
/** Explicit finite-only arithmetic: never interpret a string as JavaScript. */
export function calculateBinary(a: number, operator: MathOperator, b: number): number | null {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  if (operator === "÷" && b === 0) return null;
  const result = operator === "+" ? a + b
    : operator === "−" ? a - b
    : operator === "×" ? a * b
    : a / b;
  return Number.isFinite(result) ? Number(result.toPrecision(14)) : null;
}
