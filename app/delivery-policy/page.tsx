import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Delivery Policy" };

export default function Delivery() {
  return (
    <Policy title="Shipping & Delivery Policy">
      <p className="text-[13px] text-ink-5">Last updated: {BUSINESS.updated}</p>
      <p>SahiKaam sirf digital products bechta hai. Koi physical shipping nahi hoti aur koi delivery charge nahi lagta.</p>
      <h2>Delivery kaise hoti hai</h2>
      <ul>
        <li>Payment successful hote hi product aapke account ki <b>My Library</b> mein turant aa jata hai.</li>
        <li>Kabhi-kabhi bank confirmation mein 15 minute tak lag sakte hain.</li>
        <li>Product website par login karke kisi bhi device ke browser mein padha/dekha ja sakta hai.</li>
      </ul>
      <p>Delivery mein dikkat ho to <a className="text-brand-600" href="/help">Help Center</a> se sampark karein.</p>
    </Policy>
  );
}
