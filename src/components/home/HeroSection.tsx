// components/home/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const theme = useThemeColors();
  const { t } = useLanguage();

  return (
    <div className="text-center mb-20 space-y-6 pt-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-4xl md:text-6xl font-black tracking-tight leading-tight ${theme.text}`}
      >
        {t('home.hero.titleLine1')}
        <br className="hidden md:block" />
        <span
          className={`bg-clip-text text-transparent bg-gradient-to-r ${theme.gradient}`}
        >
          {t('home.hero.titleHighlight')}
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-lg md:text-xl max-w-2xl mx-auto leading-relaxed transition-colors duration-300 ${theme.textMuted}`}
      >
        {t('home.hero.subtitle')}
      </motion.p>
    </div>
  );
}
