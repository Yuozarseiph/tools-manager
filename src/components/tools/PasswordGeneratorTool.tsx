// components/tools/PasswordGeneratorTool.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { Copy, RefreshCw, Check, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PasswordGeneratorTool() {
  const theme = useThemeColors();
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);

  const generate = () => {
    const sets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=',
    };
    
    let chars = '';
    if (options.uppercase) chars += sets.uppercase;
    if (options.lowercase) chars += sets.lowercase;
    if (options.numbers) chars += sets.numbers;
    if (options.symbols) chars += sets.symbols;

    if (!chars) return setPassword('');

    let pass = '';
    for (let i = 0; i < length; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setCopied(false);
  };

  // تولید اولیه
  useEffect(() => { generate(); }, [length, options]);

  const strength = Object.values(options).filter(Boolean).length;
  const strengthColor = strength < 2 ? 'bg-red-500' : strength < 4 ? 'bg-yellow-500' : 'bg-green-500';
  const StrengthIcon = strength < 3 ? ShieldAlert : ShieldCheck;

  return (
    <div className={`max-w-2xl mx-auto rounded-3xl border p-8 shadow-xl ${theme.card} ${theme.border}`}>
      
      {/* نمایشگر پسورد */}
      <div className={`relative flex items-center justify-between p-6 rounded-2xl border-2 mb-8 transition-all ${theme.bg} ${copied ? 'border-green-500' : theme.border}`}>
        <span className="font-mono text-2xl md:text-3xl break-all font-bold tracking-wider">{password}</span>
        
        <div className="flex gap-2 ml-4 shrink-0">
          <button onClick={generate} className={`p-3 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors`} title="تولید مجدد">
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={() => { navigator.clipboard.writeText(password); setCopied(true); }} 
            className={`p-3 rounded-xl text-white transition-all active:scale-95 ${copied ? 'bg-green-500' : theme.primary}`}
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>
        
        {/* نوار قدرت */}
        <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${strengthColor}`} style={{ width: `${(strength / 4) * 100}%` }} />
      </div>

      {/* تنظیمات */}
      <div className="space-y-6">
        
        {/* اسلایدر طول */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="font-bold">طول رمز عبور</label>
            <span className={`px-3 py-1 rounded-lg font-mono font-bold ${theme.secondary}`}>{length}</span>
          </div>
          <input 
            type="range" min="4" max="64" value={length} 
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* چک باکس ها */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'uppercase', label: 'حروف بزرگ (A-Z)' },
            { key: 'lowercase', label: 'حروف کوچک (a-z)' },
            { key: 'numbers', label: 'اعداد (0-9)' },
            { key: 'symbols', label: 'نمادها (!@#)' },
          ].map((opt) => (
            <label key={opt.key} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:border-blue-400 ${theme.bg} ${theme.border}`}>
              <input 
                type="checkbox" 
                checked={options[opt.key as keyof typeof options]}
                onChange={() => setOptions(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof options] }))}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
