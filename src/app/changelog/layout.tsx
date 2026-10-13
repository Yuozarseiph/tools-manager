import type { Metadata } from "next";
import type { ReactNode } from "react";
import { bilingualPageMetadata } from "@/lib/seo";

export const metadata: Metadata = bilingualPageMetadata({
  path: "/changelog",
  faTitle: "تغییرات QodeForge",
  enTitle: "QodeForge changelog",
  faDescription: "آخرین تغییرات، قابلیت‌ها و بهبودهای ابزارهای QodeForge.",
  enDescription: "Latest QodeForge releases, improvements and new features.",
});

export default function ChangelogLayout({ children }: { children: ReactNode }) {
  return children;
}

