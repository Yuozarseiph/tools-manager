// components/tools/Base64Tool.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { ArrowLeftRight, Copy, Trash2, Check, AlertCircle } from 'lucide-react';

export default function Base64Tool() {
  const theme = useThemeColors();
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // توابع امن برای تبدیل UTF-8 (چون btoa معمولی فارسی رو ساپورت نمیکنه)
  const utf8_to_b64 = (str: string) => {
    try {
      return window.btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      return '';
    }
  };

  const b64_to_utf8 = (str: string) => {
    try {
      return decodeURIComponent(escape(window.atob(str)));
    } catch (e) {
      throw new Error('فرمت Base64 نامعتبر است');
    }
  };

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      if (mode === 'encode') {
        const result = utf8_to_b64(input);
        setOutput(result);
        setError(null);
      } else {
        const result = b64_to_utf8(input);
        setOutput(result);
        setError(null);
      }
    } catch (err) {
      setError('ورودی معتبر نیست (Invalid Base64)');
      setOutput('');
    }
  }, [input, mode]);

  const handleSwap = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setInput(output); // خروجی قبلی میشه ورودی جدید
    setOutput(''); 
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-[600px]">
      
      {/* بخش ورودی */}
      <div className={`flex flex-col rounded-3xl border overflow-hidden shadow-sm ${theme.card} ${theme.border}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.border} ${theme.bg}`}>
          <div className="flex items-center gap-4">
            <span className={`font-bold ${theme.text}`}>
              {mode === 'encode' ? 'متن ساده (Text)' : 'کد Base64'}
            </span>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300`}>
              ورودی
            </div>
          </div>
          <button onClick={() => setInput('')} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? "متن خود را اینجا بنویسید..." : "کد Base64 را اینجا وارد کنید..."}
          className={`flex-1 w-full p-6 resize-none focus:outline-none bg-transparent text-lg leading-relaxed font-mono ${theme.text}`}
        />
      </div>

      {/* دکمه جابجایی وسط (برای موبایل وسط، برای دسکتاپ وسط شناور) */}
      <div className="flex lg:hidden justify-center -my-3 z-10">
        <button onClick={handleSwap} className={`p-3 rounded-full shadow-xl ${theme.primary}`}>
          <ArrowLeftRight size={24} />
        </button>
      </div>

      {/* بخش خروجی */}
      <div className={`flex flex-col rounded-3xl border overflow-hidden shadow-sm relative ${theme.card} ${theme.border}`}>
        
        {/* دکمه جابجایی شناور دسکتاپ */}
        <button 
          onClick={handleSwap}
          className={`hidden lg:flex absolute -right-10 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full shadow-xl transition-transform hover:scale-110 active:scale-95 ${theme.primary}`}
          title="جابجایی ورودی و خروجی"
        >
          <ArrowLeftRight size={24} />
        </button>

        <div className={`flex items-center justify-between px-6 py-4 border-b ${theme.border} ${theme.bg}`}>
          <div className="flex items-center gap-4">
            <span className={`font-bold ${theme.text}`}>
              {mode === 'encode' ? 'کد Base64' : 'متن ساده (Text)'}
            </span>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300`}>
              خروجی
            </div>
          </div>
          <button 
            onClick={() => { navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            disabled={!output}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors
              ${copied ? 'bg-green-500 text-white' : output ? theme.secondary : 'opacity-50 cursor-not-allowed'}
            `}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'کپی شد' : 'کپی نتیجه'}
          </button>
        </div>

        <div className={`flex-1 p-6 relative ${theme.bg === 'bg-zinc-950' ? 'bg-[#111]' : 'bg-zinc-50/50'}`}>
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-red-500 animate-pulse">
              <AlertCircle size={48} className="mb-4" />
              <p className="font-bold text-lg">{error}</p>
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              className={`w-full h-full resize-none bg-transparent focus:outline-none font-mono text-lg leading-relaxed ${theme.text} ${!output && 'opacity-50'}`}
              placeholder="نتیجه اینجا نمایش داده می‌شود..."
            />
          )}
        </div>
      </div>

    </div>
  );
}
