import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/env";
import { CATEGORY } from "@/lib/format";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { SocialLinks } from "./SocialLinks";

const FEATURES: [string, string, string][] = [
  ["bolt", "Instant access", "Your ebook is in your library the moment you pay."],
  ["globe", "Hindi + English", "Every language edition is included, now and later."],
  ["library", "Read anywhere", "Phone, tablet or computer. No app to install."],
  ["refund", "Refund protection", "Charged twice or the book won't open? We refund you."],
];

export function Footer() {
  const cats = Object.entries(CATEGORY).filter(([k]) => k !== "bundle").slice(0, 8);
  return (
    <footer className="on-navy mt-24 bg-night pb-28 md:pb-0">
      <div className="container-x">
        {/* Features */}
        <ul className="grid gap-px overflow-hidden rounded-b-[28px] bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(([icon, t, d]) => (
            <li key={t} className="flex items-start gap-4 bg-night-2 p-6">
              <span className="icon-tile"><Icon name={icon} size={20} strokeWidth={2} /></span>
              <span><span className="block font-display text-[17px] font-bold text-cream">{t}</span><span className="mt-1 block text-[13.5px] leading-snug text-fog">{d}</span></span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-fog">
              SahiKaam (Sahi Kaam) — practical business ebooks for Indian founders: real numbers, permissions and funding, in Hindi and English.
            </p>
            <p className="mt-4 text-[14px]">
              <a className="font-semibold text-cream hover:text-[#FF6A3D]" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
            <div className="mt-4"><SocialLinks /></div>
          </div>
          <FooterCol title="Explore" links={[["/books", "All ebooks"], ["/books?cat=bundle", "Bundles"], ["/book/all-access", "All Access Pass"], ["/library", "My library"], ["/help", "Help center"]]} />
          <FooterCol title="Topics" links={cats.map(([k, c]) => [`/books?cat=${k}`, c.label] as [string, string])} />
          <FooterCol title="Policies" links={[["/terms", "Terms & conditions"], ["/privacy", "Privacy policy"], ["/refund-policy", "Refund & cancellation"], ["/delivery-policy", "Delivery policy"], ["/contact", "Contact us"]]} />
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 py-6 text-[12.5px] text-fog-2 sm:flex-row">
          <p>© {new Date().getFullYear()} SahiKaam · sahikaam.com</p>
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"><span>UPI</span><span>Cards</span><span>Net banking</span><span>Wallets</span><span className="text-fog">· Secured by Razorpay</span></p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2.5 text-[14px]">
        {links.map(([href, label]) => (
          <li key={href + label}><Link href={href} className="text-cream-2 transition hover:text-[#FF6A3D]">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
