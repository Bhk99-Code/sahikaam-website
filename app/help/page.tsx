import Link from "next/link";
import type { Metadata } from "next";
import { Icon } from "@/components/Icon";
import { SectionTitle } from "@/components/SectionTitle";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/env";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = { title: "Help center" };

const REQUESTS = [
  { label: "Payment issue", icon: "card", subject: "Payment issue" },
  { label: "Book not in my library", icon: "library", subject: "Book not in library" },
  { label: "Reader problem", icon: "alert", subject: "Reader problem" },
  { label: "Refund request", icon: "refund", subject: "Refund request" },
];

const FAQS = [
  { q: "I paid, but the book is not in my library", a: "Refresh the library page — bank confirmation can take 2–5 minutes. If it is still missing after 15 minutes, tap “Payment issue” and send us your payment ID." },
  { q: "How do I read my ebook?", a: "Sign in, open My library and tap “Read”. Books open in any browser on phone, tablet or computer, and your page is saved automatically." },
  { q: "How do I switch between Hindi and English?", a: "Use the language buttons in My library or at the top of the reader." },
  { q: "Can I download the PDF?", a: "No. To protect the books from piracy they open only in the SahiKaam reader — but your access never expires." },
  { q: "What is the refund policy?", a: `Because ebooks are delivered instantly, we don't refund after access. If you were charged twice or the book won't open, write to us within ${BUSINESS.refundDays} days — see the full refund policy.` },
  { q: "My sign-in code did not arrive", a: "Check your spam or promotions folder, wait a minute and tap “Send code” again. Make sure the email address is spelled correctly." },
];

export default function Help() {
  const mail = (s: string) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(s)}`;
  return (
    <div className="container-x max-w-3xl py-10 md:py-14">
      <header className="text-center">
        <h1 className="font-display text-[38px] font-extrabold tracking-tight text-cream">How can we help?</h1>
        <p className="mt-2 text-[16px] text-fog">We usually reply within a few hours, Monday to Saturday.</p>
      </header>

      <section className="mt-10">
        <div className="grid grid-cols-2 gap-3">
          {REQUESTS.map((r) => (
            <a key={r.label} href={mail(r.subject)} className="card flex h-[104px] flex-col justify-between p-4 hover:border-white/20">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-saffron-500/15 text-saffron-400"><Icon name={r.icon} size={20} strokeWidth={2} /></span>
              <span className="text-[15px] font-semibold text-cream">{r.label}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle title="Common questions" />
        <div className="card divide-y divide-white/[0.07] overflow-hidden">
          {FAQS.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-[60px] cursor-pointer list-none items-center gap-3 px-5 py-4 text-[15px] font-semibold text-cream">
                <span className="flex-1">{f.q}</span>
                <Icon name="down" size={20} className="text-fog transition group-open:rotate-180" />
              </summary>
              <p className="px-5 pb-5 text-[14px] leading-relaxed text-fog">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <SectionTitle title="Talk to us" />
        <div className="card divide-y divide-white/[0.07] overflow-hidden">
          {SUPPORT_WHATSAPP && (
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} className="flex items-center gap-4 p-5 hover:bg-white/[0.03]">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mint/15 text-mint"><Icon name="chat" /></span>
              <span className="flex-1"><b className="block text-cream">WhatsApp</b><span className="text-[13px] text-fog">Chat in Hindi or English</span></span>
              <Icon name="chevron" className="text-fog" />
            </a>
          )}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-4 p-5 hover:bg-white/[0.03]">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-saffron-500/15 text-saffron-400"><Icon name="mail" /></span>
            <span className="flex-1"><b className="block text-cream">Email</b><span className="text-[13px] text-fog">{SUPPORT_EMAIL}</span></span>
            <Icon name="chevron" className="text-fog" />
          </a>
        </div>
        <p className="mt-5 text-center text-[13px] text-fog">
          <Link href="/refund-policy" className="font-semibold text-saffron-400">Refund policy</Link> · <Link href="/terms" className="font-semibold text-saffron-400">Terms</Link> · <Link href="/contact" className="font-semibold text-saffron-400">Contact</Link>
        </p>
      </section>
    </div>
  );
}
