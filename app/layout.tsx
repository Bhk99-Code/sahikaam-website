import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/BottomNav";
import { OfferBar } from "@/components/OfferBar";
import { headers } from "next/headers";
import { getUser, ALL_ACCESS_COUNT } from "@/lib/data";
import { ADMIN_EMAILS } from "@/lib/env";
import { SITE_URL, SUPPORT_EMAIL } from "@/lib/env";
import { BUSINESS } from "@/lib/business";
import { JsonLd } from "@/components/JsonLd";
import { WhatsAppFloat } from "@/components/SocialLinks";
import Script from "next/script";

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

const DESCRIPTION = `SahiKaam (Sahi Kaam) — ${ALL_ACCESS_COUNT} business books, 500+ business ideas in Hindi and English: manufacturing, contractor, government tender, solar, food, agro, PMEGP loan and more, with real Indian numbers and a step-by-step roadmap.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SahiKaam (Sahi Kaam) — Business ebooks in Hindi & English | Ideas, numbers and roadmaps", template: "%s | SahiKaam" },
  description: DESCRIPTION,
  applicationName: "SahiKaam",
  keywords: ["SahiKaam", "Sahi Kaam", "sahikaam.com", "business ideas in Hindi", "business books Hindi", "manufacturing business ideas", "how to become a contractor", "how to win government tenders", "PMEGP loan", "solar business", "food processing business", "small business ideas India"],
  alternates: { canonical: "/" },
  openGraph: { siteName: "SahiKaam", locale: "en_IN", type: "website", url: "/", title: `SahiKaam (Sahi Kaam) — ${ALL_ACCESS_COUNT} business books in Hindi & English`, description: DESCRIPTION, images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "SahiKaam — business books in Hindi and English" }] },
  twitter: { card: "summary_large_image", title: `SahiKaam (Sahi Kaam) — ${ALL_ACCESS_COUNT} business books in Hindi & English`, description: DESCRIPTION, images: ["/og.jpg"] },
  // Search Console / Bing Webmaster codes come from env vars, so they can be added without a code change
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION } : undefined,
  },
};
export const viewport: Viewport = { themeColor: "#F4F4F1", width: "device-width", initialScale: 1 };

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
  if (headers().get("x-admin-area") === "1") {
    return (
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400..800&family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        </head>
        <body className="font-sans antialiased">{children}</body>
      </html>
    );
  }
  const isAdmin = Boolean(user?.email && ADMIN_EMAILS.includes(user.email));
  const landing = headers().get("x-landing") === "1";
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400..800&family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <JsonLd data={ORG} />
      </head>
      <body className="font-sans antialiased">
        {FB_PIXEL_ID && (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">{`
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${FB_PIXEL_ID}');fbq('track','PageView');
            `}</Script>
            <noscript><img height="1" width="1" style={{display:"none"}} src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`} alt="" /></noscript>
          </>
        )}
        {!landing && <OfferBar />}
        <Header signedIn={Boolean(user)} isAdmin={isAdmin} compact={landing} />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
        {!landing && <BottomNav />}
        {!landing && <WhatsAppFloat />}
      </body>
    </html>
  );
}
