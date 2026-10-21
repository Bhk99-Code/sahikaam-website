import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/env";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white pb-28 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-[20px] font-extrabold"><span className="text-brand-500">Sahi</span>Kaam</p>
          <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-ink-4">
            Practical business ebooks aur courses — Hindi aur English mein, Indian business ke liye.
          </p>
          <p className="mt-3 text-[14px] text-ink-4">Email: <a className="font-semibold text-brand-600" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
        </div>
        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-ink-3">Explore</p>
          <ul className="space-y-2 text-[14px] text-ink-2">
            <li><Link href="/books" className="hover:text-brand-600">All Ebooks</Link></li>
            <li><Link href="/library" className="hover:text-brand-600">My Library</Link></li>
            <li><Link href="/help" className="hover:text-brand-600">Help Center</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">Contact Us</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.18em] text-ink-3">Policies</p>
          <ul className="space-y-2 text-[14px] text-ink-2">
            <li><Link href="/terms" className="hover:text-brand-600">Terms &amp; Conditions</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link></li>
            <li><Link href="/refund-policy" className="hover:text-brand-600">Refund &amp; Cancellation</Link></li>
            <li><Link href="/delivery-policy" className="hover:text-brand-600">Delivery Policy</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-5 text-center text-[13px] text-ink-5">© {new Date().getFullYear()} SahiKaam. All rights reserved.</p>
    </footer>
  );
}
