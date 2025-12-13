import type { Metadata } from "next";
import PdfEditor from "./PdfEditor";
import { getPdfEditorSeo } from "./content";

export const dynamic = "force-static";

const faSeo = getPdfEditorSeo("fa");

export const metadata: Metadata = {
  title: faSeo.title,
  description: faSeo.description,
  alternates: {
    canonical: faSeo.canonical
  },
  openGraph: {
    title: faSeo.ogTitle ?? faSeo.title,
    description: faSeo.ogDescription ?? faSeo.description,
    url: faSeo.canonical,
    type: "website"
  }
};

export default function Page() {
  return <PdfEditor />;
}
