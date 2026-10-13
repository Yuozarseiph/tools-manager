import type { Metadata } from "next";
import type { ReactNode } from "react";
import { bilingualPageMetadata } from "@/lib/seo";

export const metadata: Metadata = bilingualPageMetadata({
  path: "/privacy",
  faTitle: "حریم خصوصی QodeForge",
  enTitle: "QodeForge privacy policy",
  faDescription: "سیاست حریم خصوصی QodeForge و توضیح پردازش محلی فایل‌ها در مرورگر.",
  enDescription: "QodeForge privacy policy and details about local browser processing.",
});

export default function PrivacyLayout({ children }: { children: ReactNode }) {
  return children;
}

