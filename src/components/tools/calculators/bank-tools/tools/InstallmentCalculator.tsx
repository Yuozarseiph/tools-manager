"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBankToolsUIContent } from "../bank-tools.content";

export default function InstallmentCalculator() {
  const theme = useThemeColors();
  const content = useBankToolsUIContent();

  const [cashPrice, setCashPrice] = useState("20000000");
  const [downPayment, setDownPayment] = useState("5000000");
  const [numberOfInstallments, setNumberOfInstallments] = useState("6");
  const [interestRate, setInterestRate] = useState("12");
  const [result, setResult] = useState<{
    monthlyInstallment: number;
    totalPrice: number;
    extraCost: number;
  } | null>(null);

  const calculate = () => {
    const cash = parseFloat(cashPrice);
    const down = parseFloat(downPayment);
    const installments = parseInt(numberOfInstallments);
    const rate = parseFloat(interestRate) / 100;

    if (isNaN(cash) || isNaN(down) || isNaN(installments) || isNaN(rate))
      return;

    const loanAmount = cash - down;
    const totalInterest = loanAmount * rate * (installments / 12);
    const totalPrice = cash + totalInterest;
    const monthlyInstallment = (loanAmount + totalInterest) / installments;
    const extraCost = totalPrice - cash;

    setResult({ monthlyInstallment, totalPrice, extraCost });
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.installment.labels.cashPrice}
          </label>
          <input
            type="number"
            value={cashPrice}
            onChange={(e) => setCashPrice(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.installment.labels.downPayment}
          </label>
          <input
            type="number"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.installment.labels.numberOfInstallments}
          </label>
          <input
            type="number"
            value={numberOfInstallments}
            onChange={(e) => setNumberOfInstallments(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.installment.labels.interestRate}
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className={`w-full py-3 rounded-xl font-bold ${theme.primary} text-white`}
      >
        {content.common.calculate}
      </button>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.installment.labels.monthlyInstallment}
            </p>
            <p className={`text-2xl font-bold ${theme.text}`}>
              {result.monthlyInstallment.toLocaleString()}{" "}
              {content.common.currency}
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.installment.labels.totalPrice}
            </p>
            <p className={`text-2xl font-bold ${theme.text}`}>
              {result.totalPrice.toLocaleString()} {content.common.currency}
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.installment.labels.extraCost}
            </p>
            <p className={`text-2xl font-bold text-orange-500`}>
              {result.extraCost.toLocaleString()} {content.common.currency}
            </p>
          </div>
        </div>
      )}

      {/* Comparison */}
      {result && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <h4 className={`font-bold mb-3 ${theme.text}`}>
            {content.installment.modes.compare}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className={theme.textMuted}>قیمت نقدی:</span>
              <span className={`font-bold ${theme.text}`}>
                {parseFloat(cashPrice).toLocaleString()}{" "}
                {content.common.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={theme.textMuted}>قیمت اقساطی:</span>
              <span className={`font-bold ${theme.text}`}>
                {result.totalPrice.toLocaleString()} {content.common.currency}
              </span>
            </div>
            <div
              className={`flex justify-between pt-2 border-t ${theme.border}`}
            >
              <span className={theme.textMuted}>تفاوت:</span>
              <span className="font-bold text-red-500">
                {result.extraCost.toLocaleString()} {content.common.currency} (+
                {((result.extraCost / parseFloat(cashPrice)) * 100).toFixed(1)}
                %)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
