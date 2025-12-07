// app/tools/audio-editor/page.tsx
import type { Metadata } from "next";
import AudioEditor from "./AudioEditor";

// متادیتای فارسی و انگلیسی
import faMeta from "@/data/meta/fameta.json" assert { type: "json" };
import enMeta from "@/data/meta/enmeta.json" assert { type: "json" };

// کلید متادیتا برای این ابزار
const KEY = "tools/audio-editor" as const;

// فعلاً فارسی را به‌عنوان زبان اصلی سئو استفاده می‌کنیم
const fa = (faMeta as any)[KEY];
const en = (enMeta as any)[KEY];

// متادیتای Next.js
export const metadata: Metadata = {
  title: fa.title,
  description: fa.description,
  alternates: {
    canonical: fa.canonical,
  },
  openGraph: {
    title: fa.ogTitle ?? fa.title,
    description: fa.ogDescription ?? fa.description,
    url: fa.canonical,
    type: "website",
  },
};

// تابع کمکى برای JSON‑LD این ابزار
function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: fa.title.replace(/\s*\|\s*Tools Manager$/, ""),
    description: fa.description,
    url: fa.canonical,
    applicationCategory: fa.applicationCategory ?? "UtilitiesApplication",
    inLanguage: fa.inLanguage ?? "fa-IR",
    provider: {
      "@type": "Organization",
      name: "Tools Manager",
      url: "https://toolsmanager.yuozarseip.top",
    },
  };
}

export default function Page() {
  const jsonLd = buildJsonLd();

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <AudioEditor />
    </div>
  );
}
