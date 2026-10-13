import type { Metadata } from "next";
import type { ReactNode } from "react";
import { bilingualPageMetadata } from "@/lib/seo";

export const metadata: Metadata = bilingualPageMetadata({
  path: "/contact",
  faTitle: "تماس با QodeForge",
  enTitle: "Contact QodeForge",
  faDescription: "راه‌های تماس با تیم QodeForge برای بازخورد، پیشنهاد و گزارش مشکل.",
  enDescription: "Contact the QodeForge team with feedback, suggestions or bug reports.",
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}

