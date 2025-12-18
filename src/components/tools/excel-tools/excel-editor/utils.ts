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

export {
  makeId,
  cloneRowsSafe,
  normalizeStr,
  normalizeNumberString,
  parseNumberMaybe,
  detectColumnType,
  stripInternal,
  clampInt,
  downloadTextFile,
};
