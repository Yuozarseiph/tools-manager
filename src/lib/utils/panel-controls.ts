import { toJalaali, toGregorian } from "jalaali-js";

export function normaliseHex(value: string): string | null {
  const text = value.trim().replace(/^#/, "");
  if (/^[a-f\d]{3}$/i.test(text)) return `#${[...text].map(char => char + char).join("").toLowerCase()}`;
  return /^[a-f\d]{6}$/i.test(text) ? `#${text.toLowerCase()}` : null;
}
export function rgbChannels(hex: string): [number, number, number] {
  const value = (normaliseHex(hex) ?? "#000000").slice(1);
  return [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
}
export function rgbHex(channels: number[]) { return `#${channels.map(value => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("")}`; }
export function dateValue(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
export function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return dateValue(date) === value ? date : null;
}
export function formatPanelDate(value: string, locale: string) {
  const date = parseDate(value);
  return date ? new Intl.DateTimeFormat(`${locale}-u-ca-${locale === "fa" ? "persian" : "gregory"}`, { year: "numeric", month: "long", day: "numeric" }).format(date) : value;
}
export function calendarDays(month: Date, weekStart: number, calendar: PanelCalendar = "gregory") {
  const first = calendarMonth(month, 0, calendar);
  const offset = (first.getDay() - weekStart + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => new Date(first.getFullYear(), first.getMonth(), first.getDate() - offset + index, 12));
}


export type PanelCalendar = "persian" | "gregory";
export function calendarParts(date: Date, calendar: PanelCalendar) {
  if (calendar === "persian") { const value = toJalaali(date); return { year: value.jy, month: value.jm, day: value.jd }; }
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}
export function calendarMonth(date: Date, delta: number, calendar: PanelCalendar) {
  const parts = calendarParts(date, calendar);
  const index = parts.month - 1 + delta, year = parts.year + Math.floor(index / 12), month = ((index % 12 + 12) % 12) + 1;
  if (calendar === "persian") { const value = toGregorian(year, month, 1); return new Date(value.gy, value.gm - 1, value.gd, 12); }
  return new Date(year, month - 1, 1, 12);
}
