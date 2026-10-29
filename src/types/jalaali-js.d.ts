declare module "jalaali-js" {
  export function toJalaali(date: Date): { jy: number; jm: number; jd: number };
  export function toGregorian(year: number, month: number, day: number): { gy: number; gm: number; gd: number };
  export function jalaaliMonthLength(year: number, month: number): number;
}
