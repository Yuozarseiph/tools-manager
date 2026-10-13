import "./globals.css";
export const metadata = { title: "404 | QodeForge", robots: { index: false, follow: true } };
export default function NotFound() {
 return <html lang="fa" dir="rtl"><body><main id="main-content" className="mx-auto max-w-3xl p-10 text-center">
 <h1 className="text-3xl font-bold">صفحه پیدا نشد · Page not found</h1>
 <p className="mt-4">404</p><a href="/fa">خانه</a> · <a href="/en" lang="en">Home</a>
 </main></body></html>;
}
