"use client";

import HeroSection from "@/components/home/HeroSection";
import ToolsGrid from "@/components/home/ToolsGrid";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function Home() {
  const theme = useThemeColors();

  return (
    <div className={`min-h-screen font-sans ${theme.bg}`}>
      <div className="w-full pb-16">
        <HeroSection />
        <ToolsGrid />
      </div>
    </div>
  );
}
