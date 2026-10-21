import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Refund & Cancellation Policy" };

export default function Refund() {
  return (
    <Policy title="Refund & Cancellation Policy">
      <p className="text-[13px] text-ink-5">Last updated: {BUSINESS.updated}</p>
      <p>Hamare sabhi products digital hain aur khareedte hi turant mil jaate hain. Isliye order cancel nahi kiya ja sakta aur access milne ke baad aam taur par refund nahi diya jata.</p>
      <h2>In cases mein refund milega</h2>
      <ul>
        <li>Ek hi product ke liye payment do baar kat gaya ho.</li>
        <li>Payment ho gaya par {BUSINESS.refundDays} din ke andar bhi product aapki Library mein nahi aaya aur hamari team theek nahi kar payi.</li>
        <li>Technical kharabi ki wajah se product khul hi nahi raha aur hum use theek nahi kar paaye.</li>
      </ul>
      <h2>Refund kaise maangein</h2>
      <p>Payment ke {BUSINESS.refundDays} din ke andar {SUPPORT_EMAIL} par apna registered email, order/payment ID aur samasya likh kar bhejein.</p>
      <h2>Refund kab milega</h2>
      <p>Approve hone par refund usi payment method mein 5–7 working days mein wapas aata hai (bank par nirbhar).</p>
    </Policy>
  );
}
