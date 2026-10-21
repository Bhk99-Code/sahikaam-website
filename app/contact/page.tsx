import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Contact Us" };

export default function Contact() {
  return (
    <Policy title="Contact Us">
      <p>Kisi bhi sawaal, payment issue ya feedback ke liye humse sampark karein. Hum aam taur par 24–48 working hours mein jawab dete hain.</p>
      <h2>Business details</h2>
      <ul>
        <li><b>Brand:</b> SahiKaam</li>
        <li><b>Operated by:</b> {BUSINESS.legalName}</li>
        <li><b>Address:</b> {BUSINESS.address}</li>
        <li><b>Email:</b> <a className="text-brand-600" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>
        <li><b>Phone:</b> {BUSINESS.phone}</li>
      </ul>
    </Policy>
  );
}
