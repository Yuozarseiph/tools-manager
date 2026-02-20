"use client";

import { useState, useEffect } from "react";
import { useThemeColors } from "@/hooks/useThemeColors";
import { useBankToolsUIContent } from "../bank-tools.content";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
}

export default function ExpenseManager() {
  const theme = useThemeColors();
  const content = useBankToolsUIContent();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("bank-transactions");
    if (saved) setTransactions(JSON.parse(saved));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("bank-transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    if (!formData.amount || !formData.category) return;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  // Chart data
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value,
  }));
  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-green-500" />
            <p className={`text-sm ${theme.textMuted}`}>
              {content.expense.labels.totalIncome}
            </p>
          </div>
          <p className={`text-2xl font-bold text-green-500`}>
            {totalIncome.toLocaleString()} {content.common.currency}
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown size={20} className="text-red-500" />
            <p className={`text-sm ${theme.textMuted}`}>
              {content.expense.labels.totalExpense}
            </p>
          </div>
          <p className={`text-2xl font-bold text-red-500`}>
            {totalExpense.toLocaleString()} {content.common.currency}
          </p>
        </div>
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign
              size={20}
              className={netBalance >= 0 ? "text-blue-500" : "text-orange-500"}
            />
            <p className={`text-sm ${theme.textMuted}`}>
              {content.expense.labels.netBalance}
            </p>
          </div>
          <p
            className={`text-2xl font-bold ${
              netBalance >= 0 ? "text-blue-500" : "text-orange-500"
            }`}
          >
            {netBalance.toLocaleString()} {content.common.currency}
          </p>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${theme.primary} text-white`}
      >
        <Plus size={20} />
        {content.expense.labels.addTransaction}
      </button>

      {/* Add Form */}
      {showForm && (
        <div
          className={`p-4 rounded-xl border ${theme.border} ${theme.bg} space-y-4`}
        >
          <div className="flex gap-2">
            <button
              onClick={() => setFormData({ ...formData, type: "income" })}
              className={`flex-1 py-2 rounded-xl font-medium ${
                formData.type === "income"
                  ? "bg-green-500 text-white"
                  : `${theme.secondary} ${theme.text}`
              }`}
            >
              {content.expense.labels.income}
            </button>
            <button
              onClick={() => setFormData({ ...formData, type: "expense" })}
              className={`flex-1 py-2 rounded-xl font-medium ${
                formData.type === "expense"
                  ? "bg-red-500 text-white"
                  : `${theme.secondary} ${theme.text}`
              }`}
            >
              {content.expense.labels.expense}
            </button>
          </div>

          <input
            type="number"
            placeholder={content.common.amount}
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />

          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          >
            <option value="">{content.common.category}</option>
            {Object.entries(content.expense.categories[formData.type]).map(
              ([key, label]) => (
                <option key={key} value={label}>
                  {label}
                </option>
              )
            )}
          </select>

          <input
            type="text"
            placeholder={content.common.description}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />

          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={`w-full p-3 rounded-xl border ${theme.border} ${theme.bg} ${theme.text}`}
          />

          <div className="flex gap-2">
            <button
              onClick={addTransaction}
              className={`flex-1 py-2 rounded-xl font-bold ${theme.primary} text-white`}
            >
              {content.common.add}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className={`flex-1 py-2 rounded-xl font-medium ${theme.secondary} ${theme.text}`}
            >
              {content.common.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
          <h4 className={`font-bold mb-4 ${theme.text}`}>
            {content.expense.labels.expense} - {content.common.chart}
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => entry.name}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transactions List */}
      <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg}`}>
        <h4 className={`font-bold mb-3 ${theme.text}`}>
          تراکنش‌ها ({transactions.length})
        </h4>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className={`text-center py-8 ${theme.textMuted}`}>
              هنوز تراکنشی ثبت نشده است
            </p>
          ) : (
            transactions.map((t) => (
              <div
                key={t.id}
                className={`flex items-center justify-between p-3 rounded-lg ${theme.secondary}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`font-bold ${
                        t.type === "income" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}{" "}
                      {t.amount.toLocaleString()} {content.common.currency}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${theme.bg}`}>
                      {t.category}
                    </span>
                  </div>
                  <p className={`text-sm ${theme.textMuted}`}>
                    {t.description || "-"}
                  </p>
                  <p className={`text-xs ${theme.textMuted}`}>{t.date}</p>
                </div>
                <button
                  onClick={() => deleteTransaction(t.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
