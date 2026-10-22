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
  title: { default: "SahiKaam — Practical business ebooks for India", template: "%s | SahiKaam" },
  description: "Manufacturing, low-investment and contracting business ebooks with real Indian numbers, permissions and funding — in Hindi and English.",
  openGraph: { siteName: "SahiKaam", locale: "en_IN", type: "website", images: ["/covers/manufacturing-50.jpg"] },
};
export const viewport: Viewport = { themeColor: "#0A1230", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
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
