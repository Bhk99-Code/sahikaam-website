import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function Terms() {
  return (
    <Policy title="Terms & Conditions">
      <p className="text-[13px] text-fog">Last updated: {BUSINESS.updated}</p>
      <p>This website is operated under the SahiKaam brand by {BUSINESS.legalName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the website or buying a product you agree to these terms.</p>
      <h2>1. Products</h2>
      <p>We sell digital ebooks and bundles. Nothing is shipped. After purchase, the product is available to read online in &ldquo;My library&rdquo; in your account.</p>
      <h2>2. Your account</h2>
      <p>You are responsible for keeping access to your email secure. An account is for one person only; sharing an account is not allowed and may lead to access being removed.</p>
      <h2>3. Licence and copyright</h2>
      <ul>
        <li>All content is the copyright of SahiKaam. You receive a licence for personal, non-commercial use only.</li>
        <li>Copying the content, sharing screenshots or recordings, reselling or publishing it is not allowed.</li>
        <li>The reader blocks copying, printing and screenshots where the device allows it.</li>
      </ul>
      <h2>4. Prices and payment</h2>
      <p>All prices are in Indian Rupees (INR) and include applicable taxes. Payments are processed by Razorpay; we never store your card or bank details.</p>
      <h2>5. Information disclaimer</h2>
      <p>Our products provide educational information. They are not legal, financial or investment advice. Do your own research and consult a professional before starting any business. We are not responsible for any loss.</p>
      <h2>6. Refunds</h2>
      <p>Refunds follow our <a href="/refund-policy">Refund &amp; Cancellation Policy</a>.</p>
      <h2>7. Governing law</h2>
      <p>These terms are governed by the laws of India, and any dispute falls under the jurisdiction of the Indian courts.</p>
      <h2>8. Contact</h2>
      <p>{SUPPORT_EMAIL}</p>
    </Policy>
  );
}
