import type { Metadata } from "next";

export const SITE_URL = "https://qodeforge.ir";

type BilingualPageSeo = {
  path: string;
  faTitle: string;
  enTitle: string;
  faDescription: string;
  enDescription: string;
};

/** Keep existing indexed paths canonical and expose language variants by query. */
export function bilingualPageMetadata({
  path,
  faTitle,
  enTitle,
  faDescription,
  enDescription,
}: BilingualPageSeo): Metadata {
  const canonical = `${SITE_URL}${path}`;

  return {
    title: `${faTitle} / ${enTitle}`,
    description: `${faDescription} ${enDescription}`,
    alternates: {
      canonical,
      languages: {
        "fa-IR": `${canonical}?lang=fa`,
        "en-US": `${canonical}?lang=en`,
        "x-default": canonical,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title: `${faTitle} / ${enTitle}`,
      description: `${faDescription} ${enDescription}`,
      siteName: "QodeForge",
      locale: "fa_IR",
      alternateLocale: ["en_US"],
    },
  };
}
