import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function Refund() {
  return (
    <Policy title="Refund & Cancellation Policy">
      <p className="text-[13px] text-fog">Last updated: {BUSINESS.updated}</p>
      <p>All our products are digital and delivered instantly. Orders therefore cannot be cancelled, and refunds are generally not given once access has been provided.</p>
      <h2>When you will get a refund</h2>
      <ul>
        <li>You were charged more than once for the same product.</li>
        <li>You paid, but the product did not reach your library within {BUSINESS.refundDays} days and our team could not fix it.</li>
        <li>A technical fault stops the product from opening and we could not fix it.</li>
      </ul>
      <h2>How to ask for a refund</h2>
      <p>Within {BUSINESS.refundDays} days of payment, email {SUPPORT_EMAIL} with your registered email, order or payment ID and a short description of the problem.</p>
      <h2>When the money comes back</h2>
      <p>Approved refunds go back to the original payment method within 5–7 working days, depending on your bank.</p>
    </Policy>
  );
}
