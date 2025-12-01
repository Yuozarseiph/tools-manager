// components/InstallPWA.tsx
'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function InstallPWA() {
  const theme = useThemeColors();
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const onClick = (evt: any) => {
    evt.preventDefault();
    if (!promptInstall) return;
    promptInstall.prompt();
  };

  if (!supportsPWA) return null;

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl font-bold text-sm animate-bounce
      ${theme.primary} text-white`}
    >
      <Download size={20} />
      نصب اپلیکیشن
    </button>
  );
}
