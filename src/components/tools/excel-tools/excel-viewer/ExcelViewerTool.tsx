// components/tools/excel/excel-viewer/ExcelViewerTool.tsx
"use client";

import { useState, ChangeEvent, useRef } from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  Sheet,
  Search,
  FileJson,
  FileText,
  FileSpreadsheet,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  X,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import {
  useExcelViewerContent,
  type ExcelViewerToolContent,
} from "./excel-viewer.content"; // ✅ مسیر نسبی

type DataRow = { [key: string]: any };

export default function ExcelViewerTool() {
  const theme = useThemeColors();
  const content: ExcelViewerToolContent = useExcelViewerContent();

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<DataRow[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileName, setFileName] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const wb = XLSX.read(data as string, { type: "binary" });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);

      const firstSheet = wb.SheetNames[0];
      setActiveSheet(firstSheet);
      processSheet(wb, firstSheet);
    };
    reader.readAsBinaryString(file);
  };

  const processSheet = (wb: XLSX.WorkBook, sheetName: string) => {
    const ws = wb.Sheets[sheetName];
    const data: DataRow[] = XLSX.utils.sheet_to_json(ws, {
      defval: "",
    });

    if (data.length > 0) {
      const keys = Object.keys(data[0]);
      setHeaders(keys);
      setRows(data);
      setFilteredRows(data);
    } else {
      setHeaders([]);
      setRows([]);
      setFilteredRows([]);
    }
    setSearchQuery("");
  };

  const handleSheetChange = (sheetName: string) => {
    if (workbook) {
      setActiveSheet(sheetName);
      processSheet(workbook, sheetName);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (!query) {
      setFilteredRows(rows);
      return;
    }

    const filtered = rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(query)
      )
    );
    setFilteredRows(filtered);
  };

  const downloadJSON = () => {
    if (!filteredRows.length) return;
    const jsonString = JSON.stringify(filteredRows, null, 2);
    const blob = new Blob([jsonString], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName.split(".")[0]}_${activeSheet}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCSV = () => {
    if (!filteredRows.length) return;
    const csvHeaders = headers.join(",");
    const csvRows = filteredRows.map((row) =>
      headers
        .map((header) => {
          const val = row[header] !== undefined ? String(row[header]) : "";
          if (val.includes(",") || val.includes('"') || val.includes("\n")) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        })
        .join(",")
    );
    const csvString = [csvHeaders, ...csvRows].join("\n");
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvString], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName.split(".")[0]}_${activeSheet}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleReset = () => {
    setRows([]);
    setHeaders([]);
    setWorkbook(null);
    setFileName("");
    setSheetNames([]);
    setActiveSheet("");
    setFilteredRows([]);
    setSearchQuery("");
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        theme.card
      } ${theme.border} shadow-sm flex flex-col ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none border-0"
          : "h-[600px]"
      }`}
    >
      {/* Toolbar */}
      <div
        className={`p-4 border-b flex flex-col gap-4 ${theme.border} bg-gray-50/80 dark:bg-black/20 backdrop-blur-sm`}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {rows.length === 0 ? (
              <label className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--app-primary-bg)] text-white font-bold rounded-xl cursor-pointer hover:bg-[var(--app-primary-hover)] active:scale-95 transition-all shadow-lg shadow-[var(--app-primary-bg)]/20 whitespace-nowrap">
                <UploadCloud size={20} />
                <span>{content.ui.upload.buttonInitial}</span>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            ) : (
              <>
                <div className="flex items-center gap-1 bg-white dark:bg-white/5 p-1 rounded-lg border border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors"
                    title={content.ui.toolbar.zoomOutTitle}
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="text-xs font-mono w-10 text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md transition-colors"
                    title={content.ui.toolbar.zoomInTitle}
                  >
                    <ZoomIn size={18} />
                  </button>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className={`p-2 rounded-lg border hover:bg-white dark:hover:bg-white/10 transition-colors ${theme.border} ${theme.text}`}
                  title={content.ui.toolbar.fullscreenTitle}
                >
                  {isFullscreen ? (
                    <Minimize size={18} />
                  ) : (
                    <Maximize size={18} />
                  )}
                </button>

                <div
                  className={`h-6 w-px mx-1 ${theme.border} bg-gray-300 dark:bg-gray-700`}
                />

                <button
                  onClick={downloadCSV}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border hover:bg-[var(--app-success-bg)] dark:hover:bg-[var(--app-success-bg)] transition-colors text-[var(--app-success-text)] border-[var(--app-success-border)]"
                  title={content.ui.toolbar.csvTitle}
                >
                  <FileText size={16} /> CSV
                </button>
                <button
                  onClick={downloadJSON}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border hover:bg-[var(--app-warning-bg)] dark:hover:bg-[var(--app-warning-bg)] transition-colors text-[var(--app-warning-text)] border-[var(--app-warning-border)]"
                  title={content.ui.toolbar.jsonTitle}
                >
                  <FileJson size={16} /> JSON
                </button>

                <button
                  onClick={handleReset}
                  className="p-2 text-[var(--app-error-text)] hover:bg-[var(--app-error-bg)] dark:hover:bg-[var(--app-error-bg)] rounded-lg transition-colors ml-auto md:ml-0"
                  title={content.ui.toolbar.closeTitle}
                >
                  <X size={18} />
                </button>
              </>
            )}
          </div>

          {rows.length > 0 && (
            <div className="relative w-full md:w-64 group">
              <Search
                size={16}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted} group-focus-within:text-[var(--app-accent)] transition-colors`}
              />
              <input
                type="text"
                placeholder={content.ui.search.placeholder}
                value={searchQuery}
                onChange={handleSearch}
                className={`w-full pl-3 pr-9 py-2 text-sm rounded-xl border bg-transparent outline-none transition-all ${theme.border} focus:border-[var(--app-accent)] focus:ring-4 focus:ring-[var(--app-accent)]/10 ${theme.text}`}
              />
            </div>
          )}
        </div>

        {sheetNames.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar mask-linear-fade">
            <Sheet
              size={16}
              className={`${theme.textMuted} flex-shrink-0`}
              aria-label={content.ui.sheets.iconLabel}
            />
            {sheetNames.map((name) => (
              <button
                key={name}
                onClick={() => handleSheetChange(name)}
                className={`text-xs px-3 py-1 rounded-md whitespace-nowrap transition-all font-medium border ${
                  activeSheet === name
                    ? "bg-[var(--app-primary-bg)] border-[var(--app-primary-bg)] text-white"
                    : `${theme.secondary} border-transparent ${theme.text} hover:bg-black/5 dark:hover:bg白/10 opacity-70 hover:opacity-100`
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-white dark:bg-black/20">
        {rows.length > 0 ? (
          <>
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              <table
                className="w-full min-w-max text-left border-collapse relative"
                style={{ fontSize: `${zoomLevel}%` }}
              >
                <thead
                  className={`sticky top-0 z-10 shadow-sm ${theme.secondary} ${theme.text}`}
                >
                  <tr>
                    <th className="p-3 font-bold border-b w-12 text-center opacity-50 text-[0.8em]">
                      #
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className="p-3 font-bold border-b border-r last:border-r-0 uppercase tracking-wider opacity-90 text-[0.9em]"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className={theme.text}>
                  {filteredRows.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="group border-b last:border-b-0 hover:bg-[var(--app-secondary-bg)] dark:hover:bg-[var(--app-secondary-bg)] transition-colors"
                    >
                      <td className="p-3 border-r text-center font-mono opacity-40 bg-black/5 dark:bg-white/5 text-[0.8em]">
                        {rowIndex + 1}
                      </td>
                      {headers.map((header, colIndex) => (
                        <td
                          key={`${rowIndex}-${colIndex}`}
                          className="p-3 border-r last:border-r-0 max-w-xs truncate group-hover:whitespace-normal dir-auto text-right"
                          title={String(row[header])}
                          dir="auto"
                        >
                          {row[header] !== undefined ? (
                            String(row[header])
                          ) : (
                            <span className="opacity-20 italic">null</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div
              className={`px-4 py-2 text-xs flex justify-between items-center border-t ${theme.border} ${theme.textMuted} bg-gray-50 dark:bg-white/5`}
            >
              <span>
                {content.ui.summary.totalPrefix}
                {rows.length.toLocaleString()}
              </span>
              <span>
                {content.ui.summary.visiblePrefix}
                {filteredRows.length.toLocaleString()}
              </span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-3xl bg-[var(--app-secondary-bg)] dark:bg-[var(--app-secondary-bg)] flex items-center justify-center mb-6 shadow-xl shadow-[var(--app-accent)]/10 ring-1 ring-[var(--app-accent)]/20">
              <FileSpreadsheet
                size={48}
                className="text-[var(--app-accent)] drop-shadow-sm"
              />
            </div>
            <h4 className={`font-black text-2xl mb-3 ${theme.text}`}>
              {content.ui.empty.title}
            </h4>
            <p
              className={`text-sm max-w-md leading-relaxed opacity-70 ${theme.textMuted}`}
            >
              {content.ui.empty.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
