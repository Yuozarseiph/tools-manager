// components/tools/UnitConverterTool.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ArrowLeftRight, Ruler, Weight, Thermometer } from 'lucide-react';

const categories = {
  length: {
    label: 'طول',
    icon: Ruler,
    units: {
      m: { label: 'متر (m)', factor: 1 },
      km: { label: 'کیلومتر (km)', factor: 1000 },
      cm: { label: 'سانتی‌متر (cm)', factor: 0.01 },
      mm: { label: 'میلی‌متر (mm)', factor: 0.001 },
      in: { label: 'اینچ (in)', factor: 0.0254 },
      ft: { label: 'فوت (ft)', factor: 0.3048 },
      yd: { label: 'یارد (yd)', factor: 0.9144 },
      mi: { label: 'مایل (mi)', factor: 1609.34 },
    }
  },
  mass: {
    label: 'جرم / وزن',
    icon: Weight,
    units: {
      kg: { label: 'کیلوگرم (kg)', factor: 1 },
      g: { label: 'گرم (g)', factor: 0.001 },
      mg: { label: 'میلی‌گرم (mg)', factor: 0.000001 },
      lb: { label: 'پوند (lb)', factor: 0.453592 },
      oz: { label: 'اونس (oz)', factor: 0.0283495 },
    }
  },
  temperature: {
    label: 'دما',
    icon: Thermometer,
    units: {
      c: { label: 'سلسیوس (°C)', factor: 1 },
      f: { label: 'فارنهایت (°F)', factor: 1 },
      k: { label: 'کلوین (K)', factor: 1 },
    }
  },
};

export default function UnitConverterTool() {
  const theme = useThemeColors();
  const [category, setCategory] = useState<keyof typeof categories>('length');
  const [amount, setAmount] = useState<string>('1');
  const [fromUnit, setFromUnit] = useState<string>('m');
  const [toUnit, setToUnit] = useState<string>('km');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const units = Object.keys(categories[category].units);
    setFromUnit(units[0]);
    setToUnit(units[1]);
  }, [category]);

  useEffect(() => {
    const val = parseFloat(amount);
    if (isNaN(val)) { setResult(''); return; }

    let converted = 0;

    if (category === 'temperature') {
      if (fromUnit === toUnit) converted = val;
      else if (fromUnit === 'c' && toUnit === 'f') converted = (val * 9/5) + 32;
      else if (fromUnit === 'c' && toUnit === 'k') converted = val + 273.15;
      else if (fromUnit === 'f' && toUnit === 'c') converted = (val - 32) * 5/9;
      else if (fromUnit === 'f' && toUnit === 'k') converted = (val - 32) * 5/9 + 273.15;
      else if (fromUnit === 'k' && toUnit === 'c') converted = val - 273.15;
      else if (fromUnit === 'k' && toUnit === 'f') converted = (val - 273.15) * 9/5 + 32;
    } else {
      // @ts-ignore
      const fromFactor = categories[category].units[fromUnit]?.factor;
      // @ts-ignore
      const toFactor = categories[category].units[toUnit]?.factor;
      converted = (val * fromFactor) / toFactor;
    }

    setResult(Number.isInteger(converted) ? converted.toString() : converted.toFixed(4).replace(/\.?0+$/, ''));
  }, [amount, fromUnit, toUnit, category]);

  return (
    <div className={`max-w-3xl mx-auto rounded-3xl border p-6 md:p-10 shadow-xl ${theme.card} ${theme.border}`}>
      
      <div className="flex gap-2 overflow-x-auto pb-6 mb-6 border-b border-dashed custom-scrollbar" style={{ borderColor: 'inherit' }}>
        {Object.entries(categories).map(([key, cat]) => (
          <button
            key={key}
            onClick={() => setCategory(key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
              ${category === key ? `${theme.primary} shadow-lg` : `${theme.bg} ${theme.text} border ${theme.border} hover:brightness-95`}
            `}
          >            <cat.icon size={18} /> {cat.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center">
        <div className="space-y-3">
          <label className={`text-sm font-bold ${theme.textMuted}`}>مقدار ورودی</label>
          <input 
            type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
            className={`w-full p-4 text-xl font-bold rounded-2xl border focus:ring-2 ring-blue-500/50 outline-none ${theme.bg} ${theme.border} ${theme.text}`}
          />
          <select 
            value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}
            className={`w-full p-3 rounded-xl border cursor-pointer ${theme.bg} ${theme.border} ${theme.text}`}
          >
            {Object.entries(categories[category].units).map(([key, u]) => (
              <option key={key} value={key}>{u.label}</option>
            ))}
          </select>
        </div>

        <div className={`flex justify-center p-3 rounded-full ${theme.secondary}`}>
          <ArrowLeftRight size={24} className={theme.accent} />
        </div>

        <div className="space-y-3">
          <label className={`text-sm font-bold ${theme.textMuted}`}>نتیجه</label>
          <div className={`w-full p-4 text-xl font-black rounded-2xl border flex items-center bg-zinc-50 dark:bg-zinc-900/50 ${theme.border} ${theme.text}`}>
            {result || '...'}
          </div>
          <select 
            value={toUnit} onChange={(e) => setToUnit(e.target.value)}
            className={`w-full p-3 rounded-xl border cursor-pointer ${theme.bg} ${theme.border} ${theme.text}`}
          >
            {Object.entries(categories[category].units).map(([key, u]) => (
              <option key={key} value={key}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
