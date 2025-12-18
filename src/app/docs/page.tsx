// app/docs/page.tsx
import type { Metadata } from "next";
import DocsClient from "./Docs";
import { getDocsSeo } from "./content";
const fa = getDocsSeo("fa");
const en = getDocsSeo("en");
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
      "@type": "WebPage",
      name: fa.title.replace(/\s*\|\s*Tools Manager$/, ""),
      description: fa.description,
      url: fa.canonical,
      inLanguage: fa.inLanguage ?? "fa-IR",
      about: "Tools Manager documentation (Persian)",
      provider: baseProvider,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: en.title.replace(/\s*\|\s*Tools Manager$/, ""),
      description: en.description,
      url: en.canonical,
      inLanguage: en.inLanguage ?? "en-US",
      about: "Tools Manager documentation (English)",
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
      <DocsClient />
    </div>
  );
}
