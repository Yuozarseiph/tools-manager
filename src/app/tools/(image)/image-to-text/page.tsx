import type { Metadata } from "next";
import ImageToTextClient from "./ImageToText";
import { getImageToTextSeo } from "./content";

const fa = getImageToTextSeo("fa");
const en = getImageToTextSeo("en");
const canonicalUrl = fa.canonical;

export const metadata: Metadata = {
  title: `${fa.title} / ${en.title}`,
  description: `${fa.description} / ${en.description}`,
  alternates: {
    canonical: canonicalUrl,
    languages: { "fa-IR": fa.canonical, "en-US": en.canonical },
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
  const provider = {
    "@type": "Organization",
    name: "QodeForge",
    url: "https://qodeforge.ir",
  };

  return [fa, en].map((item) => ({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: item.title.replace(/\s*\|\s*QodeForge$/, ""),
    description: item.description,
    url: item.canonical,
    applicationCategory: item.applicationCategory ?? "UtilitiesApplication",
    inLanguage: item.inLanguage,
    provider,
  }));
}

export default function Page() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd()) }}
      />
      <ImageToTextClient />
    </div>
  );
}

