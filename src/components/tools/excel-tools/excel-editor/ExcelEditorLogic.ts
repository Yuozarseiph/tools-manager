import { useMemo, useCallback, useState } from "react";
import {
  cloneRowsSafe,
  normalizeStr,
  parseNumberMaybe,
  createColumnTypeCache,
  stripInternal,
  clampInt,
} from "./utils";
import type { DataRow, SortState, FilterState, ColumnType } from "./types";

const MAX_HISTORY = 10;

/**
 * Central derived-state hook for the Excel editor: search -> filter -> sort
 * -> paginate, plus undo history management.
 *
 * Notes on the fixes made here vs. the previous version:
 * - `paginatedRows` now actually takes `currentPage` into account (previously
 *   hard-coded to page 1, so pagination silently did nothing when this hook
 *   was used).
 * - Column type detection is computed once per relevant row-set via a small
 *   cache instead of re-scanning the same rows 2-3x per render (filter,
 *   sort, and the "active filter type" badge all needed it separately).
 */
export function useExcelEditorLogic(
  rows: DataRow[],
  headers: string[],
  searchQuery: string,
  sort: SortState,
  filter: FilterState,
  rowsPerPage: number,
  currentPage: number,
) {
  const [history, setHistory] = useState<DataRow[][]>([]);

  const pushHistorySnapshot = useCallback((snapshotOf: DataRow[]) => {
    setHistory((prev) => {
      const snap = cloneRowsSafe(snapshotOf);
      const next = [...prev, snap];
      return next.length > MAX_HISTORY ? next.slice(1) : next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return undefined;
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    return previousState;
  }, [history]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const searchedRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((row) =>
      Object.values(stripInternal(row)).some((val) =>
        String(val ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [rows, searchQuery]);

  // One cache per distinct `searchedRows` identity — shared by the filter
  // logic and the "active filter type" badge so the column only gets
  // scanned once, not twice, per render.
  const searchedTypeCache = useMemo(
    () => createColumnTypeCache(searchedRows),
    [searchedRows],
  );

  const activeFilterType: ColumnType = useMemo(() => {
    if (!filter?.column) return "text";
    return searchedTypeCache(filter.column);
  }, [filter?.column, searchedTypeCache]);

  const filteredRows = useMemo(() => {
    if (!filter || !filter.column) return searchedRows;
    const colType = searchedTypeCache(filter.column);

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
  }, [searchedRows, filter, searchedTypeCache]);

  // Separate cache for filteredRows, since sort operates on the
  // post-filter set (which can have a different type distribution).
  const filteredTypeCache = useMemo(
    () => createColumnTypeCache(filteredRows),
    [filteredRows],
  );

  const filteredSortedRows = useMemo(() => {
    if (!sort || !sort.column) return filteredRows;

    const colType = filteredTypeCache(sort.column);
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
  }, [filteredRows, sort, filteredTypeCache]);

  const safeRowsPerPage = useMemo(
    () => clampInt(rowsPerPage, 1, 100),
    [rowsPerPage],
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredSortedRows.length / safeRowsPerPage)),
    [filteredSortedRows.length, safeRowsPerPage],
  );

  const safeCurrentPage = useMemo(
    () => clampInt(currentPage, 1, totalPages),
    [currentPage, totalPages],
  );

  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * safeRowsPerPage;
    const end = start + safeRowsPerPage;
    return filteredSortedRows.slice(start, end);
  }, [filteredSortedRows, safeCurrentPage, safeRowsPerPage]);

  return {
    history,
    pushHistorySnapshot,
    handleUndo,
    clearHistory,
    searchedRows,
    activeFilterType,
    filteredRows,
    filteredSortedRows,
    safeRowsPerPage,
    totalPages,
    safeCurrentPage,
    paginatedRows,
  };
}
