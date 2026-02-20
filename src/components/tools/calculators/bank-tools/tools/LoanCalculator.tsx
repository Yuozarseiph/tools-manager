"use client";

import { useState } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBankToolsUIContent } from "../bank-tools.content";
import { Download } from "lucide-react";

interface PaymentRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export default function LoanCalculator() {
  const theme = useThemeColors();
  const content = useBankToolsUIContent();

  const [loanAmount, setLoanAmount] = useState("100000000");
  const [interestRate, setInterestRate] = useState("18");
  const [loanTerm, setLoanTerm] = useState("12");
  const [loanType, setLoanType] = useState<"fixed" | "reducing">("reducing");
  const [schedule, setSchedule] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterest: number;
  } | null>(null);

  const calculate = () => {
    const principal = parseFloat(loanAmount);
    const ratePercent = parseFloat(interestRate); // ✅ تبدیل به number
    const rate = ratePercent / 100 / 12;
    const term = parseInt(loanTerm);

    if (isNaN(principal) || isNaN(ratePercent) || isNaN(term) || term <= 0)
      return;

    let monthlyPayment = 0;
    let totalPayment = 0;
    let totalInterest = 0;
    const payments: PaymentRow[] = [];

    if (loanType === "reducing") {
      // سود نزولی (Reducing Balance)
      monthlyPayment =
        (principal * rate * Math.pow(1 + rate, term)) /
        (Math.pow(1 + rate, term) - 1);
      let balance = principal;

      for (let i = 1; i <= term; i++) {
        const interestPayment = balance * rate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        payments.push({
          month: i,
          payment: monthlyPayment,
          principal: principalPayment,
          interest: interestPayment,
          balance: Math.max(0, balance),
        });

        totalPayment += monthlyPayment;
        totalInterest += interestPayment;
      }
    } else {
      // سود ثابت (Fixed Interest)
      totalInterest = principal * (ratePercent / 100) * (term / 12); // ✅ استفاده از ratePercent
      totalPayment = principal + totalInterest;
      monthlyPayment = totalPayment / term;
      const principalPerMonth = principal / term;
      const interestPerMonth = totalInterest / term;
      let balance = principal;

      for (let i = 1; i <= term; i++) {
        balance -= principalPerMonth;
        payments.push({
          month: i,
          payment: monthlyPayment,
          principal: principalPerMonth,
          interest: interestPerMonth,
          balance: Math.max(0, balance),
        });
      }
    }

    setSchedule(payments);
    setSummary({ monthlyPayment, totalPayment, totalInterest });
  };

  const exportToCSV = () => {
    if (schedule.length === 0) return;

    const headers = [
      content.loan.labels.month,
      content.loan.labels.payment,
      content.loan.labels.principal,
      content.loan.labels.interest,
      content.loan.labels.balance,
    ].join(",");

    const rows = schedule.map((row) =>
      [
        row.month,
        row.payment.toFixed(0),
        row.principal.toFixed(0),
        row.interest.toFixed(0),
        row.balance.toFixed(0),
      ].join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "loan-schedule.csv";
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Type Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setLoanType("reducing")}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            loanType === "reducing"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          {content.loan.types.reducing}
        </button>
        <button
          onClick={() => setLoanType("fixed")}
          className={`flex-1 py-3 rounded-xl font-medium transition-all ${
            loanType === "fixed"
              ? `${theme.primary} text-white`
              : `${theme.bg} ${theme.text} border ${theme.border}`
          }`}
        >
          {content.loan.types.fixed}
        </button>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.loan.labels.loanAmount}
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.loan.labels.interestRate}
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
            {content.loan.labels.loanTerm}
          </label>
          <input
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(e.target.value)}
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
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.loan.labels.monthlyPayment}
            </p>
            <p className={`text-2xl font-bold ${theme.text}`}>
              {summary.monthlyPayment.toLocaleString()}{" "}
              {content.common.currency}
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.loan.labels.totalPayment}
            </p>
            <p className={`text-2xl font-bold ${theme.text}`}>
              {summary.totalPayment.toLocaleString()} {content.common.currency}
            </p>
          </div>
          <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
            <p className={`text-sm ${theme.textMuted} mb-1`}>
              {content.loan.labels.totalInterest}
            </p>
            <p className={`text-2xl font-bold text-orange-500`}>
              {summary.totalInterest.toLocaleString()} {content.common.currency}
            </p>
          </div>
        </div>
      )}

      {/* Payment Schedule */}
      {schedule.length > 0 && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <div className="flex justify-between items-center mb-4">
            <h3 className={`font-bold ${theme.text}`}>
              {content.loan.labels.paymentSchedule}
            </h3>
            <button
              onClick={exportToCSV}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${theme.secondary} ${theme.text} hover:opacity-80`}
            >
              <Download size={16} />
              {content.common.export}
            </button>
          </div>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm">
              <thead className={`sticky top-0 ${theme.bg}`}>
                <tr className={`border-b ${theme.border}`}>
                  <th className={`p-2 text-right ${theme.text}`}>
                    {content.loan.labels.month}
                  </th>
                  <th className={`p-2 text-right ${theme.text}`}>
                    {content.loan.labels.payment}
                  </th>
                  <th className={`p-2 text-right ${theme.text}`}>
                    {content.loan.labels.principal}
                  </th>
                  <th className={`p-2 text-right ${theme.text}`}>
                    {content.loan.labels.interest}
                  </th>
                  <th className={`p-2 text-right ${theme.text}`}>
                    {content.loan.labels.balance}
                  </th>
                </tr>
              </thead>
              <tbody>
                {schedule.map((row) => (
                  <tr key={row.month} className={`border-b ${theme.border}`}>
                    <td className={`p-2 ${theme.text}`}>{row.month}</td>
                    <td className={`p-2 ${theme.text}`}>
                      {row.payment.toLocaleString()}
                    </td>
                    <td className={`p-2 ${theme.text}`}>
                      {row.principal.toLocaleString()}
                    </td>
                    <td className={`p-2 text-orange-500`}>
                      {row.interest.toLocaleString()}
                    </td>
                    <td className={`p-2 ${theme.textMuted}`}>
                      {row.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
