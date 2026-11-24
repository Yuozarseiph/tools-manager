// Comprehensive, high-precision unit definitions for the unit converter.
// Every "factor" is the multiplier that converts 1 of that unit into the
// category's SI base unit. Conversion between any two units in the same
// category is: value * fromFactor / toFactor.
//
// Temperature is special-cased (affine, not linear) and handled separately.

import {
  Ruler,
  Weight,
  Thermometer,
  Square,
  Box,
  Gauge,
  Timer,
  Wind,
  Zap,
  Flame,
  HardDrive,
  Compass,
  RotateCw,
  Waves,
  Move3d,
  type LucideIcon,
} from "lucide-react";

export interface UnitDef {
  factor: number; // to SI base unit
}

export interface CategoryDef {
  icon: LucideIcon;
  base: string; // key of the SI base unit
  affine?: boolean; // temperature-style (uses offset formulas)
  units: Record<string, UnitDef>;
}

// Digital data: base unit = bit. Uses decimal (kB) and binary (KiB) prefixes.
export const CATEGORIES: Record<string, CategoryDef> = {
  length: {
    icon: Ruler,
    base: "m",
    units: {
      nm: { factor: 1e-9 },
      um: { factor: 1e-6 },
      mm: { factor: 1e-3 },
      cm: { factor: 1e-2 },
      dm: { factor: 1e-1 },
      m: { factor: 1 },
      km: { factor: 1000 },
      in: { factor: 0.0254 },
      ft: { factor: 0.3048 },
      yd: { factor: 0.9144 },
      mi: { factor: 1609.344 },
      nmi: { factor: 1852 },
      ly: { factor: 9.4607304725808e15 },
      au: { factor: 1.495978707e11 },
    },
  },
  mass: {
    icon: Weight,
    base: "kg",
    units: {
      ug: { factor: 1e-9 },
      mg: { factor: 1e-6 },
      g: { factor: 1e-3 },
      kg: { factor: 1 },
      t: { factor: 1000 },
      oz: { factor: 0.028349523125 },
      lb: { factor: 0.45359237 },
      st: { factor: 6.35029318 },
      ton_us: { factor: 907.18474 },
      ton_uk: { factor: 1016.0469088 },
      ct: { factor: 0.0002 },
    },
  },
  temperature: {
    icon: Thermometer,
    base: "c",
    affine: true,
    units: {
      c: { factor: 1 },
      f: { factor: 1 },
      k: { factor: 1 },
    },
  },
  area: {
    icon: Square,
    base: "m2",
    units: {
      mm2: { factor: 1e-6 },
      cm2: { factor: 1e-4 },
      m2: { factor: 1 },
      ha: { factor: 1e4 },
      km2: { factor: 1e6 },
      in2: { factor: 0.00064516 },
      ft2: { factor: 0.09290304 },
      yd2: { factor: 0.83612736 },
      acre: { factor: 4046.8564224 },
      mi2: { factor: 2589988.110336 },
    },
  },
  volume: {
    icon: Box,
    base: "l",
    units: {
      ml: { factor: 1e-3 },
      cl: { factor: 1e-2 },
      l: { factor: 1 },
      m3: { factor: 1000 },
      cm3: { factor: 1e-3 },
      tsp: { factor: 0.00492892159375 },
      tbsp: { factor: 0.01478676478125 },
      floz_us: { factor: 0.0295735295625 },
      cup_us: { factor: 0.2365882365 },
      pt_us: { factor: 0.473176473 },
      qt_us: { factor: 0.946352946 },
      gal_us: { factor: 3.785411784 },
      gal_uk: { factor: 4.54609 },
      in3: { factor: 0.016387064 },
      ft3: { factor: 28.316846592 },
    },
  },
  speed: {
    icon: Gauge,
    base: "mps",
    units: {
      mps: { factor: 1 },
      kmph: { factor: 1 / 3.6 },
      mph: { factor: 0.44704 },
      knot: { factor: 0.514444444444 },
      fps: { factor: 0.3048 },
      mach: { factor: 340.29 },
    },
  },
  time: {
    icon: Timer,
    base: "s",
    units: {
      ns: { factor: 1e-9 },
      us: { factor: 1e-6 },
      ms: { factor: 1e-3 },
      s: { factor: 1 },
      min: { factor: 60 },
      h: { factor: 3600 },
      day: { factor: 86400 },
      week: { factor: 604800 },
      month: { factor: 2629800 }, // average Gregorian month
      year: { factor: 31557600 }, // Julian year (365.25 days)
    },
  },
  pressure: {
    icon: Wind,
    base: "pa",
    units: {
      pa: { factor: 1 },
      kpa: { factor: 1000 },
      mpa: { factor: 1e6 },
      bar: { factor: 1e5 },
      mbar: { factor: 100 },
      atm: { factor: 101325 },
      psi: { factor: 6894.757293168 },
      torr: { factor: 133.322368421 },
      mmhg: { factor: 133.322387415 },
    },
  },
  energy: {
    icon: Flame,
    base: "j",
    units: {
      j: { factor: 1 },
      kj: { factor: 1000 },
      cal: { factor: 4.184 },
      kcal: { factor: 4184 },
      wh: { factor: 3600 },
      kwh: { factor: 3.6e6 },
      ev: { factor: 1.602176634e-19 },
      btu: { factor: 1055.05585262 },
      ftlb: { factor: 1.3558179483314 },
    },
  },
  power: {
    icon: Zap,
    base: "w",
    units: {
      mw_milli: { factor: 1e-3 },
      w: { factor: 1 },
      kw: { factor: 1000 },
      mw: { factor: 1e6 },
      hp: { factor: 745.6998715823 }, // mechanical horsepower
      hp_metric: { factor: 735.49875 },
      btuh: { factor: 0.29307107017 },
    },
  },
  force: {
    icon: Move3d,
    base: "n",
    units: {
      n: { factor: 1 },
      kn: { factor: 1000 },
      dyn: { factor: 1e-5 },
      kgf: { factor: 9.80665 },
      lbf: { factor: 4.4482216152605 },
    },
  },
  torque: {
    icon: RotateCw,
    base: "nm",
    units: {
      nm: { factor: 1 },
      knm: { factor: 1000 },
      kgfm: { factor: 9.80665 },
      lbfft: { factor: 1.3558179483314 },
      lbfin: { factor: 0.1129848290276 },
    },
  },
  frequency: {
    icon: Waves,
    base: "hz",
    units: {
      hz: { factor: 1 },
      khz: { factor: 1e3 },
      mhz: { factor: 1e6 },
      ghz: { factor: 1e9 },
      rpm: { factor: 1 / 60 },
    },
  },
  angle: {
    icon: Compass,
    base: "deg",
    units: {
      deg: { factor: 1 },
      rad: { factor: 180 / Math.PI },
      grad: { factor: 0.9 },
      arcmin: { factor: 1 / 60 },
      arcsec: { factor: 1 / 3600 },
      turn: { factor: 360 },
    },
  },
  data: {
    icon: HardDrive,
    base: "b", // bit
    units: {
      b: { factor: 1 },
      B: { factor: 8 },
      kb: { factor: 1e3 },
      kB: { factor: 8e3 },
      mb: { factor: 1e6 },
      mB: { factor: 8e6 },
      gb: { factor: 1e9 },
      gB: { factor: 8e9 },
      tb: { factor: 1e12 },
      tB: { factor: 8e12 },
      kib: { factor: 1024 },
      kiB: { factor: 8 * 1024 },
      miB: { factor: 8 * 1024 ** 2 },
      giB: { factor: 8 * 1024 ** 3 },
      tiB: { factor: 8 * 1024 ** 4 },
    },
  },
};

export type CategoryKey = keyof typeof CATEGORIES;

// Affine temperature conversion. Converts value from `from` to `to`.
export function convertTemperature(
  value: number,
  from: string,
  to: string,
): number {
  // First to Celsius
  let c: number;
  if (from === "c") c = value;
  else if (from === "f") c = ((value - 32) * 5) / 9;
  else c = value - 273.15; // kelvin
  // Celsius to target
  if (to === "c") return c;
  if (to === "f") return (c * 9) / 5 + 32;
  return c + 273.15; // kelvin
}

export function convert(
  value: number,
  category: CategoryKey,
  from: string,
  to: string,
): number | null {
  const cat = CATEGORIES[category];
  if (!cat) return null;
  if (cat.affine) return convertTemperature(value, from, to);
  const f = cat.units[from]?.factor;
  const t = cat.units[to]?.factor;
  if (f === undefined || t === undefined) return null;
  return (value * f) / t;
}

// Formats a number with high precision but no trailing-zero / float noise.
export function formatResult(value: number): string {
  if (!isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  let str: string;
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e15)) {
    str = value.toExponential(6);
  } else {
    // Up to 10 significant-ish digits, trimmed.
    str = value.toPrecision(12);
  }
  // Clean float noise and trailing zeros for non-exponential output.
  if (!str.includes("e")) {
    if (str.includes(".")) {
      str = str.replace(/\.?0+$/, "");
    }
    // Guard against strings like "-0"
    if (str === "-0") str = "0";
  }
  return str;
}
