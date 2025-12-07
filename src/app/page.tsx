// app/page.tsx
"use client";

import HeroSection from "@/components/home/HeroSection";
import ToolsGrid from "@/components/home/ToolsGrid";
import { useThemeColors } from "@/hooks/useThemeColors";

export default function Home() {
  const theme = useThemeColors();

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-500 flex flex-col ${theme.bg}`}
    >
      <main className="flex-1 max-w-5xl mx-auto px-6 w-full">
        <HeroSection />
        <ToolsGrid />
      </main>
    </div>
  );
}
