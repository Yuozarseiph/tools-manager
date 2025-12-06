"use client";

import { useState, ChangeEvent, useMemo, useEffect } from "react";
import * as XLSX from "xlsx";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  UploadCloud,
  Save,
  Plus,
  Trash2,
  FileSpreadsheet,
  Undo,
  Search,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import {
  useToolContent,
  type ExcelEditorToolContent
} from "@/hooks/useToolContent";

type DataRow = { [key: string]: string | number | boolean | null };

const ROWS_PER_PAGE = 10;

export default function ExcelEditorTool() {
  const theme = useThemeColors();
  const content = useToolContent<ExcelEditorToolContent>("excel-editor");

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string>("edited-file.xlsx");
  const [history, setHistory] = useState<DataRow[][]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    return rows.filter((row) =>
      Object.values(row).some((val) =>
        String(val)
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [rows, searchQuery]);

  const totalPages = Math.ceil(
    filteredRows.length / ROWS_PER_PAGE
  );

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleFileUpload = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const wb = XLSX.read(data as string, {
        type: "binary"
      });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const dataJson: DataRow[] =
        XLSX.utils.sheet_to_json(ws, { defval: "" });

      if (dataJson.length > 0) {
        setHeaders(Object.keys(dataJson[0]));
        setRows(dataJson);
        setHistory([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const saveToHistory = () => {
    setHistory((prev) => {
      const newHistory = [...prev, rows];
      return newHistory.length > 10
        ? newHistory.slice(1)
        : newHistory;
    });
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setRows(previousState);
      setHistory((prev) => prev.slice(0, -1));
    }
  };

  const handleCellChange = (
    globalIndex: number,
    header: string,
    value: string
  ) => {
    const newRows = [...rows];
    newRows[globalIndex] = {
      ...newRows[globalIndex],
      [header]: value
    };
    setRows(newRows);
  };

  const addRow = () => {
    saveToHistory();
    const newRow: DataRow = {};
    headers.forEach((h) => (newRow[h] = ""));
    setRows([newRow, ...rows]);
  };

  const deleteRow = (globalIndex: number) => {
    saveToHistory();
    const newRows = rows.filter((_, i) => i !== globalIndex);
    setRows(newRows);
  };

  const handleDownload = () => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `edited_${fileName}`);
  };

  const handleReset = () => {
    if (confirm(content.ui.actions.resetConfirm)) {
      setRows([]);
      setHeaders([]);
      setHistory([]);
      setFileName("");
    }
  };

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${theme.card} ${theme.border} shadow-sm flex flex-col h-[600px]`}
    >
      {/* Toolbar */}
      <div
        className={`p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4 ${theme.border} bg-gray-50/50 dark:bg-white/5`}
      >
        {/* Right: actions */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          {rows.length === 0 ? (
            <label className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl cursor-pointer hover:bg-blue-700 transition-all active:scale-95 whitespace-nowrap">
              <UploadCloud size={18} />
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
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
              >
                <Save size={16} />
                <span>
                  {content.ui.actions.exportExcel}
                </span>
              </button>

              <div
                className={`h-6 w-px mx-1 ${theme.border} bg-gray-300 dark:bg-gray-700`}
              />

              <button
                onClick={addRow}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border hover:bg-white dark:hover:bg-white/10 transition-colors ${theme.border} ${theme.text}`}
              >
                <Plus size={16} />
                <span>{content.ui.actions.addRow}</span>
              </button>

              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className={`p-2 rounded-lg border transition-colors ${
                  history.length === 0
                    ? "opacity-30 cursor-not-allowed"
                    : `hover:bg-white dark:hover:bg-white/10 ${theme.text}`
                } ${theme.border}`}
                title={content.ui.actions.undoTitle}
              >
                <Undo size={18} />
              </button>

              <button
                onClick={handleReset}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title={content.ui.actions.closeFileTitle}
              >
                <X size={18} />
              </button>
            </>
          )}
        </div>

        {/* Left: search */}
        {rows.length > 0 && (
          <div className="relative w-full md:w-64">
            <Search
              size={16}
              className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-50 ${theme.text}`}
            />
            <input
              type="text"
              placeholder={content.ui.search.placeholder}
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className={`w-full pl-3 pr-9 py-2 text-sm rounded-xl border outline-none focus:ring-2 ring-blue-500/20 transition-all ${theme.bg} ${theme.border} ${theme.text}`}
            />
          </div>
        )}
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-white dark:bg-black/20">
        {rows.length > 0 ? (
          <>
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              <table className="w-full min-w-max text-sm text-left border-collapse relative">
                <thead
                  className={`sticky top-0 z-10 shadow-sm ${theme.secondary} text-xs uppercase tracking-wider`}
                >
                  <tr>
                    <th
                      className={`p-3 font-bold border-b w-12 text-center ${theme.textMuted}`}
                    >
                      {content.ui.table.indexHeader}
                    </th>
                    {headers.map((header) => (
                      <th
                        key={header}
                        className={`p-3 font-bold border-b border-r last:border-r-0 min-w-[150px] text-right ${theme.text} ${theme.border}`}
                      >
                        {header}
                      </th>
                    ))}
                    <th
                      className={`p-3 font-bold border-b w-12 text-center ${theme.textMuted}`}
                    >
                      {content.ui.table.deleteHeader}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row, index) => {
                    const realIndex =
                      (currentPage - 1) * ROWS_PER_PAGE +
                      index;
                    const originalIndex =
                      rows.indexOf(row);

                    return (
                      <tr
                        key={originalIndex}
                        className="group border-b last:border-b-0 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors"
                      >
                        <td className="p-3 border-r text-center text-xs opacity-40 font-mono select-none bg-gray-50/50 dark:bg-white/5">
                          {realIndex + 1}
                        </td>
                        {headers.map((header) => (
                          <td
                            key={`${originalIndex}-${header}`}
                            className="p-0 border-r last:border-r-0 relative"
                          >
                            <input
                              type="text"
                              value={String(
                                row[header] ?? ""
                              )}
                              onFocus={saveToHistory}
                              onChange={(e) =>
                                handleCellChange(
                                  originalIndex,
                                  header,
                                  e.target.value
                                )
                              }
                              className={`w-full h-full px-3 py-2.5 bg-transparent outline-none text-right focus:bg-white dark:focus:bg-black focus:shadow-inner focus:text-blue-600 dark:focus:text-blue-400 transition-all ${theme.text} dir-rtl`}
                              dir="auto"
                            />
                          </td>
                        ))}
                        <td className="p-1 text-center">
                          <button
                            onClick={() =>
                              deleteRow(originalIndex)
                            }
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                            title={
                              content.ui.table
                                .deleteTooltip
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            <div
              className={`p-3 border-t flex items-center justify-between bg-gray-50/80 dark:bg-black/20 ${theme.border}`}
            >
              <span
                className={`text-xs ${theme.textMuted}`}
              >
                {content.ui.pagination.summaryPrefix}
                {filteredRows.length === 0
                  ? 0
                  : (currentPage - 1) *
                      ROWS_PER_PAGE +
                    1}
                {content.ui.pagination.summaryFromToSeparator}
                {Math.min(
                  currentPage * ROWS_PER_PAGE,
                  filteredRows.length
                )}
                {content.ui.pagination.summaryOfWord}
                {filteredRows.length}
                {content.ui.pagination.summarySuffix}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className={`p-1 rounded-lg disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${theme.text}`}
                >
                  <ChevronRight size={18} />
                </button>
                <span
                  className={`text-sm font-mono px-2 ${theme.text}`}
                >
                  {currentPage} /{" "}
                  {Math.max(1, totalPages)}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={currentPage === totalPages}
                  className={`p-1 rounded-lg disabled:opacity-30 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors ${theme.text}`}
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in zoom-in-95 duration-500">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/20`}
            >
              <FileSpreadsheet
                size={48}
                className="text-emerald-600 dark:text-emerald-400 drop-shadow-sm"
              />
            </div>
            <h4
              className={`font-black text-2xl mb-3 ${theme.text}`}
            >
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
