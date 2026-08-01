import type { CellValue, ColumnType, DataRow } from "./types";

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `r_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function cloneRowsSafe(rows: DataRow[]): DataRow[] {
  if (typeof structuredClone === "function") return structuredClone(rows);
  return JSON.parse(JSON.stringify(rows)) as DataRow[];
}

function normalizeStr(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function normalizeNumberString(input: string): string {
  let s = String(input ?? "").trim();
  if (!s) return "";
  const persianMap: Record<string, string> = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
  };
  s = s.replace(/[۰-۹]/g, (d) => persianMap[d] ?? d);
  const arabicIndicMap: Record<string, string> = {
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  s = s.replace(/[٠-٩]/g, (d) => arabicIndicMap[d] ?? d);

  s = s.replace(/[,،]/g, ".");
  s = s.replace(/[\u066B]/g, ".");
  s = s.replace(/[\u066C\u060C\s\u00A0_]/g, "");

  s = s.replace(/[^0-9.\-]/g, "");

  const firstDot = s.indexOf(".");
  if (firstDot !== -1) {
    s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  }

  s = s.replace(/(?!^)-/g, "");

  return s;
}

function parseNumberMaybe(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;

  let raw = String(v ?? "").trim();
  if (!raw) return undefined;

  let parenNegative = false;
  if (/^\(.*\)$/.test(raw)) {
    parenNegative = true;
    raw = raw.slice(1, -1).trim();
  }

  const cleaned = normalizeNumberString(raw);
  if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.")
    return undefined;

  const n = Number(cleaned);
  if (!Number.isFinite(n)) return undefined;

  return parenNegative ? (n === 0 ? -0 : -Math.abs(n)) : n;
}

/**
 * Detects the dominant type of a column by sampling up to 200 rows.
 * Pure function — callers should memoize results themselves keyed on
 * (rows reference, column) to avoid redundant re-scans; see
 * `createColumnTypeCache` below.
 */
function detectColumnType(rows: DataRow[], column: string): ColumnType {
  let checked = 0;
  let numeric = 0;
  for (let i = 0; i < rows.length && checked < 200; i += 1) {
    const v = rows[i]?.[column];
    if (v === null || v === undefined || v === "") continue;
    checked += 1;
    if (parseNumberMaybe(v) !== undefined) numeric += 1;
  }
  if (checked === 0) return "text";
  return numeric / checked >= 0.7 ? "number" : "text";
}

/**
 * Creates a tiny memoization cache for detectColumnType so that when the
 * same (rows array reference, column) pair is requested multiple times in
 * the same render pass (e.g. by filter, sort and the UI "type" badge),
 * the underlying scan only runs once instead of 3x.
 * Call `createColumnTypeCache()` once per relevant rows-array identity
 * (e.g. inside a useMemo keyed on that array).
 */
function createColumnTypeCache(rows: DataRow[]) {
  const cache = new Map<string, ColumnType>();
  return (column: string): ColumnType => {
    const hit = cache.get(column);
    if (hit) return hit;
    const type = detectColumnType(rows, column);
    cache.set(column, type);
    return type;
  };
}

function stripInternal(row: DataRow): Record<string, CellValue> {
  const { __id, ...rest } = row;
  return rest;
}

function clampInt(v: number, min: number, max: number) {
  const n = Number.isFinite(v) ? Math.trunc(v) : min;
  return Math.min(max, Math.max(min, n));
}

function downloadTextFile(name: string, text: string, mime: string) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Ensures header names are unique (Excel/CSV files can contain duplicate
 * column names, e.g. two columns both literally called "Name"). Without
 * this, rows built as plain objects keyed by header would silently drop
 * data for every duplicate but the last.
 */
function dedupeHeaders(headers: string[]): string[] {
  const seen = new Map<string, number>();
  return headers.map((h) => {
    const base = h === "" ? "Column" : h;
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  });
}

/** Basic sanity check that the uploaded file looks like a spreadsheet we can parse. */
function isSupportedSpreadsheetFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv")
  );
}

export {
  makeId,
  cloneRowsSafe,
  normalizeStr,
  normalizeNumberString,
  parseNumberMaybe,
  detectColumnType,
  createColumnTypeCache,
  stripInternal,
  clampInt,
  downloadTextFile,
  dedupeHeaders,
  isSupportedSpreadsheetFile,
};
