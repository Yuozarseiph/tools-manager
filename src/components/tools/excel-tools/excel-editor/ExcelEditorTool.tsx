"use client";

import {
  useState,
  ChangeEvent,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  Save,
  Plus,
  Trash2,
  Undo,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Minimize2,
  Copy,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import CustomDropdown from "@/components/ui/CustomDropdown";
import {
  useExcelEditorContent,
  type ExcelEditorToolContent,
} from "./excel-editor.content";

import type {
  CellValue,
  DataRow,
  SortDir,
  SortState,
  FilterOp,
  FilterState,
  ColumnType,
} from "./types";

import {
  makeId,
  cloneRowsSafe,
  normalizeStr,
  parseNumberMaybe,
  detectColumnType,
  stripInternal,
  clampInt,
  downloadTextFile,
} from "./utils";

export default function ExcelEditorTool() {
  const theme = useThemeColors();
  const content: ExcelEditorToolContent = useExcelEditorContent();

  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string>("edited-file.xlsx");

  const [history, setHistory] = useState<DataRow[][]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [sort, setSort] = useState<SortState>(null);
  const [filter, setFilter] = useState<FilterState>(null);

  const [sumMode, setSumMode] = useState<"column" | "row">("column");
  const [sumColumn, setSumColumn] = useState<string>("");
  const [sumRowNumber, setSumRowNumber] = useState<number>(1);
  const [rangeFromRow, setRangeFromRow] = useState<number>(1);
  const [rangeToRow, setRangeToRow] = useState<number>(1);
  const [rangeFromCol, setRangeFromCol] = useState<number>(1);
  const [rangeToCol, setRangeToCol] = useState<number>(1);

  const [exportFromRow, setExportFromRow] = useState<number>(1);
  const [exportToRow, setExportToRow] = useState<number>(1);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onFsChange = () => {
      const active = !!document.fullscreenElement;
      setIsNativeFullscreen(active);
      if (active) setIsPseudoFullscreen(false);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;

    if (document.fullscreenEnabled && el.requestFullscreen) {
      if (!document.fullscreenElement) {
        try {
          await el.requestFullscreen();
          return;
        } catch {
          setIsPseudoFullscreen((p) => !p);
          return;
        }
      }

      try {
        await document.exitFullscreen();
        return;
      } catch {
        setIsPseudoFullscreen(false);
        return;
      }
    }

    setIsPseudoFullscreen((p) => !p);
  };

  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const snap = cloneRowsSafe(rows);
      const next = [...prev, snap];
      return next.length > 10 ? next.slice(1) : next;
    });
  }, [rows]);

  const handleUndo = () => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setRows(previousState);
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      const wb = XLSX.read(data as ArrayBuffer, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];

      const dataJson = XLSX.utils.sheet_to_json<Record<string, CellValue>>(ws, {
        defval: "",
      });
      if (dataJson.length === 0) return;

      const headerSet = new Set<string>();
      dataJson.forEach((r) => Object.keys(r).forEach((k) => headerSet.add(k)));
      const hdrs = Array.from(headerSet);

      const withIds: DataRow[] = dataJson.map((r) => {
        const base: Record<string, CellValue> = {};
        hdrs.forEach((h) => (base[h] = r[h] ?? ""));
        return { __id: makeId(), ...base };
      });

      setHeaders(hdrs);
      setRows(withIds);
      setHistory([]);
      setSort(null);
      setFilter(null);

      setSumColumn(hdrs[0] ?? "");
      setRangeFromRow(1);
      setRangeToRow(withIds.length || 1);
      setExportFromRow(1);
      setExportToRow(withIds.length || 1);
      setRangeFromCol(1);
      setRangeToCol(hdrs.length || 1);
      setSumRowNumber(1);

      setCurrentPage(1);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCellChange = (rowId: string, header: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.__id === rowId ? { ...r, [header]: value } : r))
    );
  };

  const addRow = () => {
    saveToHistory();
    const newRow: DataRow = { __id: makeId() };
    headers.forEach((h) => (newRow[h] = ""));
    setRows((prev) => [newRow, ...prev]);
  };

  const deleteRow = (rowId: string) => {
    saveToHistory();
    setRows((prev) => prev.filter((r) => r.__id !== rowId));
  };

  const handleDownloadXlsx = () => {
    const clean = rows.map(stripInternal);
    const ws = XLSX.utils.json_to_sheet(clean);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `edited_${fileName || "file.xlsx"}`);
  };

  const handleReset = () => {
    if (confirm(content.ui.actions.resetConfirm)) {
      setRows([]);
      setHeaders([]);
      setHistory([]);
      setFileName("");
      setSearchQuery("");
      setCurrentPage(1);
      setSort(null);
      setFilter(null);
      setIsPseudoFullscreen(false);
    }
  };

  const searchedRows = useMemo(() => {
    if (!searchQuery) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter((row) =>
      Object.values(stripInternal(row)).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [rows, searchQuery]);

  const activeFilterType: ColumnType = useMemo(() => {
    if (!filter?.column) return "text";
    return detectColumnType(searchedRows, filter.column);
  }, [filter?.column, searchedRows]);

  const filteredRows = useMemo(() => {
    if (!filter || !filter.column) return searchedRows;
    const colType = detectColumnType(searchedRows, filter.column);

    return searchedRows.filter((r) => {
      const v = r[filter.column];

      if (colType === "number") {
        const n = parseNumberMaybe(v);
        if (n === undefined) return false;

        const a = parseNumberMaybe(filter.value);
        const b = parseNumberMaybe(filter.value2);

        if (filter.op === "equals") return a !== undefined ? n === a : false;
        if (filter.op === "gt") return a !== undefined ? n > a : false;
        if (filter.op === "lt") return a !== undefined ? n < a : false;
        if (filter.op === "between") {
          if (a === undefined || b === undefined) return false;
          const min = Math.min(a, b);
          const max = Math.max(a, b);
          return n >= min && n <= max;
        }
        return true;
      }

      const s = normalizeStr(v);
      const q = normalizeStr(filter.value);

      if (filter.op === "equals") return s === q;
      if (filter.op === "startsWith") return s.startsWith(q);
      return s.includes(q);
    });
  }, [searchedRows, filter]);

  const filteredSortedRows = useMemo(() => {
    if (!sort || !sort.column) return filteredRows;

    const colType = detectColumnType(filteredRows, sort.column);
    const dir = sort.dir === "asc" ? 1 : -1;

    const arr = [...filteredRows];
    arr.sort((a, b) => {
      const av = a[sort.column];
      const bv = b[sort.column];

      if (colType === "number") {
        const an = parseNumberMaybe(av) ?? Number.NEGATIVE_INFINITY;
        const bn = parseNumberMaybe(bv) ?? Number.NEGATIVE_INFINITY;
        if (an === bn) return 0;
        return an > bn ? dir : -dir;
      }

      const as = normalizeStr(av);
      const bs = normalizeStr(bv);
      if (as === bs) return 0;
      return as > bs ? dir : -dir;
    });

    return arr;
  }, [filteredRows, sort]);

  const safeRowsPerPage = useMemo(
    () => clampInt(rowsPerPage, 1, 100),
    [rowsPerPage]
  );

  const totalPages = useMemo(
    () => Math.ceil(filteredSortedRows.length / safeRowsPerPage),
    [filteredSortedRows.length, safeRowsPerPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, sort, safeRowsPerPage]);

  useEffect(() => {
    setCurrentPage((p) => clampInt(p, 1, Math.max(1, totalPages)));
  }, [totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * safeRowsPerPage;
    const end = start + safeRowsPerPage;
    return filteredSortedRows.slice(start, end);
  }, [filteredSortedRows, currentPage, safeRowsPerPage]);

  useEffect(() => {
    const max = Math.max(1, filteredSortedRows.length);
    setRangeFromRow((p) => clampInt(p, 1, max));
    setRangeToRow((p) => clampInt(p, 1, max));
    setExportFromRow((p) => clampInt(p, 1, max));
    setExportToRow((p) => clampInt(p, 1, max));
    setSumRowNumber((p) => clampInt(p, 1, max));

    const maxCol = Math.max(1, headers.length);
    setRangeFromCol((p) => clampInt(p, 1, maxCol));
    setRangeToCol((p) => clampInt(p, 1, maxCol));
  }, [filteredSortedRows.length, headers.length]);

  const sumResult = useMemo(() => {
    if (filteredSortedRows.length === 0) return { sum: 0, count: 0 };

    const from = clampInt(
      Math.min(rangeFromRow, rangeToRow),
      1,
      filteredSortedRows.length
    );
    const to = clampInt(
      Math.max(rangeFromRow, rangeToRow),
      1,
      filteredSortedRows.length
    );
    const slice = filteredSortedRows.slice(from - 1, to);

    if (sumMode === "column") {
      if (!sumColumn) return { sum: 0, count: 0 };
      let sum = 0;
      let count = 0;
      for (const r of slice) {
        const n = parseNumberMaybe(r[sumColumn]);
        if (n === undefined) continue;
        sum += n;
        count += 1;
      }
      return { sum, count };
    }

    const rowIndex = clampInt(sumRowNumber, 1, filteredSortedRows.length) - 1;
    const row = filteredSortedRows[rowIndex];
    if (!row) return { sum: 0, count: 0 };

    const cFrom = clampInt(
      Math.min(rangeFromCol, rangeToCol),
      1,
      headers.length
    );
    const cTo = clampInt(Math.max(rangeFromCol, rangeToCol), 1, headers.length);
    const cols = headers.slice(cFrom - 1, cTo);

    let sum = 0;
    let count = 0;
    for (const h of cols) {
      const n = parseNumberMaybe(row[h]);
      if (n === undefined) continue;
      sum += n;
      count += 1;
    }
    return { sum, count };
  }, [
    filteredSortedRows,
    sumMode,
    sumColumn,
    sumRowNumber,
    rangeFromRow,
    rangeToRow,
    rangeFromCol,
    rangeToCol,
    headers,
  ]);

  const handleCopySum = async () => {
    try {
      await navigator.clipboard.writeText(String(sumResult.sum));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const handleExportCsvFiltered = () => {
    const clean = filteredSortedRows.map(stripInternal);
    const ws = XLSX.utils.json_to_sheet(clean);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadTextFile(
      `filtered_${fileName || "data"}.csv`,
      csv,
      "text/csv;charset=utf-8"
    );
  };

  const handleExportCsvRange = () => {
    if (filteredSortedRows.length === 0) return;

    const from = clampInt(
      Math.min(exportFromRow, exportToRow),
      1,
      filteredSortedRows.length
    );
    const to = clampInt(
      Math.max(exportFromRow, exportToRow),
      1,
      filteredSortedRows.length
    );
    const slice = filteredSortedRows.slice(from - 1, to).map(stripInternal);

    const ws = XLSX.utils.json_to_sheet(slice);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadTextFile(
      `range_${from}-${to}_${fileName || "data"}.csv`,
      csv,
      "text/csv;charset=utf-8"
    );
  };

  const approxSizeMb = useMemo(() => {
    if (rows.length === 0) return 0;
    const bytes = rows.reduce((s, r) => s + JSON.stringify(r).length, 0);
    return bytes / 1024 / 1024;
  }, [rows]);

  // اسکرول درست: ریشه overflow-hidden، فقط جدول overflow-auto
  const rootClass = useMemo(() => {
    const base = `border transition-all duration-300 ${theme.card} ${theme.border} shadow-sm flex flex-col w-full`;
    if (isPseudoFullscreen) {
      return `${base} fixed inset-0 z-[60] rounded-none w-screen h-[100dvh] overflow-hidden`;
    }
    return `${base} rounded-2xl h-[650px] max-h-[calc(100dvh-16px)] overflow-hidden`;
  }, [theme.card, theme.border, isPseudoFullscreen]);

  const inputClass = `w-full px-3 py-2 text-sm rounded-xl border outline-none focus:ring-2 ${theme.ring} ${theme.card} ${theme.border} ${theme.text}`;

  const filterOpOptions = useMemo(() => {
    if (activeFilterType === "number") {
      return [
        { value: "equals", label: content.ui.filter.ops.equals },
        { value: "gt", label: content.ui.filter.ops.gt },
        { value: "lt", label: content.ui.filter.ops.lt },
        { value: "between", label: content.ui.filter.ops.between },
      ] as const;
    }
    return [
      { value: "contains", label: content.ui.filter.ops.contains },
      { value: "equals", label: content.ui.filter.ops.equals },
      { value: "startsWith", label: content.ui.filter.ops.startsWith },
    ] as const;
  }, [activeFilterType, content.ui.filter.ops]);

  const fullscreenTitle =
    isNativeFullscreen || isPseudoFullscreen
      ? content.ui.actions.fullscreenExitTitle
      : content.ui.actions.fullscreenEnterTitle;

  const rowsPerPageOptions = useMemo(
    () =>
      Array.from({ length: 100 }, (_, i) => i + 1).map((n) => ({
        value: String(n),
        label: `${n} ${content.ui.pagination.perPageSuffix}`,
      })),
    [content.ui.pagination.perPageSuffix]
  );

  const filterColumnOptions = useMemo(
    () => [
      { value: "", label: content.ui.filter.noFilter },
      ...headers.map((h) => ({ value: h, label: h })),
    ],
    [headers, content.ui.filter.noFilter]
  );

  const sortColumnOptions = useMemo(
    () => [
      { value: "", label: content.ui.sort.noSort },
      ...headers.map((h) => ({ value: h, label: h })),
    ],
    [headers, content.ui.sort.noSort]
  );

  const sortDirOptions = useMemo(
    () => [
      { value: "asc", label: content.ui.sort.directionAsc },
      { value: "desc", label: content.ui.sort.directionDesc },
    ],
    [content.ui.sort.directionAsc, content.ui.sort.directionDesc]
  );

  const sumModeOptions = useMemo(
    () => [
      { value: "column", label: content.ui.sum.modeColumn },
      { value: "row", label: content.ui.sum.modeRow },
    ],
    [content.ui.sum.modeColumn, content.ui.sum.modeRow]
  );

  const paginationFrom = filteredSortedRows.length
    ? (currentPage - 1) * safeRowsPerPage + 1
    : 0;

  const paginationTo = filteredSortedRows.length
    ? Math.min(currentPage * safeRowsPerPage, filteredSortedRows.length)
    : 0;

  return (
    <div ref={containerRef} className={rootClass}>
      {/* Toolbar */}
      <div className={`p-3 sm:p-4 border-b ${theme.border} ${theme.card}`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {rows.length === 0 ? (
                <label
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all active:scale-95 ${theme.primary}`}
                >
                  <UploadCloud size={18} />
                  <span className="text-sm font-bold">
                    {content.ui.upload.buttonInitial}
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>
              ) : (
                <>
                  <label
                    className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors hover:opacity-90 ${theme.border} ${theme.text}`}
                    title={content.ui.upload.acceptHint}
                  >
                    <UploadCloud size={16} />
                    <span className="text-sm font-semibold">
                      {content.ui.upload.buttonChange}
                    </span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  <button
                    onClick={handleDownloadXlsx}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${theme.primary}`}
                  >
                    <Save size={16} />
                    <span className="text-sm font-bold">
                      {content.ui.actions.exportExcel}
                    </span>
                  </button>

                  <button
                    onClick={addRow}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
                  >
                    <Plus size={16} />
                    <span className="text-sm font-semibold">
                      {content.ui.actions.addRow}
                    </span>
                  </button>

                  <button
                    onClick={handleUndo}
                    disabled={history.length === 0}
                    className={`p-2 rounded-xl border transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 ${theme.border} ${theme.text}`}
                    title={content.ui.actions.undoTitle}
                  >
                    <Undo size={18} />
                  </button>

                  <button
                    onClick={handleReset}
                    className={`p-2 rounded-xl border transition-colors hover:opacity-90 ${theme.note.errorBorder} ${theme.note.errorBg} ${theme.note.errorText}`}
                    title={content.ui.actions.closeFileTitle}
                  >
                    <X size={18} />
                  </button>

                  <button
                    onClick={toggleFullscreen}
                    className={`p-2 rounded-xl border transition-colors hover:opacity-90 ${theme.border} ${theme.text}`}
                    title={fullscreenTitle}
                  >
                    {isNativeFullscreen || isPseudoFullscreen ? (
                      <Minimize2 size={18} />
                    ) : (
                      <Maximize2 size={18} />
                    )}
                  </button>
                </>
              )}
            </div>

            {rows.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:ml-auto">
                <div className="relative w-full sm:w-72 min-w-0">
                  <Search
                    size={16}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-60 ${theme.textMuted}`}
                  />
                  <input
                    type="text"
                    placeholder={content.ui.search.placeholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${inputClass} pr-9`}
                  />
                </div>

                <div className="w-full sm:w-56">
                  <CustomDropdown
                    label={content.ui.pagination.rowsPerPageLabel}
                    options={rowsPerPageOptions}
                    value={String(safeRowsPerPage)}
                    onChange={(v) =>
                      setRowsPerPage(clampInt(Number(v), 1, 100))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Panels */}
          {rows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {/* Filter */}
              <div
                className={`rounded-2xl border p-3 ${theme.border} ${theme.card}`}
              >
                <div className={`text-xs mb-2 ${theme.textMuted}`}>
                  {content.ui.filter.title}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <CustomDropdown
                    options={filterColumnOptions}
                    value={filter?.column ?? ""}
                    onChange={(col) => {
                      if (!col) return setFilter(null);
                      setFilter({ column: col, op: "contains", value: "" });
                    }}
                  />

                  <CustomDropdown
                    options={filterOpOptions as any}
                    value={(filter?.op ?? "contains") as string}
                    onChange={(op) => {
                      if (!filter?.column) return;
                      setFilter({ ...filter, op: op as FilterOp });
                    }}
                    disabled={!filter?.column}
                  />
                </div>

                <div className="flex gap-2 mt-2">
                  <input
                    value={filter?.value ?? ""}
                    onChange={(e) =>
                      filter && setFilter({ ...filter, value: e.target.value })
                    }
                    disabled={!filter?.column}
                    placeholder={content.ui.filter.valuePlaceholder}
                    className={`${inputClass} disabled:opacity-40`}
                  />

                  {filter?.op === "between" && (
                    <input
                      value={filter?.value2 ?? ""}
                      onChange={(e) =>
                        filter &&
                        setFilter({ ...filter, value2: e.target.value })
                      }
                      placeholder={content.ui.filter.value2Placeholder}
                      className={inputClass}
                    />
                  )}
                </div>

                <div className="flex justify-between mt-2 text-xs gap-2">
                  <span className={`${theme.textMuted} truncate`}>
                    {content.ui.filter.rowsLabel}: {filteredSortedRows.length}{" "}
                    {content.ui.filter.ofLabel} {rows.length} •{" "}
                    {content.ui.filter.sizeLabel}: {approxSizeMb.toFixed(1)}MB
                  </span>

                  <button
                    onClick={() => setFilter(null)}
                    className={`whitespace-nowrap hover:underline ${theme.accent}`}
                  >
                    {content.ui.filter.clear}
                  </button>
                </div>
              </div>

              {/* Sort */}
              <div
                className={`rounded-2xl border p-3 ${theme.border} ${theme.card}`}
              >
                <div className={`text-xs mb-2 ${theme.textMuted}`}>
                  {content.ui.sort.title}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <CustomDropdown
                    options={sortColumnOptions}
                    value={sort?.column ?? ""}
                    onChange={(col) => {
                      if (!col) return setSort(null);
                      setSort({ column: col, dir: sort?.dir ?? "asc" });
                    }}
                  />

                  <CustomDropdown
                    options={sortDirOptions}
                    value={sort?.dir ?? "asc"}
                    onChange={(dir) => {
                      if (!sort?.column) return;
                      setSort({ ...sort, dir: dir as SortDir });
                    }}
                    disabled={!sort?.column}
                  />
                </div>

                <button
                  onClick={() => setSort(null)}
                  className={`mt-2 w-full px-3 py-2 rounded-xl border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
                >
                  {content.ui.sort.clear}
                </button>
              </div>

              {/* Sum */}
              <div
                className={`rounded-2xl border p-3 ${theme.border} ${theme.card}`}
              >
                <div className={`text-xs mb-2 ${theme.textMuted}`}>
                  {content.ui.sum.title}
                </div>

                <div className="flex flex-col gap-2">
                  <CustomDropdown
                    options={sumModeOptions}
                    value={sumMode}
                    onChange={(v) => setSumMode(v as "column" | "row")}
                  />

                  {sumMode === "column" ? (
                    <CustomDropdown
                      options={headers}
                      value={sumColumn}
                      onChange={(v) => setSumColumn(v)}
                      placeholder={content.ui.sum.modeColumn}
                    />
                  ) : (
                    <input
                      type="number"
                      min={1}
                      max={Math.max(1, filteredSortedRows.length)}
                      value={sumRowNumber}
                      onChange={(e) => setSumRowNumber(Number(e.target.value))}
                      className={inputClass}
                      placeholder={content.ui.sum.rowNumberPlaceholder}
                      title={content.ui.sum.rowNumberLabel}
                    />
                  )}
                </div>

                <div className={`text-xs mt-2 ${theme.textMuted}`}>
                  {content.ui.sum.rangeRowsTitle}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, filteredSortedRows.length)}
                    value={rangeFromRow}
                    onChange={(e) => setRangeFromRow(Number(e.target.value))}
                    className={inputClass}
                    placeholder={content.ui.sum.from}
                  />
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, filteredSortedRows.length)}
                    value={rangeToRow}
                    onChange={(e) => setRangeToRow(Number(e.target.value))}
                    className={inputClass}
                    placeholder={content.ui.sum.to}
                  />
                </div>

                {sumMode === "row" && (
                  <>
                    <div className={`text-xs mt-2 ${theme.textMuted}`}>
                      {content.ui.sum.rangeColsTitle}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, headers.length)}
                        value={rangeFromCol}
                        onChange={(e) =>
                          setRangeFromCol(Number(e.target.value))
                        }
                        className={inputClass}
                        placeholder={content.ui.sum.from}
                      />
                      <input
                        type="number"
                        min={1}
                        max={Math.max(1, headers.length)}
                        value={rangeToCol}
                        onChange={(e) => setRangeToCol(Number(e.target.value))}
                        className={inputClass}
                        placeholder={content.ui.sum.to}
                      />
                    </div>
                  </>
                )}

                <div
                  className={`mt-2 rounded-xl border p-2 ${theme.border} ${theme.secondary}`}
                >
                  <div className={`text-xs ${theme.textMuted}`}>
                    {content.ui.sum.resultLabel}
                  </div>
                  <div className={`text-lg font-extrabold ${theme.text}`}>
                    {sumResult.sum}
                  </div>
                  <div className={`text-xs ${theme.textMuted}`}>
                    {content.ui.sum.countedLabel}: {sumResult.count}
                  </div>

                  <button
                    onClick={handleCopySum}
                    className={`mt-2 w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
                  >
                    <Copy size={16} />
                    {copied
                      ? content.ui.actions.copied
                      : content.ui.sum.copyResult}
                  </button>
                </div>
              </div>

              {/* Export */}
              <div
                className={`rounded-2xl border p-3 ${theme.border} ${theme.card}`}
              >
                <div className={`text-xs mb-2 ${theme.textMuted}`}>
                  {content.ui.export.title}
                </div>
                <div className={`text-xs mb-2 ${theme.textMuted}`}>
                  {content.ui.export.rangeTitle}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, filteredSortedRows.length)}
                    value={exportFromRow}
                    onChange={(e) => setExportFromRow(Number(e.target.value))}
                    className={inputClass}
                    placeholder={content.ui.export.fromRowPlaceholder}
                  />
                  <input
                    type="number"
                    min={1}
                    max={Math.max(1, filteredSortedRows.length)}
                    value={exportToRow}
                    onChange={(e) => setExportToRow(Number(e.target.value))}
                    className={inputClass}
                    placeholder={content.ui.export.toRowPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-1 gap-2 mt-2">
                  <button
                    onClick={handleExportCsvFiltered}
                    className={`w-full px-3 py-2 rounded-xl transition-colors ${theme.primary}`}
                  >
                    {content.ui.export.filteredButton}
                  </button>

                  <button
                    onClick={handleExportCsvRange}
                    className={`w-full px-3 py-2 rounded-xl border hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
                  >
                    {content.ui.export.rangeButton}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table (scroll container) */}
      <div className={`flex-1 min-h-0 flex flex-col ${theme.bg}`}>
        {rows.length > 0 ? (
          <>
            {/* این div اسکرول اصلی جدول است */}
            <div className="flex-1 min-h-0 overflow-auto">
              <table className="w-full min-w-max text-sm text-left border-collapse relative">
                <thead
                  className={`sticky top-0 z-10 shadow-sm ${theme.secondary} text-xs uppercase tracking-wider`}
                >
                  <tr>
                    <th
                      className={`p-3 font-bold border-b w-12 text-center ${theme.textMuted} ${theme.border}`}
                    >
                      {content.ui.table.indexHeader}
                    </th>

                    {headers.map((header) => (
                      <th
                        key={header}
                        className={`p-3 font-bold border-b border-r last:border-r-0 min-w-[140px] sm:min-w-[160px] text-right ${theme.text} ${theme.border} cursor-pointer select-none`}
                        onClick={() => {
                          setSort((prev) => {
                            if (!prev || prev.column !== header)
                              return { column: header, dir: "asc" };
                            return {
                              column: header,
                              dir: prev.dir === "asc" ? "desc" : "asc",
                            };
                          });
                        }}
                        title={content.ui.sort.title}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate">{header}</span>
                          {sort?.column === header && (
                            <span className={`text-[10px] ${theme.textMuted}`}>
                              {sort.dir === "asc" ? "▲" : "▼"}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}

                    <th
                      className={`p-3 font-bold border-b w-12 text-center ${theme.textMuted} ${theme.border}`}
                    >
                      {content.ui.table.deleteHeader}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedRows.map((row, index) => {
                    const realIndex =
                      (currentPage - 1) * safeRowsPerPage + index;

                    return (
                      <tr
                        key={row.__id}
                        className={`group border-b ${theme.border} hover:opacity-95 transition-opacity`}
                      >
                        <td
                          className={`p-3 border-r text-center text-xs opacity-60 font-mono select-none ${theme.border}`}
                        >
                          {realIndex + 1}
                        </td>

                        {headers.map((header) => (
                          <td
                            key={`${row.__id}-${header}`}
                            className={`p-0 border-r last:border-r-0 ${theme.border}`}
                          >
                            <input
                              type="text"
                              value={String(row[header] ?? "")}
                              onFocus={saveToHistory}
                              onChange={(e) =>
                                handleCellChange(
                                  row.__id,
                                  header,
                                  e.target.value
                                )
                              }
                              className={`w-full h-full px-3 py-2.5 bg-transparent outline-none text-right focus:ring-2 ${theme.ring} ${theme.text}`}
                              dir="auto"
                            />
                          </td>
                        ))}

                        <td className={`p-2 text-center ${theme.border}`}>
                          <button
                            onClick={() => deleteRow(row.__id)}
                            className={`p-1.5 rounded-md transition-colors border ${theme.note.errorBorder} ${theme.note.errorBg} ${theme.note.errorText} hover:opacity-90`}
                            title={content.ui.table.deleteTooltip}
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

            {/* Pagination */}
            <div
              className={`p-3 border-t flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 sm:justify-between ${theme.border} ${theme.card}`}
            >
              <span className={`text-xs ${theme.textMuted}`}>
                {content.ui.pagination.summaryPrefix}
                {paginationFrom}
                {content.ui.pagination.summaryFromToSeparator}
                {paginationTo}
                {content.ui.pagination.summaryOfWord}
                {filteredSortedRows.length}
                {content.ui.pagination.summarySuffix}
              </span>

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
                >
                  <ChevronRight size={18} />
                </button>

                <span className={`text-sm font-mono px-2 ${theme.text}`}>
                  {currentPage} / {Math.max(1, totalPages)}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages || 1, p + 1))
                  }
                  disabled={currentPage >= (totalPages || 1)}
                  className={`p-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className={`text-lg font-extrabold ${theme.text}`}>
              {content.ui.empty.title}
            </div>
            <div className={`mt-2 text-sm opacity-70 ${theme.textMuted}`}>
              {content.ui.empty.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
