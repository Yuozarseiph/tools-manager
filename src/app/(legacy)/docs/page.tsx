import LegacyRedirect from "@/components/LegacyRedirect";
export const metadata = { alternates: { canonical: "https://qodeforge.ir/fa/docs" }, robots: { index: false, follow: true } };
export default function Page() { return <LegacyRedirect path="/docs" />; }
