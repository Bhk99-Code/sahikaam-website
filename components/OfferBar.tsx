import Link from "next/link";

/** Thin promo strip above the header. */
export function OfferBar() {
  return (
    <Link href="/book/all-access" className="block bg-brand-gradient px-4 py-2 text-center text-[13px] font-bold text-night">
      Launch offer: every ebook in Hindi &amp; English for ₹5,999 — save ₹2,998 <span aria-hidden="true">→</span>
    </Link>
  );
}
