// components/layout/Footer.tsx
import Link from 'next/link';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function Footer() {
  const theme = useThemeColors();
  return (
    <footer className={`border-t ${theme.border} ${theme.card}`}>
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className={`text-sm text-center ${theme.textMuted}`}>
          ساخته شده با ❤️ در ایران. © 1404 - تمام حقوق محفوظ است.
        </p>
        <div className={`flex items-center gap-6 text-sm font-bold ${theme.textMuted}`}>
          <Link href="/docs" className="hover:text-blue-500 transition-colors">مستندات</Link>
          <Link href="/contact" className="hover:text-blue-500 transition-colors">تماس</Link>
          <Link href="/privacy" className="hover:text-blue-500 transition-colors">حریم خصوصی</Link>
        </div>
      </div>
    </footer>
  );
}
