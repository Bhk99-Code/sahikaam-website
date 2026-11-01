import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { OfferBar } from "@/components/OfferBar";
import { getUser } from "@/lib/data";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/env";
import { BUSINESS } from "@/lib/business";
import { JsonLd } from "@/components/JsonLd";
import { WhatsAppFloat } from "@/components/SocialLinks";

const DESCRIPTION = "SahiKaam (Sahi Kaam) — 43 business books, 500+ business ideas in Hindi and English: manufacturing, contractor, government tender, solar, food, agro, PMEGP loan and more, with real Indian numbers and a step-by-step roadmap.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SahiKaam (Sahi Kaam) — Business books in Hindi & English | Andha paisa kamane ke legal tareeke", template: "%s | SahiKaam" },
  description: DESCRIPTION,
  applicationName: "SahiKaam",
  keywords: ["SahiKaam", "Sahi Kaam", "sahikaam.com", "business ideas in Hindi", "business books Hindi", "manufacturing business ideas", "contractor kaise bane", "government tender kaise bhare", "PMEGP loan", "solar business", "food processing business", "andha paisa", "small business ideas India"],
  alternates: { canonical: "/" },
  openGraph: { siteName: "SahiKaam", locale: "en_IN", type: "website", url: "/", title: "SahiKaam (Sahi Kaam) — 43 business books in Hindi & English", description: DESCRIPTION, images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "SahiKaam — business books in Hindi and English" }] },
  twitter: { card: "summary_large_image", title: "SahiKaam (Sahi Kaam) — 43 business books in Hindi & English", description: DESCRIPTION, images: ["/og.jpg"] },
  // Search Console / Bing Webmaster codes come from env vars, so they can be added without a code change
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
};
export const viewport: Viewport = { themeColor: "#142338", width: "device-width", initialScale: 1 };

// Who we are, for Google's knowledge panel and the sitelinks search box
const ORG = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization", "@id": `${SITE_URL}/#org`, name: "SahiKaam", alternateName: BUSINESS.altNames, url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`, email: SUPPORT_EMAIL, telephone: BUSINESS.phone, sameAs: [BUSINESS.instagram],
      contactPoint: { "@type": "ContactPoint", contactType: "customer support", telephone: BUSINESS.phone, email: SUPPORT_EMAIL, availableLanguage: ["Hindi", "English"], areaServed: "IN" },
    },
    {
      "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "SahiKaam", alternateName: BUSINESS.altNames, url: SITE_URL, inLanguage: ["en-IN", "hi-IN"],
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/books?q={search_term_string}`, "query-input": "required name=search_term_string" },
    },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700;800&family=Noto+Serif+Devanagari:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <JsonLd data={ORG} />
      </head>
      <body className="font-sans antialiased">
        <OfferBar />
        <Header signedIn={Boolean(user)} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        <BottomNav />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
