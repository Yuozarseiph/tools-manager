// app/tools/(developer)/base64/page.tsx
import type { Metadata } from "next";
import Base64Client from "./Base64";
import { getBase64Seo } from "./content";

// سئوی هر دو زبان
const fa = getBase64Seo("fa");
const en = getBase64Seo("en");

// می‌توانی یکی را به‌عنوان اصلی در تایتل/دسکریپشن بگذاری
const combinedTitle = `${fa.title} / ${en.title}`;
const combinedDescription = `${fa.description} / ${en.description}`;
const canonicalUrl = fa.canonical;

// متادیتای Next.js
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
    description: `${
      fa.ogDescription ?? fa.description
    } / ${en.ogDescription ?? en.description}`,
    url: canonicalUrl,
    type: "website",
    locale: "fa_IR",
    alternateLocale: ["en_US"],
  },
};

// JSON‑LD که هر دو زبان را پوشش می‌دهد
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
      applicationCategory: fa.applicationCategory ?? "DeveloperApplication",
      inLanguage: fa.inLanguage ?? "fa-IR",
      provider: baseProvider,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: en.title.replace(/\s*\|\s*Tools Manager$/, ""),
      description: en.description,
      url: en.canonical,
      applicationCategory: en.applicationCategory ?? "DeveloperApplication",
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

      <Base64Client />
    </div>
  );
}
