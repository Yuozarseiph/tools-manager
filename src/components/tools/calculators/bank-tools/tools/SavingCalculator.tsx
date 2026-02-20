"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBankToolsUIContent } from "../bank-tools.content";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface YearData {
  year: number;
  deposits: number;
  interest: number;
  balance: number;
}

export default function SavingCalculator() {
  const theme = useThemeColors();
  const content = useBankToolsUIContent();

  const [initialAmount, setInitialAmount] = useState("10000000");
  const [monthlyDeposit, setMonthlyDeposit] = useState("2000000");
  const [annualReturn, setAnnualReturn] = useState("15");
  const [period, setPeriod] = useState("5");
  const [result, setResult] = useState<{
    finalValue: number;
    totalDeposited: number;
    totalEarned: number;
    yearlyData: YearData[];
  } | null>(null);

  const calculate = () => {
    const initial = parseFloat(initialAmount);
    const monthly = parseFloat(monthlyDeposit);
    const rate = parseFloat(annualReturn) / 100 / 12;
    const years = parseInt(period);

    if (isNaN(initial) || isNaN(monthly) || isNaN(rate) || isNaN(years)) return;

    let balance = initial;
    let totalDeposited = initial;
    const yearlyData: YearData[] = [];

    for (let year = 1; year <= years; year++) {
      let yearDeposits = 0;
      let yearStartBalance = balance;

      for (let month = 1; month <= 12; month++) {
        balance += monthly;
        balance *= 1 + rate;
        yearDeposits += monthly;
        totalDeposited += monthly;
      }

      const yearInterest = balance - yearStartBalance - yearDeposits;

      yearlyData.push({
        year,
        deposits: yearDeposits,
        interest: yearInterest,
        balance,
      });
    }

    const totalEarned = balance - totalDeposited;

    setResult({
      finalValue: balance,
      totalDeposited,
      totalEarned,
      yearlyData,
    });
  };

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.saving.labels.initialAmount}
          </label>
          <input
            type="number"
            value={initialAmount}
            onChange={(e) => setInitialAmount(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.saving.labels.monthlyDeposit}
          </label>
          <input
            type="number"
            value={monthlyDeposit}
            onChange={(e) => setMonthlyDeposit(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.saving.labels.annualReturn}
          </label>
          <input
            type="number"
            value={annualReturn}
            onChange={(e) => setAnnualReturn(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.saving.labels.period}
          </label>
          <input
            type="number"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
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

      {/* Summary */}
      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}
            >
              <p className={`text-sm ${theme.textMuted} mb-1`}>
                {content.saving.labels.finalValue}
              </p>
              <p className={`text-2xl font-bold ${theme.text}`}>
                {result.finalValue.toLocaleString()} {content.common.currency}
              </p>
            </div>
            <div
              className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}
            >
              <p className={`text-sm ${theme.textMuted} mb-1`}>
                {content.saving.labels.totalDeposited}
              </p>
              <p className={`text-2xl font-bold ${theme.text}`}>
                {result.totalDeposited.toLocaleString()}{" "}
                {content.common.currency}
              </p>
            </div>
            <div
              className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}
            >
              <p className={`text-sm ${theme.textMuted} mb-1`}>
                {content.saving.labels.totalEarned}
              </p>
              <p className={`text-2xl font-bold text-green-500`}>
                {result.totalEarned.toLocaleString()} {content.common.currency}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <h4 className={`font-bold mb-4 ${theme.text}`}>
              {content.common.chart}
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={result.yearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  label={{
                    value: content.saving.labels.year,
                    position: "insideBottom",
                    offset: -5,
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => value.toLocaleString()}
                  labelFormatter={(label) =>
                    `${content.saving.labels.year} ${label}`
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#3b82f6"
                  name={content.saving.labels.balance}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="deposits"
                  stroke="#10b981"
                  name={content.saving.labels.deposits}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="interest"
                  stroke="#f59e0b"
                  name={content.saving.labels.interest}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Yearly Breakdown */}
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <h4 className={`font-bold mb-3 ${theme.text}`}>
              {content.saving.labels.yearlyBreakdown}
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${theme.border}`}>
                    <th className={`p-2 text-right ${theme.text}`}>
                      {content.saving.labels.year}
                    </th>
                    <th className={`p-2 text-right ${theme.text}`}>
                      {content.saving.labels.deposits}
                    </th>
                    <th className={`p-2 text-right ${theme.text}`}>
                      {content.saving.labels.interest}
                    </th>
                    <th className={`p-2 text-right ${theme.text}`}>
                      {content.saving.labels.balance}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map((row) => (
                    <tr key={row.year} className={`border-b ${theme.border}`}>
                      <td className={`p-2 ${theme.text}`}>{row.year}</td>
                      <td className={`p-2 ${theme.text}`}>
                        {row.deposits.toLocaleString()}
                      </td>
                      <td className={`p-2 text-green-500`}>
                        {row.interest.toLocaleString()}
                      </td>
                      <td className={`p-2 font-bold ${theme.text}`}>
                        {row.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
