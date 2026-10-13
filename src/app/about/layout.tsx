import type { Metadata } from "next";
import type { ReactNode } from "react";
import { bilingualPageMetadata } from "@/lib/seo";

export const metadata: Metadata = bilingualPageMetadata({
  path: "/about",
  faTitle: "درباره QodeForge",
  enTitle: "About QodeForge",
  faDescription: "درباره جعبه‌ابزار آنلاین QodeForge و رویکرد آن به سرعت و حریم خصوصی.",
  enDescription: "Learn about QodeForge, a fast and privacy-friendly online toolbox.",
});

export default function AboutLayout({ children }: { children: ReactNode }) {
  return children;
}

