// app/tools/(image)/color-picker/page.tsx
import type { Metadata } from "next";
import ColorPicker from "./ColorPicker";
import faMeta from "@/data/meta/fameta.json";
import enMeta from "@/data/meta/enmeta.json";

const KEY = "tools/color-picker" as const;

const fa = (faMeta as any)[KEY];
const en = (enMeta as any)[KEY];

// ترکیب فارسی + انگلیسی برای متا
const combinedTitle = `${fa.title} / ${en.title}`;
const combinedDescription = `${fa.description} / ${en.description}`;
const canonicalUrl = fa.canonical;

export const metadata: Metadata = {
  title: combinedTitle,
  description: combinedDescription,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: `${fa.ogTitle ?? fa.title} / ${en.ogTitle ?? en.title}`,
    description: `${fa.ogDescription ?? fa.description} / ${en.ogDescription ?? en.description}`,
    url: canonicalUrl,
    type: "website",
  },
};

// JSON-LD دو زبانه برای WebApplication
function buildJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: combinedTitle.replace(/\s*\|\s*Tools Manager$/, ""),
    description: combinedDescription,
    url: canonicalUrl,
    applicationCategory:
      fa.applicationCategory ?? "DesignApplication",
    inLanguage: [fa.inLanguage ?? "fa-IR", en.inLanguage ?? "en-US"],
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
        // تزریق JSON-LD در HTML اولیه، طبق راهنمای Next.js و گوگل،
        // روش پیشنهادی برای Structured Data در App Router است. [web:47][web:135][web:150]
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />
      <ColorPicker />
    </div>
  );
}
