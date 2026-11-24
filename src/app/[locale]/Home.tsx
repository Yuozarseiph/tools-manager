"use client";

import HeroSection from "@/features/home/HeroSection";
import ToolsGrid from "@/features/home/ToolsGrid";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function Home() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen font-sans ${theme.bg}`}>
      <div className="flow-root w-full pb-16 sm:block">
        <HeroSection />
        <ToolsGrid />
      </div>
    </div>
  );
}
