import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/env";
import { whatsappUrl } from "@/components/SocialLinks";

export const metadata: Metadata = {
  title: "Contact Us — WhatsApp, Instagram, email",
  description: "SahiKaam (Sahi Kaam) se sampark karein — WhatsApp, Instagram @sahikaam.official, email aur phone.",
  alternates: { canonical: "/contact" },
};

export default function Contact() {
  return (
    <Policy title="Contact Us">
      <p>For any question, payment issue or feedback, get in touch. We usually reply within 24–48 working hours.</p>
      <h2>Business details</h2>
      <ul>
        <li><b>Brand:</b> SahiKaam</li>
        <li><b>Operated by:</b> {BUSINESS.legalName}</li>
        <li><b>Email:</b> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
        <li><b>Phone:</b> {BUSINESS.phone}</li>
        {SUPPORT_WHATSAPP && <li><b>WhatsApp:</b> <a href={whatsappUrl}>Chat with us</a></li>}
        <li><b>Instagram:</b> <a href={BUSINESS.instagram}>@sahikaam.official</a></li>
      </ul>
    </Policy>
  );
}
