import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/env";

export const metadata: Metadata = { title: "Contact Us" };

export default function Contact() {
  return (
    <Policy title="Contact Us">
      <p>For any question, payment issue or feedback, get in touch. We usually reply within 24–48 working hours.</p>
      <h2>Business details</h2>
      <ul>
        <li><b>Brand:</b> SahiKaam</li>
        <li><b>Operated by:</b> {BUSINESS.legalName}</li>
        <li><b>Address:</b> {BUSINESS.address}</li>
        <li><b>Email:</b> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
        <li><b>Phone:</b> {BUSINESS.phone}</li>
        {SUPPORT_WHATSAPP && <li><b>WhatsApp:</b> <a href={`https://wa.me/${SUPPORT_WHATSAPP}`}>Chat with us</a></li>}
      </ul>
    </Policy>
  );
}
