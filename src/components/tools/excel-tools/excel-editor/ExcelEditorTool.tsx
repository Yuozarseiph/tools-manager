"use client";

import {
  useState,
  ChangeEvent,
  useMemo,
  useEffect,
  useCallback,
  useRef,
  memo,
  KeyboardEvent,
  ClipboardEvent,
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
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useThemeColors } from "@/hooks/useThemeColors";
import CustomDropdown from "@/components/ui/CustomDropdown";
import {
  useExcelEditorContent,
  type ExcelEditorToolContent,
} from "./excel-editor.content";
import { useExcelEditorLogic } from "./ExcelEditorLogic";
import { useDebouncedValue } from "./useDebouncedValue";

import type {
  DataRow,
  SortDir,
  SortState,
  FilterOp,
  FilterState,
  LoadStatus,
} from "./types";

import {
  makeId,
  parseNumberMaybe,
  stripInternal,
  clampInt,
  downloadTextFile,
  dedupeHeaders,
  isSupportedSpreadsheetFile,
} from "./utils";

// ---------------------------------------------------------------------------
// Memoized single-cell input. Only this cell re-renders while the user types,
// instead of the entire table, because it's isolated behind React.memo and
// receives only the primitives it needs as props.
// ---------------------------------------------------------------------------
const EditableCell = memo(function EditableCell({
  value,
  onChange,
  onCommitStart,
  onKeyDown,
  onPaste,
  ringClass,
  textClass,
  inputRef,
}: {
  value: string;
  onChange: (value: string) => void;
  onCommitStart: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: ClipboardEvent<HTMLInputElement>) => void;
  ringClass: string;
  textClass: string;
  inputRef?: (el: HTMLInputElement | null) => void;
}) {
  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onFocus={onCommitStart}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      className={`w-full h-full px-3 py-2.5 bg-transparent outline-none text-right focus:ring-2 ${ringClass} ${textClass}`}
      dir="auto"
    />
  );
});

// ---------------------------------------------------------------------------
// Memoized table row. Prevents re-rendering every row in the page whenever a
// single cell's value changes elsewhere, or whenever unrelated toolbar state
// (search text, filters, panel toggles) changes.
// ---------------------------------------------------------------------------
const TableRow = memo(function TableRow({
  row,
  rowNumber,
  headers,
  onCellChange,
  onCommitStart,
  onDeleteRow,
  onKeyDown,
  onPaste,
  registerCellRef,
  theme,
  deleteTooltip,
}: {
  row: DataRow;
  rowNumber: number;
  headers: string[];
  onCellChange: (rowId: string, header: string, value: string) => void;
  onCommitStart: () => void;
  onDeleteRow: (rowId: string) => void;
  onKeyDown: (
    e: KeyboardEvent<HTMLInputElement>,
    rowId: string,
    colIndex: number,
  ) => void;
  onPaste: (
    e: ClipboardEvent<HTMLInputElement>,
    rowId: string,
    colIndex: number,
  ) => void;
  registerCellRef: (
    rowId: string,
    colIndex: number,
  ) => (el: HTMLInputElement | null) => void;
  theme: ReturnType<typeof useThemeColors>;
  deleteTooltip: string;
}) {
  return (
    <tr
      className={`group border-b ${theme.border} hover:opacity-95 transition-opacity`}
    >
      <td
        className={`p-3 border-r text-center text-xs opacity-60 font-mono select-none ${theme.border}`}
      >
        {rowNumber}
      </td>

      {headers.map((header, colIndex) => (
        <td
          key={`${row.__id}-${header}`}
          className={`p-0 border-r last:border-r-0 ${theme.border}`}
        >
          <EditableCell
            value={String(row[header] ?? "")}
            onChange={(value) => onCellChange(row.__id, header, value)}
            onCommitStart={onCommitStart}
            onKeyDown={(e) => onKeyDown(e, row.__id, colIndex)}
            onPaste={(e) => onPaste(e, row.__id, colIndex)}
            ringClass={theme.ring}
            textClass={theme.text}
            inputRef={registerCellRef(row.__id, colIndex)}
          />
        </td>
      ))}

      <td className={`p-2 text-center ${theme.border}`}>
        <button
          onClick={() => onDeleteRow(row.__id)}
          className={`p-1.5 rounded-md transition-colors border ${theme.note.errorBorder} ${theme.note.errorBg} ${theme.note.errorText} hover:opacity-90`}
          title={deleteTooltip}
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
});

export default function ExcelEditorTool() {
  const theme = useThemeColors();
  const content: ExcelEditorToolContent = useExcelEditorContent();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<DataRow[]>([]);
  const [fileName, setFileName] = useState<string>("edited-file.xlsx");
  const [status, setStatus] = useState<LoadStatus>({ kind: "idle" });

  const [searchInput, setSearchInput] = useState("");
  const searchQuery = useDebouncedValue(searchInput, 300);

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

  // Tracks whether a history snapshot has already been taken for the row
  // currently being edited, so that rapid keystrokes across the same row
  // don't each trigger an expensive deep clone — only the first edit since
  // the last commit does.
  const dirtySinceSnapshotRef = useRef(false);

  const {
    history,
    pushHistorySnapshot,
    handleUndo: logicHandleUndo,
    clearHistory,
    activeFilterType,
    filteredSortedRows,
    safeRowsPerPage,
    totalPages,
    safeCurrentPage,
    paginatedRows,
  } = useExcelEditorLogic(
    rows,
    headers,
    searchQuery,
    sort,
    filter,
    rowsPerPage,
    currentPage,
  );

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

  // Snapshot only once per "editing session" (first change after a commit),
  // not on every focus/keystroke — this was the main cause of full deep
  // clones firing constantly on large sheets.
  const saveToHistoryOnce = useCallback(() => {
    if (dirtySinceSnapshotRef.current) return;
    dirtySinceSnapshotRef.current = true;
    pushHistorySnapshot(rows);
  }, [pushHistorySnapshot, rows]);

  const commitEdit = useCallback(() => {
    dirtySinceSnapshotRef.current = false;
  }, []);

  const handleUndo = () => {
    const previousState = logicHandleUndo();
    if (!previousState) return;
    setRows(previousState);
    dirtySinceSnapshotRef.current = false;
  };

  const resetDerivedInputsForNewFile = (rowCount: number, hdrs: string[]) => {
    setHistory0();
    setSort(null);
    setFilter(null);
    setSumColumn(hdrs[0] ?? "");
    setRangeFromRow(1);
    setRangeToRow(rowCount || 1);
    setExportFromRow(1);
    setExportToRow(rowCount || 1);
    setRangeFromCol(1);
    setRangeToCol(hdrs.length || 1);
    setSumRowNumber(1);
    setCurrentPage(1);
  };

  const setHistory0 = () => {
    clearHistory();
    dirtySinceSnapshotRef.current = false;
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Always clear the input value so re-selecting the same file re-fires onChange.
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (!file) return;

    if (!isSupportedSpreadsheetFile(file)) {
      setStatus({ kind: "error", message: content.ui.status.invalidType });
      return;
    }

    setFileName(file.name);
    setStatus({ kind: "loading" });

    const reader = new FileReader();

    reader.onerror = () => {
      setStatus({ kind: "error", message: content.ui.status.parseError });
    };

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          setStatus({ kind: "error", message: content.ui.status.parseError });
          return;
        }

        const wb = XLSX.read(data as ArrayBuffer, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) {
          setStatus({ kind: "error", message: content.ui.status.emptyFile });
          return;
        }

        const dataJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
          defval: "",
        });

        if (dataJson.length === 0) {
          setStatus({ kind: "error", message: content.ui.status.emptyFile });
          return;
        }

        const rawHeaderSet = new Set<string>();
        dataJson.forEach((r) =>
          Object.keys(r).forEach((k) => rawHeaderSet.add(k)),
        );
        // De-duplicate header names: source files can legitimately contain
        // repeated column headers, which previously silently collided.
        const hdrs = dedupeHeaders(Array.from(rawHeaderSet));
        const rawHeaders = Array.from(rawHeaderSet);

        const withIds: DataRow[] = dataJson.map((r) => {
          const base: Record<string, string | number | boolean | null> = {};
          rawHeaders.forEach((rawH, i) => {
            const v = r[rawH];
            base[hdrs[i]] = (v ?? "") as any;
          });
          return { __id: makeId(), ...base };
        });

        setHeaders(hdrs);
        setRows(withIds);
        resetDerivedInputsForNewFile(withIds.length, hdrs);
        setStatus({ kind: "idle" });
      } catch {
        setStatus({ kind: "error", message: content.ui.status.parseError });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleCellChange = useCallback(
    (rowId: string, header: string, value: string) => {
      setRows((prev) => {
        // Only replace the specific row object; unrelated rows keep their
        // reference identity so memoized <TableRow> siblings skip re-render.
        const idx = prev.findIndex((r) => r.__id === rowId);
        if (idx === -1) return prev;
        const next = prev.slice();
        next[idx] = { ...next[idx], [header]: value };
        return next;
      });
    },
    [],
  );

  const addRow = () => {
    saveToHistoryOnce();
    commitEdit();
    const newRow: DataRow = { __id: makeId() };
    headers.forEach((h) => (newRow[h] = ""));
    setRows((prev) => [newRow, ...prev]);
  };

  const deleteRow = (rowId: string) => {
    saveToHistoryOnce();
    commitEdit();
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
      setHistory0();
      setFileName("");
      setSearchInput("");
      setCurrentPage(1);
      setSort(null);
      setFilter(null);
      setIsPseudoFullscreen(false);
      setStatus({ kind: "idle" });
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, sort, safeRowsPerPage]);

  useEffect(() => {
    setCurrentPage((p) => clampInt(p, 1, Math.max(1, totalPages)));
  }, [totalPages]);

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
      filteredSortedRows.length,
    );
    const to = clampInt(
      Math.max(rangeFromRow, rangeToRow),
      1,
      filteredSortedRows.length,
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
      headers.length,
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
      "text/csv;charset=utf-8",
    );
  };

  const handleExportCsvRange = () => {
    if (filteredSortedRows.length === 0) return;

    const from = clampInt(
      Math.min(exportFromRow, exportToRow),
      1,
      filteredSortedRows.length,
    );
    const to = clampInt(
      Math.max(exportFromRow, exportToRow),
      1,
      filteredSortedRows.length,
    );
    const slice = filteredSortedRows.slice(from - 1, to).map(stripInternal);

    const ws = XLSX.utils.json_to_sheet(slice);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadTextFile(
      `range_${from}-${to}_${fileName || "data"}.csv`,
      csv,
      "text/csv;charset=utf-8",
    );
  };

  // Only computed lazily off `rows.length` bucket to avoid JSON.stringify-ing
  // the entire dataset on every keystroke; recalculated only when the row
  // count actually changes (add/delete/upload), which is when size actually
  // changes meaningfully anyway.
  const approxSizeMb = useMemo(() => {
    if (rows.length === 0) return 0;
    const bytes = rows.reduce((s, r) => s + JSON.stringify(r).length, 0);
    return bytes / 1024 / 1024;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length, headers.length]);

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
    [content.ui.pagination.perPageSuffix],
  );

  const filterColumnOptions = useMemo(
    () => [
      { value: "", label: content.ui.filter.noFilter },
      ...headers.map((h) => ({ value: h, label: h })),
    ],
    [headers, content.ui.filter.noFilter],
  );

  const sortColumnOptions = useMemo(
    () => [
      { value: "", label: content.ui.sort.noSort },
      ...headers.map((h) => ({ value: h, label: h })),
    ],
    [headers, content.ui.sort.noSort],
  );

  const sortDirOptions = useMemo(
    () => [
      { value: "asc", label: content.ui.sort.directionAsc },
      { value: "desc", label: content.ui.sort.directionDesc },
    ],
    [content.ui.sort.directionAsc, content.ui.sort.directionDesc],
  );

  const sumModeOptions = useMemo(
    () => [
      { value: "column", label: content.ui.sum.modeColumn },
      { value: "row", label: content.ui.sum.modeRow },
    ],
    [content.ui.sum.modeColumn, content.ui.sum.modeRow],
  );

  const paginationFrom = filteredSortedRows.length
    ? (safeCurrentPage - 1) * safeRowsPerPage + 1
    : 0;

  const paginationTo = filteredSortedRows.length
    ? Math.min(safeCurrentPage * safeRowsPerPage, filteredSortedRows.length)
    : 0;

  // ---------------------------------------------------------------------
  // Keyboard navigation & paste support between cells (Excel-like UX).
  // Cell refs are tracked in a Map keyed by `${rowId}::${colIndex}` so we
  // can imperatively focus adjacent cells without re-rendering anything.
  // ---------------------------------------------------------------------
  const cellRefs = useRef(new Map<string, HTMLInputElement>());

  const registerCellRef = useCallback(
    (rowId: string, colIndex: number) => (el: HTMLInputElement | null) => {
      const key = `${rowId}::${colIndex}`;
      if (el) cellRefs.current.set(key, el);
      else cellRefs.current.delete(key);
    },
    [],
  );

  const focusCell = useCallback((rowId: string, colIndex: number) => {
    const el = cellRefs.current.get(`${rowId}::${colIndex}`);
    el?.focus();
    el?.select();
  }, []);

  const handleCellKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, rowId: string, colIndex: number) => {
      const rowIdx = paginatedRows.findIndex((r) => r.__id === rowId);
      if (rowIdx === -1) return;

      const goTo = (nextRowIdx: number, nextColIndex: number) => {
        const nextRow = paginatedRows[nextRowIdx];
        if (!nextRow) return;
        const clampedCol = clampInt(nextColIndex, 0, headers.length - 1);
        e.preventDefault();
        focusCell(nextRow.__id, clampedCol);
      };

      if (e.key === "Enter") {
        commitEdit();
        goTo(rowIdx + 1, colIndex);
      } else if (e.key === "ArrowDown" && (e.ctrlKey || e.metaKey)) {
        goTo(paginatedRows.length - 1, colIndex);
      } else if (e.key === "ArrowUp" && (e.ctrlKey || e.metaKey)) {
        goTo(0, colIndex);
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          if (colIndex > 0) goTo(rowIdx, colIndex - 1);
          else goTo(rowIdx - 1, headers.length - 1);
        } else {
          if (colIndex < headers.length - 1) goTo(rowIdx, colIndex + 1);
          else goTo(rowIdx + 1, 0);
        }
      }
    },
    [paginatedRows, headers.length, focusCell, commitEdit],
  );

  // Pasting a block of tab/newline separated cells (as copied from Excel)
  // fills adjacent cells starting at the focused one, instead of only ever
  // pasting into a single cell.
  const handleCellPaste = useCallback(
    (e: ClipboardEvent<HTMLInputElement>, rowId: string, colIndex: number) => {
      const text = e.clipboardData.getData("text/plain");
      if (!text.includes("\t") && !text.includes("\n")) return; // let default single-cell paste happen

      e.preventDefault();
      saveToHistoryOnce();

      const grid = text
        .replace(/\r/g, "")
        .split("\n")
        .filter((_, i, arr) => !(i === arr.length - 1 && arr[i] === "")) // drop trailing empty line
        .map((line) => line.split("\t"));

      const startRowIdx = paginatedRows.findIndex((r) => r.__id === rowId);
      if (startRowIdx === -1) return;

      setRows((prev) => {
        const next = prev.slice();
        grid.forEach((lineCells, rOffset) => {
          const targetPageRow = paginatedRows[startRowIdx + rOffset];
          if (!targetPageRow) return;
          const idx = next.findIndex((r) => r.__id === targetPageRow.__id);
          if (idx === -1) return;

          let updatedRow = { ...next[idx] };
          lineCells.forEach((cellVal, cOffset) => {
            const header = headers[colIndex + cOffset];
            if (!header) return;
            updatedRow = { ...updatedRow, [header]: cellVal };
          });
          next[idx] = updatedRow;
        });
        return next;
      });

      commitEdit();
    },
    [paginatedRows, headers, saveToHistoryOnce, commitEdit],
  );

  const showTable = rows.length > 0;

  return (
    <div ref={containerRef} className={rootClass}>
      {/* Toolbar */}
      <div className={`p-3 sm:p-4 border-b ${theme.border} ${theme.card}`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2 min-w-0">
              {!showTable ? (
                <label
                  className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl cursor-pointer transition-all active:scale-95 ${theme.primary}`}
                >
                  <UploadCloud size={18} />
                  <span className="text-sm font-bold">
                    {content.ui.upload.buttonInitial}
                  </span>
                  <input
                    ref={fileInputRef}
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
                      ref={fileInputRef}
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

            {showTable && (
              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:ml-auto">
                <div className="relative w-full sm:w-72 min-w-0">
                  <Search
                    size={16}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 opacity-60 ${theme.textMuted}`}
                  />
                  <input
                    type="text"
                    placeholder={content.ui.search.placeholder}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
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

          {/* Inline status: loading / error */}
          {status.kind === "loading" && (
            <div
              className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${theme.border} ${theme.secondary} ${theme.text}`}
            >
              <Loader2 size={16} className="animate-spin" />
              {content.ui.status.loading}
            </div>
          )}

          {status.kind === "error" && (
            <div
              className={`flex items-center justify-between gap-2 rounded-xl border p-3 text-sm ${theme.note.errorBorder} ${theme.note.errorBg} ${theme.note.errorText}`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={16} />
                <span>
                  <strong className="font-bold">
                    {content.ui.status.errorTitle}:
                  </strong>{" "}
                  {status.message}
                </span>
              </div>
              <button
                onClick={() => setStatus({ kind: "idle" })}
                className="whitespace-nowrap underline hover:opacity-80"
              >
                {content.ui.status.dismiss}
              </button>
            </div>
          )}

          {/* Panels */}
          {showTable && (
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

                <div className="flex flex-wrap justify-between mt-2 text-xs gap-2">
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
                  <div
                    className={`text-lg font-extrabold ${theme.text} break-all`}
                  >
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
        {showTable ? (
          <>
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
                      (safeCurrentPage - 1) * safeRowsPerPage + index;

                    return (
                      <TableRow
                        key={row.__id}
                        row={row}
                        rowNumber={realIndex + 1}
                        headers={headers}
                        onCellChange={handleCellChange}
                        onCommitStart={saveToHistoryOnce}
                        onDeleteRow={deleteRow}
                        onKeyDown={handleCellKeyDown}
                        onPaste={handleCellPaste}
                        registerCellRef={registerCellRef}
                        theme={theme}
                        deleteTooltip={content.ui.table.deleteTooltip}
                      />
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
                  disabled={safeCurrentPage === 1}
                  className={`p-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
                >
                  <ChevronRight size={18} />
                </button>

                <span className={`text-sm font-mono px-2 ${theme.text}`}>
                  {safeCurrentPage} / {Math.max(1, totalPages)}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages || 1, p + 1))
                  }
                  disabled={safeCurrentPage >= (totalPages || 1)}
                  className={`p-2 rounded-xl border disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-colors ${theme.border} ${theme.text}`}
                >
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          </>
        ) : status.kind !== "loading" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className={`text-lg font-extrabold ${theme.text}`}>
              {content.ui.empty.title}
            </div>
            <div className={`mt-2 text-sm opacity-70 ${theme.textMuted}`}>
              {content.ui.empty.description}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <Loader2 size={28} className={`animate-spin ${theme.text}`} />
          </div>
        )}
      </div>
    </div>
  );
}
