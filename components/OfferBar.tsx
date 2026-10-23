import Link from "next/link";
import { findProduct, getPlans } from "@/lib/data";
import { accessLabel, rupees } from "@/lib/format";
import { featuredCoupon } from "@/lib/pricing";

/** Thin promo strip above the header. Shorter copy on small phones so it stays on one line. */
export function OfferBar() {
  const pass = findProduct("all-access");
  if (!pass?.is_published) return null;
  const books = pass.bundle_items.length;
  const plans = getPlans(pass);
  const period = (days: number | null) => accessLabel(days).replace(" access", "").toLowerCase();
  const offer = featuredCoupon();
  if (offer) {
    return (
      <Link href="/book/all-access" className="block bg-brand-gradient px-4 py-2 text-center text-[13px] font-bold text-white">
        <span className="sm:hidden">Code {offer.code} = {offer.label} · every ebook →</span>
        <span className="hidden sm:inline">
          Use code <span className="rounded bg-white/20 px-1.5 py-0.5 tracking-wider">{offer.code}</span> for {offer.label} on every ebook · All {books} ebooks from {rupees(plans[0].price)} <span aria-hidden="true">→</span>
        </span>
      </Link>
    );
  }
  return (
    <Link href="/book/all-access" className="block bg-brand-gradient px-4 py-2 text-center text-[13px] font-bold text-white">
      <span className="sm:hidden">All {books} ebooks · from {rupees(plans[0].price)} →</span>
      <span className="hidden sm:inline">
        All Access: all {books} ebooks in Hindi &amp; English — {plans.map((p) => `${period(p.access_days)} ${rupees(p.price)}`).join(" or ")} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
