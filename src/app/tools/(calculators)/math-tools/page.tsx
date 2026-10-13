import type { Metadata } from "next";
import MathToolsClient from "./MathTools";
import { getMathToolsSeo } from "./content";

const fa = getMathToolsSeo("fa");
const en = getMathToolsSeo("en");

export const metadata: Metadata = {
  title: `${fa.title} / ${en.title}`,
  description: `${fa.description} / ${en.description}`,
  alternates: {
    canonical: fa.canonical,
    languages: {
      "fa-IR": `${fa.canonical}?lang=fa`,
      "en-US": `${en.canonical}?lang=en`,
    },
  },
  openGraph: {
    title: `${fa.ogTitle ?? fa.title} / ${en.ogTitle ?? en.title}`,
    description: `${fa.ogDescription ?? fa.description} / ${
      en.ogDescription ?? en.description
    }`,
    url: fa.canonical,
    type: "website",
    locale: "fa_IR",
    alternateLocale: ["en_US"],
  },
};

export default function Page() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: fa.title.replace(/\s*\|\s*QodeForge$/, ""),
      description: fa.description,
      url: fa.canonical,
      applicationCategory: "UtilityApplication",
      inLanguage: "fa-IR",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: en.title.replace(/\s*\|\s*QodeForge$/, ""),
      description: en.description,
      url: en.canonical,
      applicationCategory: "UtilityApplication",
      inLanguage: "en-US",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MathToolsClient />
    </>
  );
}

