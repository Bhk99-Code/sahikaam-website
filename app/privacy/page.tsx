import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Privacy() {
  return (
    <Policy title="Privacy Policy">
      <p className="text-[13px] text-ink-5">Last updated: {BUSINESS.updated}</p>
      <h2>Hum kya information lete hain</h2>
      <ul>
        <li><b>Account:</b> aapka email address (login ke liye).</li>
        <li><b>Orders:</b> kya khareeda, kitne mein, kab, aur Razorpay ka payment/order ID.</li>
        <li><b>Usage:</b> aap kis page tak padh chuke hain, taaki wahi se dobara khule.</li>
      </ul>
      <p>Card, UPI ya bank details Razorpay collect karta hai — wo hamare server par kabhi nahi aati.</p>
      <h2>Istemal kaise hota hai</h2>
      <ul>
        <li>Aapko khareeda hua content dene ke liye.</li>
        <li>Order, payment aur support se jude messages bhejne ke liye.</li>
        <li>Content ki chori rokne ke liye (watermark mein masked email).</li>
      </ul>
      <h2>Kiske saath share hoti hai</h2>
      <p>Sirf service providers ke saath jo website chalane mein madad karte hain: Razorpay (payments), Supabase (database aur login), Vercel (hosting). Hum aapka data bechte nahi hain.</p>
      <h2>Aapke adhikaar</h2>
      <p>Apna data dekhne, sudharne ya account delete karwane ke liye {SUPPORT_EMAIL} par likhein.</p>
      <h2>Cookies</h2>
      <p>Hum sirf zaroori cookies use karte hain jo aapko logged-in rakhti hain.</p>
    </Policy>
  );
}
