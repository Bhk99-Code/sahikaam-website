import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { SectionTitle } from "@/components/SectionTitle";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/env";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Help Center" };

const REQUESTS = [
  { label: "Payment issue", icon: "card", subject: "Payment issue" },
  { label: "Book not in library", icon: "library", subject: "Book not in library" },
  { label: "Reader problem", icon: "alert", subject: "Reader problem" },
  { label: "Refund request", icon: "refund", subject: "Refund request" },
];

const FAQS = [
  { q: "Payment ho gaya, par book Library mein nahi dikh rahi?", a: "Library page refresh karein. Kabhi-kabhi bank se confirmation aane mein 2–5 minute lagte hain. 15 minute baad bhi na dikhe to \"Payment issue\" par click karke apna payment ID bhejein." },
  { q: "Book kaise padhein?", a: "Login karke My Library kholein aur \"Padhna Shuru Karein\" dabayein. Book phone, tablet ya computer — kisi bhi browser mein khulegi. Aapka page apne-aap save hota rehta hai." },
  { q: "Kya book download (PDF) kar sakte hain?", a: "Nahi. Hamari books copy hone se bachane ke liye sirf SahiKaam reader mein khulti hain, par aapko lifetime access milta hai." },
  { q: "Refund policy kya hai?", a: `Digital product hone ki wajah se access milne ke baad aam taur par refund nahi hota. Agar payment do baar kat gaya ya book khul hi nahi rahi, to ${BUSINESS.refundDays} din ke andar humein likhein — poori Refund Policy dekhein.` },
  { q: "Login ka code nahi aaya?", a: "Spam / Promotions folder dekhein. 1 minute baad \"Code Bhejein\" dobara dabayein. Email spelling bhi check kar lein." },
];

export default function Help() {
  const mail = (s: string) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(s)}`;
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 md:py-12">
      <header className="text-center">
        <h1 className="text-[28px] font-extrabold tracking-tight">Help Center</h1>
        <p className="mt-1 text-[15px] text-ink-4">Har sawaal ka jawab, har step par</p>
      </header>

      <section className="mt-8">
        <SectionTitle>Raise a request</SectionTitle>
        <div className="grid grid-cols-2 gap-3">
          {REQUESTS.map((r) => (
            <a key={r.label} href={mail(r.subject)} className="flex h-[96px] flex-col justify-between rounded-card border border-line bg-white p-4 hover:shadow-card">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-50 text-brand-600"><Icon name={r.icon} size={18} strokeWidth={2} /></span>
              <span className="text-[14px] font-semibold">{r.label}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle>Frequent questions</SectionTitle>
        <div className="overflow-hidden rounded-card border border-line bg-white">
          {FAQS.map((f) => (
            <details key={f.q} className="group border-b border-[#EFEFF2] last:border-0">
              <summary className="flex min-h-[56px] cursor-pointer list-none items-center gap-3 px-4 py-3 text-[15px] font-semibold">
                <span className="flex-1">{f.q}</span>
                <Icon name="down" size={20} className="transition group-open:rotate-180" />
              </summary>
              <p className="px-4 pb-4 text-[14px] leading-relaxed text-ink-4">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle>Need more help?</SectionTitle>
        <div className="overflow-hidden rounded-card border border-line bg-white">
          {SUPPORT_WHATSAPP && (
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} className="flex items-center gap-4 border-b border-[#EFEFF2] p-4 hover:bg-mist">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-green-50 text-green-700"><Icon name="chat" /></span>
              <span className="flex-1"><b className="block">WhatsApp Support</b><span className="text-[13px] text-ink-5">Hindi ya English mein baat karein</span></span>
              <Icon name="chevron" />
            </a>
          )}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-4 p-4 hover:bg-mist">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600"><Icon name="mail" /></span>
            <span className="flex-1"><b className="block">Email us</b><span className="text-[13px] text-ink-5">{SUPPORT_EMAIL}</span></span>
            <Icon name="chevron" />
          </a>
        </div>
        <p className="mt-4 text-center text-[13px] text-ink-5">
          <Link href="/refund-policy" className="font-semibold text-brand-600">Refund Policy</Link> · <Link href="/terms" className="font-semibold text-brand-600">Terms</Link> · <Link href="/contact" className="font-semibold text-brand-600">Contact</Link>
        </p>
      </section>
    </div>
  );
}
