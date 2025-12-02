'use client';

import { useState, useEffect } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';
import { UAParser } from 'ua-parser-js';
import { Chrome, Cpu, Smartphone, Globe, Layers, Copy, Check } from 'lucide-react';

export default function UserAgentTool() {
  const theme = useThemeColors();
  const [info, setInfo] = useState<any>(null);
  const [uaString, setUaString] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const parser = new UAParser();
    
    if (typeof navigator !== 'undefined' && (navigator as any).userAgentData) {
      (navigator as any).userAgentData
        .getHighEntropyValues(['platformVersion'])
        .then((ua: any) => {
          if ((navigator as any).userAgentData.platform === 'Windows') {
            const majorPlatformVersion = parseInt(ua.platformVersion.split('.')[0]);
            if (majorPlatformVersion >= 13) {
              setInfo((prev: any) => 
                prev ? { ...prev, os: { ...prev.os, name: 'Windows', version: '11' } } : null
              );
            }
          }
        })
        .catch(() => {});
    }

    setInfo(parser.getResult());
    setUaString(navigator.userAgent);
  }, []);

  const copyUA = () => {
    navigator.clipboard.writeText(uaString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!info) return null;

  return (
    <div className="grid gap-8">
      <div className={`p-6 rounded-3xl border shadow-sm relative overflow-hidden group ${theme.card} ${theme.border}`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold ${theme.textMuted}`}>رشته User Agent خام</h3>
          <button 
            onClick={copyUA}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-green-100 text-green-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800'}`}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'کپی شد' : 'کپی'}
          </button>
        </div>
        <code className={`block font-mono text-sm break-all leading-relaxed ${theme.text}`}>
          {uaString}
        </code>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard 
          icon={Chrome} 
          title="مرورگر" 
          value={`${info.browser.name || 'ناشناس'} ${info.browser.version || ''}`} 
          sub={`موتور: ${info.engine.name || '?'} ${info.engine.version || ''}`}
          theme={theme} 
          color="text-blue-500"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <InfoCard 
          icon={Layers} 
          title="سیستم عامل" 
          value={`${info.os.name || 'ناشناس'} ${info.os.version || ''}`} 
          sub={info.cpu.architecture ? `معماری: ${info.cpu.architecture}` : ''}
          theme={theme} 
          color="text-purple-500"
          bgColor="bg-purple-50 dark:bg-purple-900/20"
        />
        <InfoCard 
          icon={Smartphone} 
          title="دستگاه" 
          value={info.device.model || 'PC / Laptop'} 
          sub={`${info.device.vendor || ''} ${info.device.type || 'Desktop'}`}
          theme={theme} 
          color="text-orange-500"
          bgColor="bg-orange-50 dark:bg-orange-900/20"
        />
        <InfoCard 
          icon={Cpu} 
          title="پردازنده (CPU)" 
          value={info.cpu.architecture || 'Default'} 
          sub={`${typeof window !== 'undefined' ? window.navigator.hardwareConcurrency : '?'} هسته‌ای`}
          theme={theme} 
          color="text-green-500"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
      </div>

      <div className={`p-6 rounded-3xl border ${theme.card} ${theme.border}`}>
        <h3 className={`font-bold mb-4 flex items-center gap-2 ${theme.text}`}>
          <Globe size={20} /> اطلاعات تکمیلی
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
           <DetailItem label="زبان مرورگر" value={navigator.language} theme={theme} />
           <DetailItem label="وضعیت آنلاین" value={navigator.onLine ? '✅ آنلاین' : '❌ آفلاین'} theme={theme} />
           <DetailItem label="کوکی فعال؟" value={navigator.cookieEnabled ? 'بله' : 'خیر'} theme={theme} />
           <DetailItem label="سایز صفحه" value={`${typeof window !== 'undefined' ? window.screen.width : 0} x ${typeof window !== 'undefined' ? window.screen.height : 0}`} theme={theme} />
           <DetailItem label="عمق رنگ" value={`${typeof window !== 'undefined' ? window.screen.colorDepth : 0}-bit`} theme={theme} />
           <DetailItem label="پلتفرم" value={navigator.platform} theme={theme} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, value, sub, theme, color, bgColor }: any) {
  return (
    <div className={`p-6 rounded-3xl border flex flex-col items-center text-center gap-3 transition-transform hover:scale-[1.02] ${theme.card} ${theme.border}`}>
      <div className={`p-4 rounded-2xl ${bgColor} ${color} mb-1`}>
        <Icon size={32} />
      </div>
      <h4 className={`text-xs font-bold opacity-60 ${theme.textMuted}`}>{title}</h4>
      <div className={`text-xl font-black ${theme.text}`}>{value}</div>
      {sub && <div className={`text-xs px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 ${theme.textMuted}`}>{sub}</div>}
    </div>
  );
}

function DetailItem({ label, value, theme }: any) {
  return (
    <div className="flex justify-between items-center border-b border-dashed pb-2 last:border-0 border-zinc-200 dark:border-zinc-800">
      <span className={`text-sm ${theme.textMuted}`}>{label}</span>
      <span className={`font-mono font-bold dir-ltr ${theme.text}`}>{value}</span>
    </div>
  );
}
