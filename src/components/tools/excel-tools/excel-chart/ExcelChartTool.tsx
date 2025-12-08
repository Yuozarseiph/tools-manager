"use client";

import { useState, ChangeEvent, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Settings2,
  Maximize2,
  Minimize2,
  AlertCircle,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import CustomDropdown from "@/components/ui/CustomDropdown";
import CustomMultiSelect from "@/components/ui/CustomMultiSelect";
import BarChartComponent from "./charts/BarChartComponent";
import LineChartComponent from "./charts/LineChartComponent";
import AreaChartComponent from "./charts/AreaChartComponent";
import PieChartComponent from "./charts/PieChartComponent";
import { normalizeDataRow } from "@/utils/persian-number-converter";

import {
  useExcelChartContent,
  type ExcelChartToolContent,
} from "./excel-chart.content";

type DataRow = { [key: string]: any };

export default function ExcelChartTool() {
  const theme = useThemeColors();
  const content: ExcelChartToolContent = useExcelChartContent();

  const [data, setData] = useState<DataRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [chartType, setChartType] = useState<"bar" | "line" | "area" | "pie">(
    "bar"
  );
  const [xAxisKey, setXAxisKey] = useState<string>("");
  const [dataKeys, setDataKeys] = useState<string[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(100);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [hasPersianNumbers, setHasPersianNumbers] = useState(false);

  // محدودیت خودکار برای Pie Chart
  useEffect(() => {
    if (chartType === "pie" && endIndex - startIndex > 20) {
      setEndIndex(startIndex + 20);
    }
  }, [chartType, startIndex, endIndex]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr as string, { type: "binary" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData: DataRow[] = XLSX.utils.sheet_to_json(ws);

      if (jsonData.length > 0) {
        let foundPersian = false;
        const normalizedData = jsonData.map((row) => {
          const normalized = normalizeDataRow(row);
          if (JSON.stringify(row) !== JSON.stringify(normalized)) {
            foundPersian = true;
          }
          return normalized;
        });

        setHasPersianNumbers(foundPersian);
        setData(normalizedData);
        setEndIndex(
          Math.min(normalizedData.length, chartType === "pie" ? 20 : 50)
        );

        const keys = Object.keys(normalizedData[0]);
        setHeaders(keys);

        const textCol =
          keys.find((k) => typeof normalizedData[0][k] === "string") || keys[0];
        const numCol =
          keys.find((k) => typeof normalizedData[0][k] === "number") ||
          keys[1] ||
          keys[0];

        setXAxisKey(textCol);
        setDataKeys([numCol]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const filteredData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex]
  );

  const chartTypeConfigs = [
    {
      id: "bar",
      icon: BarChart3,
      label: content.ui.chartTypes.bar.label,
      title: content.ui.chartTypes.bar.title,
    },
    {
      id: "line",
      icon: LineChartIcon,
      label: content.ui.chartTypes.line.label,
      title: content.ui.chartTypes.line.title,
    },
    {
      id: "area",
      icon: AreaChartIcon,
      label: content.ui.chartTypes.area.label,
      title: content.ui.chartTypes.area.title,
    },
    {
      id: "pie",
      icon: PieChartIcon,
      label: content.ui.chartTypes.pie.label,
      title: content.ui.chartTypes.pie.title,
    },
  ] as const;

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${theme.card} ${theme.border} shadow-sm`}
    >
      {/* Toolbar */}
      <div className={`p-6 border-b flex flex-col gap-6 ${theme.border}`}>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl cursor-pointer hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 w-full sm:w-auto active:scale-95">
            <UploadCloud size={20} />
            <span>
              {data.length > 0
                ? content.ui.upload.buttonChange
                : content.ui.upload.buttonInitial}
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
              {chartTypeConfigs.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id as typeof chartType)}
                  className={`p-2 rounded-lg transition-all duration-200 relative group ${
                    chartType === type.id
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-white/5"
                  }`}
                  title={type.title}
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

        {/* هشدار اعداد فارسی */}
        {hasPersianNumbers && (
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${theme.border} bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800`}
          >
            <AlertCircle
              size={18}
              className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            />
            <div className="text-sm">
              <p className="font-bold text-blue-700 dark:text-blue-300 mb-1">
                {content.ui.persianNumbers.title}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs">
                {content.ui.persianNumbers.description}
              </p>
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div
            className={`flex flex-col sm:flex-row gap-4 sm:gap-6 p-5 rounded-2xl border border-dashed ${theme.border} bg-gray-50/50 dark:bg-white/5 overflow-visible z-20`}
          >
            <div className="flex-1 z-30">
              <CustomDropdown
                label={content.ui.mapping.xAxisLabel}
                options={headers}
                value={xAxisKey}
                onChange={setXAxisKey}
              />
            </div>
            <div className="flex-1 z-20">
              {chartType === "area" || chartType === "bar" ? (
                <CustomMultiSelect
                  label={
                    chartType === "bar"
                      ? content.ui.mapping.numericLabelBar
                      : content.ui.mapping.numericLabelArea
                  }
                  options={headers}
                  selectedValues={dataKeys}
                  onChange={(vals) => {
                    if (chartType === "bar" && vals.length > 2) return;
                    setDataKeys(vals);
                  }}
                  placeholder={content.ui.mapping.numericPlaceholder}
                />
              ) : (
                <CustomDropdown
                  label={content.ui.mapping.numericLabelSingle}
                  options={headers}
                  value={dataKeys[0] || ""}
                  onChange={(val) => setDataKeys([val])}
                />
              )}
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div
            className={`p-4 rounded-xl border ${theme.border} bg-gray-50/30 dark:bg-white/5 flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold opacity-70">
                <Settings2 size={16} />
                <span>{content.ui.settings.title}</span>
              </div>
              <span className="text-xs opacity-50">
                {content.ui.settings.rangeSummaryPrefix}
                {filteredData.length}
                {content.ui.settings.rangeSummaryMiddle}
                {data.length}
                {content.ui.settings.rangeSummarySuffix}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs opacity-70">
                  {content.ui.settings.rangeLabel}{" "}
                  {chartType === "pie" && (
                    <span className="text-amber-500 font-bold">
                      {content.ui.settings.pieHint}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={data.length}
                    value={startIndex}
                    onChange={(e) => setStartIndex(Number(e.target.value) || 0)}
                    className={`w-20 p-1.5 text-center rounded-lg border ${theme.border} bg-transparent`}
                  />
                  <span className="opacity-50">-</span>
                  <input
                    type="number"
                    min={0}
                    max={data.length}
                    value={endIndex}
                    onChange={(e) => setEndIndex(Number(e.target.value) || 0)}
                    className={`w-20 p-1.5 text-center rounded-lg border ${theme.border} bg-transparent`}
                  />
                </div>
              </div>

              {chartType !== "pie" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs opacity-70">
                    <span className="flex items-center gap-1">
                      <Minimize2 size={12} /> {content.ui.zoom.compact}
                    </span>
                    <span className="flex items-center gap-1">
                      <Maximize2 size={12} /> {content.ui.zoom.expanded}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={500}
                    step={10}
                    value={zoomLevel}
                    onChange={(e) =>
                      setZoomLevel(Number(e.target.value) || 100)
                    }
                    className="w-full accent-blue-500 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center text-xs text-gray-400 border rounded-lg border-dashed">
                  {content.ui.zoom.pieDisabled}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        className={`bg-white dark:bg-gray-950 min-h-[450px] flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300 relative`}
        dir="ltr"
      >
        {data.length > 0 ? (
          <div className="w-full h-[400px] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 pb-4">
            <div
              className="h-full transition-all duration-300"
              style={{
                minWidth: chartType === "pie" ? "100%" : `${zoomLevel}%`,
              }}
            >
              {chartType === "bar" && (
                <BarChartComponent
                  data={filteredData}
                  xAxisKey={xAxisKey}
                  dataKeys={dataKeys}
                  theme={theme}
                  minWidth={zoomLevel}
                />
              )}

              {chartType === "line" && (
                <LineChartComponent
                  data={filteredData}
                  xAxisKey={xAxisKey}
                  dataKey={dataKeys[0]}
                  theme={theme}
                  minWidth={zoomLevel}
                />
              )}

              {chartType === "area" && (
                <AreaChartComponent
                  data={filteredData}
                  xAxisKey={xAxisKey}
                  dataKeys={dataKeys}
                  theme={theme}
                  minWidth={zoomLevel}
                />
              )}

              {chartType === "pie" && (
                <PieChartComponent
                  data={filteredData}
                  xAxisKey={xAxisKey}
                  dataKey={dataKeys[0]}
                  theme={theme}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center opacity-40 flex flex-col items-center animate-pulse">
            <BarChart3
              size={80}
              className="mb-6 text-gray-300 dark:text-gray-700"
              strokeWidth={1}
            />
            <h4 className={`text-lg font-bold mb-2 ${theme.text}`}>
              {content.ui.empty.title}
            </h4>
            <p className={`text-sm ${theme.textMuted}`}>
              {content.ui.empty.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
