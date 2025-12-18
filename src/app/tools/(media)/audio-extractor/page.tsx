// app/tools/(media)/audio-extractor/page.tsx
import type { Metadata } from "next";
import AudioExtractorClient from "./AudioExtractor";
import { getAudioExtractorSeo } from "./content";

const fa = getAudioExtractorSeo("fa");
const en = getAudioExtractorSeo("en");

const combinedTitle = `${fa.title} / ${en.title}`;
const combinedDescription = `${fa.description} / ${en.description}`;

export const metadata: Metadata = {
  title: combinedTitle,
  description: combinedDescription,
  alternates: {
    canonical: fa.canonical,
    languages: {
      "fa-IR": fa.canonical,
      "en-US": en.canonical,
    },
  },
  openGraph: {
    title: `${fa.ogTitle ?? fa.title} / ${en.ogTitle ?? en.title}`,
    description: `${fa.ogDescription ?? fa.description} / ${en.ogDescription ?? en.description}`,
    url: fa.canonical,
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
      applicationCategory: fa.applicationCategory ?? "MultimediaApplication",
      inLanguage: fa.inLanguage ?? "fa-IR",
      provider: baseProvider,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: en.title.replace(/\s*\|\s*Tools Manager$/, ""),
      description: en.description,
      url: en.canonical,
      applicationCategory: en.applicationCategory ?? "MultimediaApplication",
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
      <AudioExtractorClient />
    </div>
  );
}
