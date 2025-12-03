"use client";

import { useState, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  UploadCloud,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
} from "lucide-react";
import CustomDropdown from "@/components/ui/CustomDropdown";

type DataRow = { [key: string]: any };

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ff6b6b",
  "#4ecdc4",
];

export default function ExcelChartTool() {
  const theme = useThemeColors();
  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">(
    "bar"
  );
  const [xAxisKey, setXAxisKey] = useState<string>("");
  const [dataKey, setDataKey] = useState<string>("");

  // --- آپلود فایل ---
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData: DataRow[] = XLSX.utils.sheet_to_json(ws);

      if (jsonData.length > 0) {
        setData(jsonData);
        const keys = Object.keys(jsonData[0]);
        setHeaders(keys);
        // پیش‌فرض هوشمند: اولین ستون متنی برای X و اولین ستون عددی برای Data
        const textCol =
          keys.find((k) => typeof jsonData[0][k] === "string") || keys[0];
        const numCol =
          keys.find((k) => typeof jsonData[0][k] === "number") ||
          keys[1] ||
          keys[0];
        setXAxisKey(textCol);
        setDataKey(numCol);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${theme.card} ${theme.border} shadow-sm`}
    >
      {/* Toolbar Section */}
      <div className={`p-6 border-b flex flex-col gap-6 ${theme.border}`}>
        {/* Upload & Chart Type Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto active:scale-95">
            <UploadCloud size={20} />
            <span>
              {data.length > 0 ? "تغییر فایل اکسل" : "آپلود فایل اکسل"}
            </span>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {data.length > 0 && (
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-xl border border-transparent dark:border-white/5">
              {[
                { id: "bar", icon: BarChart3, label: "میله‌ای" },
                { id: "line", icon: LineChartIcon, label: "خطی" },
                { id: "area", icon: AreaChartIcon, label: "منطقه‌ای" },
                { id: "pie", icon: PieChartIcon, label: "دایره‌ای" },
              ].map((type) => (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id as any)}
                  className={`
                                p-2 rounded-lg transition-all duration-200 relative group
                                ${
                                  chartType === type.id
                                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5"
                                }
                            `}
                  title={type.label}
                >
                  <type.icon
                    size={20}
                    strokeWidth={chartType === type.id ? 2.5 : 2}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chart Settings (Dropdowns) */}
        {data.length > 0 && (
          <div
            className={`flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 rounded-2xl border border-dashed ${theme.border} bg-gray-50/50 dark:bg-white/5 transition-all`}
          >
            <div className="flex-1 z-20">
              <CustomDropdown
                label="محور افقی (دسته‌بندی‌ها)"
                options={headers}
                value={xAxisKey}
                onChange={setXAxisKey}
                placeholder="ستون نام‌ها را انتخاب کنید..."
              />
            </div>
            <div className="flex-1 z-10">
              <CustomDropdown
                label="داده‌های عددی (مقادیر)"
                options={headers}
                value={dataKey}
                onChange={setDataKey}
                placeholder="ستون اعداد را انتخاب کنید..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Chart Rendering Area */}
      <div
        className={`bg-white dark:bg-gray-950 min-h-[450px] flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300`}
        dir="ltr"
      >
        {data.length > 0 ? (
          <div className="w-full h-[400px] animate-in fade-in zoom-in-95 duration-500">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.name.includes("تاریک") ? "#333" : "#eee"}
                  />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      backgroundColor: theme.name.includes("تاریک")
                        ? "#1f2937"
                        : "#fff",
                      color: theme.name.includes("تاریک") ? "#fff" : "#000",
                    }}
                    cursor={{
                      fill: theme.name.includes("تاریک")
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar
                    dataKey={dataKey}
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={50}
                    animationDuration={1500}
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          chartType === "bar"
                            ? "#3b82f6"
                            : COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              ) : chartType === "line" ? (
                <LineChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.name.includes("تاریک") ? "#333" : "#eee"}
                  />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      backgroundColor: theme.name.includes("تاریک")
                        ? "#1f2937"
                        : "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke="#3b82f6"
                    strokeWidth={4}
                    dot={{
                      r: 6,
                      fill: "#3b82f6",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 8 }}
                    animationDuration={1500}
                  />
                </LineChart>
              ) : chartType === "area" ? (
                <AreaChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={theme.name.includes("تاریک") ? "#333" : "#eee"}
                  />
                  <XAxis
                    dataKey={xAxisKey}
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      backgroundColor: theme.name.includes("تاریک")
                        ? "#1f2937"
                        : "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                  <Area
                    type="monotone"
                    dataKey={dataKey}
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorData)"
                    animationDuration={1500}
                  />
                </AreaChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey={dataKey}
                    nameKey={xAxisKey}
                    animationDuration={1500}
                    label={({ name, percent }) =>
                      `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke={
                          theme.name.includes("تاریک") ? "#1f2937" : "#fff"
                        }
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      backgroundColor: theme.name.includes("تاریک")
                        ? "#1f2937"
                        : "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center opacity-40 flex flex-col items-center animate-pulse">
            <BarChart3
              size={80}
              className="mb-6 text-gray-300 dark:text-gray-700"
              strokeWidth={1}
            />
            <h4 className={`text-lg font-bold mb-2 ${theme.text}`}>
              نموداری موجود نیست
            </h4>
            <p className={`text-sm ${theme.textMuted}`}>
              برای مشاهده نمودار، ابتدا یک فایل اکسل آپلود کنید.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
