import { useLanguage } from "@/context/LanguageContext";

type Cat = {
  label: string;
  units: Record<string, string>;
};

type Locale = {
  id: string;
  category: string;
  title: string;
  description: string;
  features: string[];
  ui: {
    categories: Record<string, Cat>;
    input: {
      amountLabel: string;
      resultLabel: string;
      swap: string;
      copy: string;
      copied: string;
      search: string;
      noResult: string;
    };
    page: { title: string; description: string };
  };
};

const fa: Locale = {
  id: "unit-converter",
  category: "utility",
  title: "مبدل واحدها",
  description:
    "تبدیل دقیق بین واحدهای طول، جرم، دما، مساحت، حجم، سرعت، زمان، فشار، انرژی، توان، نیرو، گشتاور، فرکانس، زاویه و داده دیجیتال.",
  features: [
    "پشتیبانی از ۱۵ دسته واحد اصلی و فرعی با دقت بالا",
    "تبدیل فوری همراه با جابه‌جایی سریع واحد مبدأ و مقصد",
    "پشتیبانی از واحدهای مهندسی، روزمره و داده دیجیتال (باینری و اعشاری)",
    "کپی نتیجه با یک کلیک و رابط کاربری واکنش‌گرا",
  ],
  ui: {
    categories: {
      length: {
        label: "طول",
        units: {
          nm: "نانومتر (nm)",
          um: "میکرومتر (µm)",
          mm: "میلی‌متر (mm)",
          cm: "سانتی‌متر (cm)",
          dm: "دسی‌متر (dm)",
          m: "متر (m)",
          km: "کیلومتر (km)",
          in: "اینچ (in)",
          ft: "فوت (ft)",
          yd: "یارد (yd)",
          mi: "مایل (mi)",
          nmi: "مایل دریایی (nmi)",
          ly: "سال نوری (ly)",
          au: "واحد نجومی (AU)",
        },
      },
      mass: {
        label: "جرم / وزن",
        units: {
          ug: "میکروگرم (µg)",
          mg: "میلی‌گرم (mg)",
          g: "گرم (g)",
          kg: "کیلوگرم (kg)",
          t: "تن متریک (t)",
          oz: "اونس (oz)",
          lb: "پوند (lb)",
          st: "استون (st)",
          ton_us: "تن آمریکایی",
          ton_uk: "تن انگلیسی",
          ct: "قیراط (ct)",
        },
      },
      temperature: {
        label: "دما",
        units: {
          c: "سانتی‌گراد (°C)",
          f: "فارنهایت (°F)",
          k: "کلوین (K)",
        },
      },
      area: {
        label: "مساحت",
        units: {
          mm2: "میلی‌متر مربع (mm²)",
          cm2: "سانتی‌متر مربع (cm²)",
          m2: "متر مربع (m²)",
          ha: "هکتار (ha)",
          km2: "کیلومتر مربع (km²)",
          in2: "اینچ مربع (in²)",
          ft2: "فوت مربع (ft²)",
          yd2: "یارد مربع (yd²)",
          acre: "ایکر (acre)",
          mi2: "مایل مربع (mi²)",
        },
      },
      volume: {
        label: "حجم",
        units: {
          ml: "میلی‌لیتر (ml)",
          cl: "سانتی‌لیتر (cl)",
          l: "لیتر (l)",
          m3: "متر مکعب (m³)",
          cm3: "سانتی‌متر مکعب (cm³)",
          tsp: "قاشق چای‌خوری",
          tbsp: "قاشق غذاخوری",
          floz_us: "اونس مایع (US)",
          cup_us: "پیمانه (US)",
          pt_us: "پاینت (US)",
          qt_us: "کوارت (US)",
          gal_us: "گالن (US)",
          gal_uk: "گالن (UK)",
          in3: "اینچ مکعب (in³)",
          ft3: "فوت مکعب (ft³)",
        },
      },
      speed: {
        label: "سرعت",
        units: {
          mps: "متر بر ثانیه (m/s)",
          kmph: "کیلومتر بر ساعت (km/h)",
          mph: "مایل بر ساعت (mph)",
          knot: "گره (knot)",
          fps: "فوت بر ثانیه (ft/s)",
          mach: "ماخ (Mach)",
        },
      },
      time: {
        label: "زمان",
        units: {
          ns: "نانوثانیه (ns)",
          us: "میکروثانیه (µs)",
          ms: "میلی‌ثانیه (ms)",
          s: "ثانیه (s)",
          min: "دقیقه (min)",
          h: "ساعت (h)",
          day: "روز (day)",
          week: "هفته (week)",
          month: "ماه (میانگین)",
          year: "سال (year)",
        },
      },
      pressure: {
        label: "فشار",
        units: {
          pa: "پاسکال (Pa)",
          kpa: "کیلوپاسکال (kPa)",
          mpa: "مگاپاسکال (MPa)",
          bar: "بار (bar)",
          mbar: "میلی‌بار (mbar)",
          atm: "اتمسفر (atm)",
          psi: "پی‌اس‌آی (psi)",
          torr: "تور (Torr)",
          mmhg: "میلی‌متر جیوه (mmHg)",
        },
      },
      energy: {
        label: "انرژی",
        units: {
          j: "ژول (J)",
          kj: "کیلوژول (kJ)",
          cal: "کالری (cal)",
          kcal: "کیلوکالری (kcal)",
          wh: "وات‌ساعت (Wh)",
          kwh: "کیلووات‌ساعت (kWh)",
          ev: "الکترون‌ولت (eV)",
          btu: "بی‌تی‌یو (BTU)",
          ftlb: "فوت-پوند (ft·lb)",
        },
      },
      power: {
        label: "توان",
        units: {
          mw_milli: "میلی‌وات (mW)",
          w: "وات (W)",
          kw: "کیلووات (kW)",
          mw: "مگاوات (MW)",
          hp: "اسب بخار (hp)",
          hp_metric: "اسب بخار متریک (PS)",
          btuh: "BTU بر ساعت",
        },
      },
      force: {
        label: "نیرو",
        units: {
          n: "نیوتن (N)",
          kn: "کیلونیوتن (kN)",
          dyn: "داین (dyn)",
          kgf: "کیلوگرم‌نیرو (kgf)",
          lbf: "پوند-نیرو (lbf)",
        },
      },
      torque: {
        label: "گشتاور",
        units: {
          nm: "نیوتن‌متر (N·m)",
          knm: "کیلونیوتن‌متر (kN·m)",
          kgfm: "کیلوگرم‌نیرو-متر",
          lbfft: "پوند-فوت (lbf·ft)",
          lbfin: "پوند-اینچ (lbf·in)",
        },
      },
      frequency: {
        label: "فرکانس",
        units: {
          hz: "هرتز (Hz)",
          khz: "کیلوهرتز (kHz)",
          mhz: "مگاهرتز (MHz)",
          ghz: "گیگاهرتز (GHz)",
          rpm: "دور بر دقیقه (rpm)",
        },
      },
      angle: {
        label: "زاویه",
        units: {
          deg: "درجه (°)",
          rad: "رادیان (rad)",
          grad: "گِرِد (grad)",
          arcmin: "دقیقه قوسی (′)",
          arcsec: "ثانیه قوسی (″)",
          turn: "دور کامل (turn)",
        },
      },
      data: {
        label: "داده دیجیتال",
        units: {
          b: "بیت (bit)",
          B: "بایت (Byte)",
          kb: "کیلوبیت (kb)",
          kB: "کیلوبایت (kB)",
          mb: "مگابیت (Mb)",
          mB: "مگابایت (MB)",
          gb: "گیگابیت (Gb)",
          gB: "گیگابایت (GB)",
          tb: "ترابیت (Tb)",
          tB: "ترابایت (TB)",
          kib: "کیبی‌بیت (Kib)",
          kiB: "کیبی‌بایت (KiB)",
          miB: "مبی‌بایت (MiB)",
          giB: "گیبی‌بایت (GiB)",
          tiB: "تبی‌بایت (TiB)",
        },
      },
    },
    input: {
      amountLabel: "مقدار ورودی",
      resultLabel: "نتیجه تبدیل",
      swap: "جابه‌جایی واحدها",
      copy: "کپی نتیجه",
      copied: "کپی شد",
      search: "جستجوی دسته...",
      noResult: "دسته‌ای یافت نشد",
    },
    page: {
      title: "ابزار مبدل واحدها",
      description:
        "مقدار مورد نظر را وارد کنید، دسته و واحدها را انتخاب کنید و نتیجه تبدیل را همان لحظه با دقت بالا ببینید.",
    },
  },
};

const en: Locale = {
  id: "unit-converter",
  category: "utility",
  title: "Unit converter",
  description:
    "Precisely convert between length, mass, temperature, area, volume, speed, time, pressure, energy, power, force, torque, frequency, angle and digital data units.",
  features: [
    "15 main unit categories with primary and secondary units at high precision",
    "Instant conversion with quick source/target unit swapping",
    "Engineering, everyday and digital-data units (binary and decimal)",
    "One-click copy of the result and a responsive UI",
  ],
  ui: {
    categories: {
      length: {
        label: "Length",
        units: {
          nm: "Nanometer (nm)",
          um: "Micrometer (µm)",
          mm: "Millimeter (mm)",
          cm: "Centimeter (cm)",
          dm: "Decimeter (dm)",
          m: "Meter (m)",
          km: "Kilometer (km)",
          in: "Inch (in)",
          ft: "Foot (ft)",
          yd: "Yard (yd)",
          mi: "Mile (mi)",
          nmi: "Nautical mile (nmi)",
          ly: "Light-year (ly)",
          au: "Astronomical unit (AU)",
        },
      },
      mass: {
        label: "Mass / weight",
        units: {
          ug: "Microgram (µg)",
          mg: "Milligram (mg)",
          g: "Gram (g)",
          kg: "Kilogram (kg)",
          t: "Metric ton (t)",
          oz: "Ounce (oz)",
          lb: "Pound (lb)",
          st: "Stone (st)",
          ton_us: "US ton",
          ton_uk: "UK ton",
          ct: "Carat (ct)",
        },
      },
      temperature: {
        label: "Temperature",
        units: {
          c: "Celsius (°C)",
          f: "Fahrenheit (°F)",
          k: "Kelvin (K)",
        },
      },
      area: {
        label: "Area",
        units: {
          mm2: "Square millimeter (mm²)",
          cm2: "Square centimeter (cm²)",
          m2: "Square meter (m²)",
          ha: "Hectare (ha)",
          km2: "Square kilometer (km²)",
          in2: "Square inch (in²)",
          ft2: "Square foot (ft²)",
          yd2: "Square yard (yd²)",
          acre: "Acre",
          mi2: "Square mile (mi²)",
        },
      },
      volume: {
        label: "Volume",
        units: {
          ml: "Milliliter (ml)",
          cl: "Centiliter (cl)",
          l: "Liter (l)",
          m3: "Cubic meter (m³)",
          cm3: "Cubic centimeter (cm³)",
          tsp: "Teaspoon",
          tbsp: "Tablespoon",
          floz_us: "Fluid ounce (US)",
          cup_us: "Cup (US)",
          pt_us: "Pint (US)",
          qt_us: "Quart (US)",
          gal_us: "Gallon (US)",
          gal_uk: "Gallon (UK)",
          in3: "Cubic inch (in³)",
          ft3: "Cubic foot (ft³)",
        },
      },
      speed: {
        label: "Speed",
        units: {
          mps: "Meter/second (m/s)",
          kmph: "Kilometer/hour (km/h)",
          mph: "Mile/hour (mph)",
          knot: "Knot",
          fps: "Foot/second (ft/s)",
          mach: "Mach",
        },
      },
      time: {
        label: "Time",
        units: {
          ns: "Nanosecond (ns)",
          us: "Microsecond (µs)",
          ms: "Millisecond (ms)",
          s: "Second (s)",
          min: "Minute (min)",
          h: "Hour (h)",
          day: "Day",
          week: "Week",
          month: "Month (avg)",
          year: "Year",
        },
      },
      pressure: {
        label: "Pressure",
        units: {
          pa: "Pascal (Pa)",
          kpa: "Kilopascal (kPa)",
          mpa: "Megapascal (MPa)",
          bar: "Bar",
          mbar: "Millibar (mbar)",
          atm: "Atmosphere (atm)",
          psi: "PSI",
          torr: "Torr",
          mmhg: "mmHg",
        },
      },
      energy: {
        label: "Energy",
        units: {
          j: "Joule (J)",
          kj: "Kilojoule (kJ)",
          cal: "Calorie (cal)",
          kcal: "Kilocalorie (kcal)",
          wh: "Watt-hour (Wh)",
          kwh: "Kilowatt-hour (kWh)",
          ev: "Electronvolt (eV)",
          btu: "BTU",
          ftlb: "Foot-pound (ft·lb)",
        },
      },
      power: {
        label: "Power",
        units: {
          mw_milli: "Milliwatt (mW)",
          w: "Watt (W)",
          kw: "Kilowatt (kW)",
          mw: "Megawatt (MW)",
          hp: "Horsepower (hp)",
          hp_metric: "Metric HP (PS)",
          btuh: "BTU/hour",
        },
      },
      force: {
        label: "Force",
        units: {
          n: "Newton (N)",
          kn: "Kilonewton (kN)",
          dyn: "Dyne (dyn)",
          kgf: "Kilogram-force (kgf)",
          lbf: "Pound-force (lbf)",
        },
      },
      torque: {
        label: "Torque",
        units: {
          nm: "Newton-meter (N·m)",
          knm: "Kilonewton-meter (kN·m)",
          kgfm: "Kilogram-force-meter",
          lbfft: "Pound-foot (lbf·ft)",
          lbfin: "Pound-inch (lbf·in)",
        },
      },
      frequency: {
        label: "Frequency",
        units: {
          hz: "Hertz (Hz)",
          khz: "Kilohertz (kHz)",
          mhz: "Megahertz (MHz)",
          ghz: "Gigahertz (GHz)",
          rpm: "RPM",
        },
      },
      angle: {
        label: "Angle",
        units: {
          deg: "Degree (°)",
          rad: "Radian (rad)",
          grad: "Gradian (grad)",
          arcmin: "Arcminute (′)",
          arcsec: "Arcsecond (″)",
          turn: "Turn",
        },
      },
      data: {
        label: "Digital data",
        units: {
          b: "Bit (bit)",
          B: "Byte (Byte)",
          kb: "Kilobit (kb)",
          kB: "Kilobyte (kB)",
          mb: "Megabit (Mb)",
          mB: "Megabyte (MB)",
          gb: "Gigabit (Gb)",
          gB: "Gigabyte (GB)",
          tb: "Terabit (Tb)",
          tB: "Terabyte (TB)",
          kib: "Kibibit (Kib)",
          kiB: "Kibibyte (KiB)",
          miB: "Mebibyte (MiB)",
          giB: "Gibibyte (GiB)",
          tiB: "Tebibyte (TiB)",
        },
      },
    },
    input: {
      amountLabel: "Input amount",
      resultLabel: "Converted result",
      swap: "Swap units",
      copy: "Copy result",
      copied: "Copied",
      search: "Search category...",
      noResult: "No category found",
    },
    page: {
      title: "Unit converter tool",
      description:
        "Enter a value, pick a category and units, and instantly see the high-precision result.",
    },
  },
};

export const unitConverterContent = { fa, en };

export type UnitConverterToolContent = Locale;

export function useUnitConverterContent(): UnitConverterToolContent {
  const { locale } = useLanguage();
  return unitConverterContent[locale];
}
