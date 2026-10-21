import type { Metadata } from "next";
import { Policy } from "@/components/Policy";
import { BUSINESS } from "@/lib/business";
import { SUPPORT_EMAIL } from "@/lib/env";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function Terms() {
  return (
    <Policy title="Terms & Conditions">
      <p className="text-[13px] text-ink-5">Last updated: {BUSINESS.updated}</p>
      <p>Ye website SahiKaam brand ke naam se {BUSINESS.legalName} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) dwara chalayi jaati hai. Website use karke ya koi product khareed kar aap in terms se sehmat hote hain.</p>
      <h2>1. Products</h2>
      <p>Hum digital ebooks, video courses aur bundles bechte hain. Koi physical product ship nahi hota. Khareedne ke baad product aapke account ki &ldquo;My Library&rdquo; mein online padhne/dekhne ke liye milta hai.</p>
      <h2>2. Account</h2>
      <p>Aap apne login (email) ki suraksha ke zimmedaar hain. Ek account sirf ek vyakti ke istemal ke liye hai; account share karna mana hai aur aisa paaye jaane par access band kiya ja sakta hai.</p>
      <h2>3. Licence &amp; copyright</h2>
      <ul>
        <li>Saara content SahiKaam ki copyright property hai. Aapko sirf personal, non-commercial use ka licence milta hai.</li>
        <li>Content copy karna, screenshot/recording baantna, dobara bechna ya public post karna mana hai.</li>
        <li>Har page par aapki pehchaan ka watermark hota hai taaki leak hone par source pata chal sake.</li>
      </ul>
      <h2>4. Pricing &amp; payment</h2>
      <p>Sabhi keemtein Indian Rupees (INR) mein hain aur applicable taxes shaamil hain. Payments Razorpay ke through process hote hain; hum aapke card ya bank details store nahi karte.</p>
      <h2>5. Information disclaimer</h2>
      <p>Hamare products educational jaankari dete hain. Ye legal, financial ya investment salah nahi hai. Koi bhi business shuru karne se pehle apni research karein aur zaroorat ho to professional se salah lein. Kisi bhi nuksaan ki zimmedari hamari nahi hogi.</p>
      <h2>6. Refunds</h2>
      <p>Refunds hamari <a className="text-brand-600" href="/refund-policy">Refund &amp; Cancellation Policy</a> ke anusaar hote hain.</p>
      <h2>7. Governing law</h2>
      <p>Ye terms Bharat ke kanoon ke adheen hain. Koi bhi vivaad [CITY], Madhya Pradesh ki adalaton ke adhikaar kshetra mein hoga.</p>
      <h2>8. Contact</h2>
      <p>{SUPPORT_EMAIL} · {BUSINESS.address}</p>
    </Policy>
  );
}
