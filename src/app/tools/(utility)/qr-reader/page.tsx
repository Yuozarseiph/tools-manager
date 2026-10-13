import type { Metadata } from "next";
import QrReaderClient from "./QrReader";
import { getQrReaderSeo } from "./content";

const fa = getQrReaderSeo("fa");
const en = getQrReaderSeo("en");
const canonicalUrl = fa.canonical;

export const metadata: Metadata = {
  title: `${fa.title} / ${en.title}`,
  description: `${fa.description} / ${en.description}`,
  alternates: {
    canonical: canonicalUrl,
    languages: { "fa-IR": `${fa.canonical}?lang=fa`, "en-US": en.canonical },
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
      <QrReaderClient />
    </div>
  );
}

