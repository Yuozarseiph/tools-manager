// app/page.tsx
'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import ToolsGrid from '@/components/home/ToolsGrid';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function Home() {
  const theme = useThemeColors();

  return (
    // اینجا بک‌گراند کل بادی رو کنترل می‌کنیم
    <div className={`min-h-screen font-sans transition-colors duration-500 flex flex-col ${theme.bg}`}>
      
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-6 w-full">
        <HeroSection />
        <ToolsGrid />
      </main>

      <Footer />
      
    </div>
  );
}
