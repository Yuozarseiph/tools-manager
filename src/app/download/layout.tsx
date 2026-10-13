import type { Metadata } from "next";
import type { ReactNode } from "react";
import { bilingualPageMetadata } from "@/lib/seo";

export const metadata: Metadata = bilingualPageMetadata({
  path: "/download",
  faTitle: "دانلود QodeForge",
  enTitle: "Download QodeForge",
  faDescription: "نصب QodeForge به‌عنوان وب‌اپلیکیشن پیش‌رونده برای دسترسی سریع‌تر به ابزارها.",
  enDescription: "Install QodeForge as a progressive web app for faster access to its tools.",
});

export default function DownloadLayout({ children }: { children: ReactNode }) {
  return children;
}

