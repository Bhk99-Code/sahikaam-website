import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Delivery Policy" };

export default function Delivery() {
  return (
    <Policy title="Shipping & Delivery Policy">
      <p className="text-[13px] text-fog">Last updated: {BUSINESS.updated}</p>
      <p>SahiKaam sells digital products only. Nothing is shipped and there are no delivery charges.</p>
      <h2>How delivery works</h2>
      <ul>
        <li>As soon as your payment succeeds, the product appears in <b>My library</b> in your account.</li>
        <li>Occasionally the bank confirmation takes up to 15 minutes.</li>
        <li>Sign in from any device&apos;s browser to read.</li>
      </ul>
      <p>If there is a delivery problem, contact the <a href="/help">Help center</a>.</p>
    </Policy>
  );
}
