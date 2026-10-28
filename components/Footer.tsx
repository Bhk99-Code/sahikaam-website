import Link from "next/link";
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from "@/lib/env";
import { BUSINESS } from "@/lib/business";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="on-navy mt-20 border-t border-ink/[0.07] bg-night pb-28 md:pb-0">
      <div className="container-x grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-fog">
            Practical business ebooks for Indian founders — real numbers, permissions and funding, in Hindi and English.
          </p>
          <p className="mt-4 text-[14px] text-fog">
            <a className="font-semibold text-cream hover:text-saffron-400" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            {SUPPORT_WHATSAPP && <> · <a className="font-semibold text-cream hover:text-saffron-400" href={`https://wa.me/${SUPPORT_WHATSAPP}`}>WhatsApp</a></>}
          </p>
        </div>
        <FooterCol title="Explore" links={[["/books", "All ebooks"], ["/book/all-access", "All Access Pass"], ["/library", "My library"], ["/help", "Help center"]]} />
        <FooterCol title="Policies" links={[["/terms", "Terms & conditions"], ["/privacy", "Privacy policy"], ["/refund-policy", "Refund & cancellation"], ["/delivery-policy", "Delivery policy"], ["/contact", "Contact us"]]} />
      </div>
      <p className="border-t border-ink/[0.07] py-5 text-center text-[12px] text-fog-2">
        © {new Date().getFullYear()} SahiKaam · Operated by {BUSINESS.legalName}, {BUSINESS.address}
      </p>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2.5 text-[14px]">
        {links.map(([href, label]) => (
          <li key={href}><Link href={href} className="text-cream-2 hover:text-saffron-400">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
