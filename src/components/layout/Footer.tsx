// components/layout/Footer.tsx
'use client';

import Link from 'next/link';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const theme = useThemeColors();
  const { t } = useLanguage();

  return (
    <footer className={`border-t ${theme.border} ${theme.card}`}>
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className={`text-sm text-center ${theme.textMuted}`}>
          {t('footer.text')}
        </p>
        <div
          className={`flex items-center gap-6 text-sm font-bold ${theme.textMuted}`}
        >
          <Link
            href="/docs"
            className="hover:text-blue-500 transition-colors"
          >
            {t('footer.links.docs')}
          </Link>
          <Link
            href="/contact"
            className="hover:text-blue-500 transition-colors"
          >
            {t('footer.links.contact')}
          </Link>
          <Link
            href="/privacy"
            className="hover:text-blue-500 transition-colors"
          >
            {t('footer.links.privacy')}
          </Link>
        </div>
      </div>
    </footer>
  );
}
