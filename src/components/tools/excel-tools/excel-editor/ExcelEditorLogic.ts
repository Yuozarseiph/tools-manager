import { useMemo, useCallback, useState } from "react";
import {
  cloneRowsSafe,
  normalizeStr,
  parseNumberMaybe,
  detectColumnType,
  stripInternal,
  clampInt,
} from "./utils";
import {
  CellValue,
  DataRow,
  SortDir,
  SortState,
  FilterOp,
  FilterState,
  ColumnType,
} from "./types";

export function useExcelEditorLogic(
  rows: DataRow[],
  headers: string[],
  searchQuery: string,
  sort: SortState,
  filter: FilterState,
  rowsPerPage: number
) {
  const [history, setHistory] = useState<DataRow[][]>([]);

  const saveToHistory = useCallback(() => {
    setHistory((prev) => {
      const snap = cloneRowsSafe(rows);
      const next = [...prev, snap];
      return next.length > 10 ? next.slice(1) : next;
    });
  }, [rows]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    return previousState;
  }, [history]);

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

  const paginatedRows = useMemo(
    () =>
      filteredSortedRows.slice((1 - 1) * safeRowsPerPage, 1 * safeRowsPerPage),
    [filteredSortedRows, safeRowsPerPage]
  );

  return {
    saveToHistory,
    handleUndo,
    searchedRows,
    activeFilterType,
    filteredRows,
    filteredSortedRows,
    safeRowsPerPage,
    totalPages,
    paginatedRows,
  };
}
