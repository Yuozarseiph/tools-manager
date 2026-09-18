"use client";

import HeroSection from "@/components/home/HeroSection";
import ToolsGrid from "@/components/home/ToolsGrid";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function Home() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen font-sans ${theme.bg}`}>
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <HeroSection />
        <ToolsGrid />
      </main>
    </div>
  );
}
