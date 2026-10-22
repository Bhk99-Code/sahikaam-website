import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { getUser } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SahiKaam — Business Ebooks & Courses", template: "%s | SahiKaam" },
  description: "Practical business ideas, manufacturing roadmaps aur legal business guides — Hindi aur English mein.",
  openGraph: { siteName: "SahiKaam", locale: "en_IN", type: "website" },
};
export const viewport: Viewport = { themeColor: "#EA580C", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Header signedIn={Boolean(user)} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
