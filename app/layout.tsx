import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { OfferBar } from "@/components/OfferBar";
import { getUser } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SahiKaam — Andha paisa kamane ke legal tareeke, step by step", template: "%s | SahiKaam" },
  description: "43 business books, 500+ ideas in Hindi and English — manufacturing, contracting, government tenders, solar, food, agro and more, with real Indian numbers and a step-by-step roadmap.",
  openGraph: { siteName: "SahiKaam", locale: "en_IN", type: "website", images: ["/covers/manufacturing-50.jpg"] },
};
export const viewport: Viewport = { themeColor: "#0A0A0A", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Serif+Devanagari:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <OfferBar />
        <Header signedIn={Boolean(user)} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
