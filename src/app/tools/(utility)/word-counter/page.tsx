// app/tools/(utility)/word-counter/page.tsx
import type { Metadata } from "next";
import WordCounterClient from "./WordCounter";
import { getWordCounterSeo } from "./content";

// سئوی هر دو زبان
const fa = getWordCounterSeo("fa");
const en = getWordCounterSeo("en");

// ترکیب فارسی + انگلیسی برای Meta
const combinedTitle = `${fa.title} / ${en.title}`;
const combinedDescription = `${fa.description} / ${en.description}`;
const canonicalUrl = fa.canonical;

export const metadata: Metadata = {
  title: combinedTitle,
  description: combinedDescription,
  alternates: {
    canonical: canonicalUrl,
    languages: {
      "fa-IR": fa.canonical,
      "en-US": en.canonical,
    },
  },
  openGraph: {
    title: `${fa.ogTitle ?? fa.title} / ${en.ogTitle ?? en.title}`,
    description: `${fa.ogDescription ?? fa.description} / ${en.ogDescription ?? en.description}`,
    url: canonicalUrl,
    type: "website",
    locale: "fa_IR",
    alternateLocale: ["en_US"],
  },
};

function buildJsonLd() {
  const baseProvider = {
    "@type": "Organization",
    name: "Tools Manager",
    url: "https://toolsmanager.yuozarseip.top",
  };

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: fa.title.replace(/\s*\|\s*Tools Manager$/, ""),
      description: fa.description,
      url: fa.canonical,
      applicationCategory: fa.applicationCategory ?? "ProductivityApplication",
      inLanguage: fa.inLanguage ?? "fa-IR",
      provider: baseProvider,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: en.title.replace(/\s*\|\s*Tools Manager$/, ""),
      description: en.description,
      url: en.canonical,
      applicationCategory: en.applicationCategory ?? "ProductivityApplication",
      inLanguage: en.inLanguage ?? "en-US",
      provider: baseProvider,
    },
  ];
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
      <WordCounterClient />
    </div>
  );
}
