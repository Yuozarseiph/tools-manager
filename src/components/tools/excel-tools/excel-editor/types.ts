export type CellValue = string | number | boolean | null;
export type DataRow = { __id: string } & Record<string, CellValue>;
export type SortDir = "asc" | "desc";
export type SortState = { column: string; dir: SortDir } | null;
export type FilterOp =
  | "contains"
  | "equals"
  | "startsWith"
  | "gt"
  | "lt"
  | "between";
export type FilterState = {
  column: string;
  op: FilterOp;
  value: string;
  value2?: string;
} | null;
export type ColumnType = "number" | "text";
export {};
