import "@/app/globals.css";
export const metadata = { robots: { index: false, follow: true } };
export default function Layout({ children }: { children: React.ReactNode }) {
 return <html lang="fa" dir="rtl"><body>{children}</body></html>;
}
